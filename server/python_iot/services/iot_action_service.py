import asyncio
import json
import random
import time
from datetime import datetime
from uuid import uuid4, UUID
from typing import Dict, List, Any
import logging

# Assuming these are imported from our other files
from models.iot_devices import ExecutionStatus, DeviceStatus, DeviceType
from socket_emitter import emit_iot_action_triggered, emit_iot_action_update, emit_iot_device_status

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ActionSimulationService:
    def __init__(self, db_session, mapping_config_path: str):
        self.db = db_session
        self.mappings = self._load_mappings(mapping_config_path)
        self.is_running = False

    def _load_mappings(self, path: str) -> Dict[str, Any]:
        with open(path, 'r') as f:
            return json.load(f)

    async def start_kafka_consumer(self):
        """Mock Kafka consumer for 'threat_events' topic"""
        self.is_running = True
        logger.info("Kafka Consumer started on topic 'threat_events'...")
        
        # In a real app, this would be:
        # consumer = AIOKafkaConsumer("threat_events", ...)
        # async for msg in consumer:
        #     await self.process_threat_event(json.loads(msg.value))
        
        while self.is_running:
            # Simulate waiting for an event
            await asyncio.sleep(60) # Prevent tight loop in demo
            pass

    async def process_threat_event(self, event: Dict[str, Any]):
        """
        Processes a threat event and triggers mapped IoT actions.
        Example event: {"threat_id": "T123", "type": "FIRE_DETECTED", "location": "Floor 3"}
        """
        threat_type = event.get("type")
        threat_id = event.get("threat_id")
        
        if threat_type not in self.mappings:
            logger.warning(f"No mapping found for threat type: {threat_type}")
            return

        actions = self.mappings[threat_type]
        logger.info(f"Triggering {len(actions)} actions for threat {threat_type}")

        # Trigger all mapped actions in parallel
        tasks = [self.execute_iot_action(action, threat_id) for action in actions]
        await asyncio.gather(*tasks)

    async def execute_iot_action(self, action_config: Dict[str, Any], threat_id: str):
        device_type = action_config["device_type"]
        command = action_config["command"]
        delay_ms = action_config.get("delay_ms", 1000)

        # 1. Find relevant devices (in a real app, filter by location too)
        # For simulation, we'll trigger all devices of that type linked to this threat
        devices = await self._get_devices_by_type(device_type)
        
        for device in devices:
            action_id = uuid4()
            start_time = time.time()

            # Create PENDING log
            await self._log_action(
                action_id=action_id,
                device_id=device.device_id,
                threat_id=threat_id,
                command=command,
                status=ExecutionStatus.PENDING
            )
            
            # Emit Socket.io event
            await emit_iot_action_triggered({
                "action_id": str(action_id),
                "device_id": str(device.device_id),
                "command": command,
                "status": ExecutionStatus.PENDING
            })

            # 2. Simulate Execution Status: EXECUTING
            await asyncio.sleep(0.5) # Immediate feedback delay
            await self._update_action_status(action_id, ExecutionStatus.EXECUTING)
            await emit_iot_action_update(str(action_id), ExecutionStatus.EXECUTING)

            # 3. Simulate Realistic Duration
            # The spec asks for specific durations: HVAC 3-5s, Door 0.5-1s, etc.
            # We use delay_ms from config or override here
            duration_s = delay_ms / 1000.0
            await asyncio.sleep(duration_s)

            # 4. Handle Failure (10% random, 0% for life-critical)
            is_life_critical = device_type in [DeviceType.OXYGEN_VALVE, DeviceType.BACKUP_POWER, DeviceType.FIRE_SUPPRESSION]
            failure_roll = random.random()
            
            if not is_life_critical and failure_roll < 0.10:
                final_status = ExecutionStatus.FAILED
                notes = "Hardware communication timeout"
            else:
                final_status = ExecutionStatus.SUCCESS
                notes = "Command acknowledged by local controller"

            # 5. Finalize Log and Device Status
            response_time = int((time.time() - start_time) * 1000)
            await self._finalize_action(
                action_id=action_id,
                device_id=device.device_id,
                status=final_status,
                response_time=response_time,
                notes=notes,
                command=command
            )

            # Emit final updates
            await emit_iot_action_update(str(action_id), final_status, response_time)
            if final_status == ExecutionStatus.SUCCESS:
                # Map command to status (simplified)
                new_status = self._map_command_to_status(command)
                await self._update_device_status(device.device_id, new_status, command)
                await emit_iot_device_status(str(device.device_id), new_status, command)

    async def _get_devices_by_type(self, device_type: str) -> List[Any]:
        # Implementation depends on DB ORM (SQLAlchemy)
        # return self.db.query(IotDeviceModel).filter(IotDeviceModel.device_type == device_type).all()
        return [] # Placeholder

    async def _log_action(self, action_id, device_id, threat_id, command, status):
        # Insert into iot_action_logs
        pass

    async def _update_action_status(self, action_id, status):
        # Update iot_action_logs
        pass

    async def _finalize_action(self, action_id, device_id, status, response_time, notes, command):
        # Final update to iot_action_logs
        pass

    async def _update_device_status(self, device_id, status, command):
        # Update iot_devices
        pass

    def _map_command_to_status(self, command: str) -> DeviceStatus:
        cmd = command.upper()
        if "LOCK" in cmd and "UN" not in cmd: return DeviceStatus.LOCKED
        if "UNLOCK" in cmd or "DISENGAGE" in cmd: return DeviceStatus.UNLOCKED
        if "SHUT OFF" in cmd or "DISABLE" in cmd: return DeviceStatus.STANDBY
        if "ACTIVATE" in cmd or "INCREASE" in cmd or "SWITCH" in cmd: return DeviceStatus.ACTIVE
        return DeviceStatus.ONLINE
