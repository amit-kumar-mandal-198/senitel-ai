from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, ARRAY, JSON, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class DeviceType(str, Enum):
    HVAC = "HVAC"
    DOOR_LOCK = "DOOR_LOCK"
    LIGHTING = "LIGHTING"
    ELEVATOR = "ELEVATOR"
    OXYGEN_VALVE = "OXYGEN_VALVE"
    BACKUP_POWER = "BACKUP_POWER"
    CAMERA = "CAMERA"
    NURSE_CALL = "NURSE_CALL"
    INFUSION_PUMP_NETWORK = "INFUSION_PUMP_NETWORK"
    FIRE_SUPPRESSION = "FIRE_SUPPRESSION"

class DeviceStatus(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    ACTIVE = "ACTIVE"
    STANDBY = "STANDBY"
    LOCKED = "LOCKED"
    UNLOCKED = "UNLOCKED"
    EXECUTING = "EXECUTING"
    ERROR = "ERROR"

class ExecutionStatus(str, Enum):
    PENDING = "PENDING"
    EXECUTING = "EXECUTING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

# --- SQLAlchemy Models ---

class IotDeviceModel(Base):
    __tablename__ = "iot_devices"
    
    device_id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    device_name = Column(String, nullable=False)
    device_type = Column(SQLEnum(DeviceType), nullable=False)
    location = Column(String, nullable=False)
    current_status = Column(SQLEnum(DeviceStatus), default=DeviceStatus.ONLINE)
    last_action = Column(String)
    last_action_timestamp = Column(DateTime, default=datetime.utcnow)
    is_manual_override = Column(Boolean, default=False)
    linked_threat_types = Column(ARRAY(String))

class IotActionLogModel(Base):
    __tablename__ = "iot_action_logs"
    
    action_id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    device_id = Column(PG_UUID(as_uuid=True), ForeignKey("iot_devices.device_id"))
    threat_id = Column(String)
    command_sent = Column(String, nullable=False)
    execution_status = Column(String, nullable=False)
    response_time_ms = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(String)

class IotOverrideLogModel(Base):
    __tablename__ = "iot_override_logs"
    
    override_id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    device_id = Column(PG_UUID(as_uuid=True), ForeignKey("iot_devices.device_id"))
    operator_id = Column(String, nullable=False)
    command_sent = Column(String, nullable=False)
    previous_status = Column(SQLEnum(DeviceStatus), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

# --- Pydantic Schemas ---

class IotDeviceSchema(BaseModel):
    device_id: UUID
    device_name: str
    device_type: DeviceType
    location: str
    current_status: DeviceStatus
    last_action: Optional[str] = None
    last_action_timestamp: Optional[datetime] = None
    is_manual_override: bool = False
    linked_threat_types: List[str] = []

    class Config:
        from_attributes = True

class ActionLogSchema(BaseModel):
    action_id: UUID
    device_id: UUID
    threat_id: Optional[str] = None
    command_sent: str
    execution_status: ExecutionStatus
    response_time_ms: Optional[int] = None
    timestamp: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class OverrideRequest(BaseModel):
    device_id: UUID
    operator_id: str
    command: str
    target_status: DeviceStatus
