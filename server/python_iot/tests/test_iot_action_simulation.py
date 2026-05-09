import pytest
import asyncio
import json
from unittest.mock import MagicMock, AsyncMock
from uuid import uuid4

# Import our services (relative imports depend on test placement)
from services.iot_action_service import ActionSimulationService
from models.iot_devices import DeviceType, ExecutionStatus

@pytest.mark.asyncio
async def test_fire_detected_full_lifecycle():
    """
    Test Deliverable 12: Fire Detection Integration Test
    1. Fires a FIRE_DETECTED threat event
    2. Asserts that HVAC, door locks, and elevators all received correct commands
    3. Asserts that the action log contains entries for all expected devices
    """
    
    # 1. SETUP MOCKS
    mock_db = MagicMock()
    # Mocking the _get_devices_by_type method to return test devices
    test_devices = {
        DeviceType.HVAC: [MagicMock(device_id=uuid4(), device_name="HVAC 1")],
        DeviceType.DOOR_LOCK: [MagicMock(device_id=uuid4(), device_name="Door 1")],
        DeviceType.ELEVATOR: [MagicMock(device_id=uuid4(), device_name="Elevator 1")],
        DeviceType.FIRE_SUPPRESSION: [MagicMock(device_id=uuid4(), device_name="Fire Sup 1")],
        DeviceType.LIGHTING: [MagicMock(device_id=uuid4(), device_name="Lights 1")],
        DeviceType.NURSE_CALL: [MagicMock(device_id=uuid4(), device_name="Nurse Call 1")]
    }

    service = ActionSimulationService(mock_db, "config/threat_action_mappings.json")
    
    # Override internal methods with mocks to track calls
    service._get_devices_by_type = AsyncMock(side_effect=lambda t: test_devices.get(t, []))
    service._log_action = AsyncMock()
    service._finalize_action = AsyncMock()
    service._update_device_status = AsyncMock()

    # 2. TRIGGER THREAT EVENT
    threat_event = {
        "threat_id": "TEST-FIRE-001",
        "type": "FIRE_DETECTED",
        "location": "ICU Floor 3"
    }
    
    await service.process_threat_event(threat_event)

    # 3. ASSERTS
    
    # Verify all expected device types were queried
    expected_types = [
        DeviceType.HVAC, DeviceType.DOOR_LOCK, DeviceType.ELEVATOR, 
        DeviceType.FIRE_SUPPRESSION, DeviceType.LIGHTING, DeviceType.NURSE_CALL
    ]
    for d_type in expected_types:
        service._get_devices_by_type.assert_any_call(d_type)

    # Verify logging was called for each device
    # (6 device types in mapping * 1 device per type in our mock = 6 calls)
    assert service._log_action.call_count == 6
    
    # Check specific command sent to HVAC
    hvac_call = next(call for call in service._log_action.call_args_list if "SHUT OFF" in call.args or "SHUT OFF" in call.kwargs.values())
    assert hvac_call is not None
    
    # Check specific command sent to Elevator
    elevator_call = next(call for call in service._log_action.call_args_list if "LOCK TO GROUND FLOOR" in call.args or "LOCK TO GROUND FLOOR" in call.kwargs.values())
    assert elevator_call is not None

    # Verify finalize was called for all
    assert service._finalize_action.call_count == 6
    
    print("✅ Integration test passed: All automated actions triggered correctly for FIRE_DETECTED scenario.")

if __name__ == "__main__":
    asyncio.run(test_fire_detected_full_lifecycle())
