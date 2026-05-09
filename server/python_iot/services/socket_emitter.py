import socketio
import os
import logging

logger = logging.getLogger(__name__)

# In a real setup, this connects to the Socket.io server (or uses a Redis manager)
# For this simulation, we'll assume a local client or manager setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

async def emit_iot_action_triggered(data: dict):
    """Event: iot:action_triggered"""
    logger.info(f"Socket Emit: iot:action_triggered -> {data['action_id']}")
    await sio.emit("iot:action_triggered", data)

async def emit_iot_action_update(action_id: str, status: str, response_time: int = None):
    """Event: iot:action_update"""
    logger.info(f"Socket Emit: iot:action_update -> {action_id} ({status})")
    await sio.emit("iot:action_update", {
        "action_id": action_id,
        "status": status,
        "response_time_ms": response_time
    })

async def emit_iot_device_status(device_id: str, status: str, last_action: str):
    """Event: iot:device_status"""
    logger.info(f"Socket Emit: iot:device_status -> {device_id} ({status})")
    await sio.emit("iot:device_status", {
        "device_id": device_id,
        "status": status,
        "last_action": last_action,
        "timestamp": os.getenv("CURRENT_TIME") # In real app, datetime.utcnow()
    })

async def emit_iot_override_applied(data: dict):
    """Event: iot:override_applied"""
    logger.info(f"Socket Emit: iot:override_applied -> {data['device_id']}")
    await sio.emit("iot:override_applied", data)
