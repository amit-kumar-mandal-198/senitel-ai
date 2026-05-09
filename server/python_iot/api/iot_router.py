from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from uuid import UUID
from datetime import datetime

from models.iot_devices import IotDeviceSchema, ActionLogSchema, OverrideRequest, DeviceStatus
# from database import get_db # Assuming DB setup exists

router = APIRouter(prefix="/api/v1/iot", tags=["IoT"])

@router.get("/devices", response_model=List[IotDeviceSchema])
async def get_iot_devices():
    """Returns all registered IoT devices and their current status."""
    # devices = db.query(IotDeviceModel).all()
    # return devices
    return []

@router.get("/actions", response_model=List[ActionLogSchema])
async def get_action_logs(limit: int = 50):
    """Returns the most recent IoT action logs for the audit trail."""
    # logs = db.query(IotActionLogModel).order_by(IotActionLogModel.timestamp.desc()).limit(limit).all()
    # return logs
    return []

@router.post("/override")
async def manual_override(request: OverrideRequest = Body(...)):
    """
    Manually overrides an IoT device state.
    Sets is_manual_override = True and logs the operator action.
    """
    # 1. Fetch device
    # device = db.query(IotDeviceModel).filter(IotDeviceModel.device_id == request.device_id).first()
    # if not device: raise HTTPException(404, "Device not found")

    # 2. Capture current state for history
    # prev_status = device.current_status

    # 3. Apply override
    # device.current_status = request.target_status
    # device.last_action = f"MANUAL OVERRIDE: {request.command}"
    # device.last_action_timestamp = datetime.utcnow()
    # device.is_manual_override = True

    # 4. Log override
    # override_log = IotOverrideLogModel(
    #     device_id=request.device_id,
    #     operator_id=request.operator_id,
    #     command_sent=request.command,
    #     previous_status=prev_status
    # )
    # db.add(override_log)
    # db.commit()

    # 5. Emit Socket.io event
    # await emit_iot_override_applied({
    #     "device_id": str(request.device_id),
    #     "operator_id": request.operator_id,
    #     "status": request.target_status
    # })

    return {"status": "success", "message": f"Manual override applied to {request.device_id}"}

@router.post("/test-trigger/{threat_type}")
async def test_trigger_threat(threat_type: str):
    """Debug endpoint to simulate an incoming threat event."""
    # simulation_service.process_threat_event({
    #     "threat_id": f"TEST-{int(datetime.utcnow().timestamp())}",
    #     "type": threat_type,
    #     "location": "Simulated Environment"
    # })
    return {"status": "triggered", "threat": threat_type}
