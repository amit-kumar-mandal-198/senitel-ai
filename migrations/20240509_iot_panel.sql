-- AEGIS Health: IoT Action Simulation Panel Migration
-- PostgreSQL + TimescaleDB

-- 1. IoT Devices Registry
CREATE TYPE device_type AS ENUM (
    'HVAC', 'DOOR_LOCK', 'LIGHTING', 'ELEVATOR', 
    'OXYGEN_VALVE', 'BACKUP_POWER', 'CAMERA', 
    'NURSE_CALL', 'INFUSION_PUMP_NETWORK', 
    'FIRE_SUPPRESSION'
);

CREATE TYPE device_status AS ENUM (
    'ONLINE', 'OFFLINE', 'ACTIVE', 'STANDBY', 
    'LOCKED', 'UNLOCKED', 'EXECUTING', 'ERROR'
);

CREATE TABLE iot_devices (
    device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name TEXT NOT NULL,
    device_type device_type NOT NULL,
    location TEXT NOT NULL,
    current_status device_status DEFAULT 'ONLINE',
    last_action TEXT,
    last_action_timestamp TIMESTAMPTZ,
    is_manual_override BOOLEAN DEFAULT FALSE,
    linked_threat_types TEXT[] -- Array of threat types that trigger this device
);

-- 2. IoT Action Logs (Append-only audit trail)
CREATE TABLE iot_action_logs (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES iot_devices(device_id),
    threat_id TEXT, -- ID from the threat_events topic
    command_sent TEXT NOT NULL,
    execution_status TEXT NOT NULL, -- PENDING, EXECUTING, SUCCESS, FAILED
    response_time_ms INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- 3. IoT Threat Mappings (Configurable rules)
CREATE TABLE iot_threat_mappings (
    mapping_id SERIAL PRIMARY KEY,
    threat_type TEXT NOT NULL UNIQUE,
    actions JSONB NOT NULL -- List of {device_type, command, delay_ms}
);

-- 4. IoT Override Logs (Human overrides)
CREATE TABLE iot_override_logs (
    override_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES iot_devices(device_id),
    operator_id TEXT NOT NULL,
    command_sent TEXT NOT NULL,
    previous_status device_status NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Seed Data: 12 Realistic Hospital IoT Devices
INSERT INTO iot_devices (device_name, device_type, location, current_status, linked_threat_types) VALUES
('HVAC Unit — ICU Floor 3', 'HVAC', 'ICU Floor 3', 'ONLINE', '{"FIRE_DETECTED", "RANSOMWARE_ATTACK"}'),
('Main Entrance Double Locks', 'DOOR_LOCK', 'Main Lobby Floor 1', 'LOCKED', '{"UNAUTHORIZED_PHYSICAL_ACCESS", "POWER_FAILURE"}'),
('Corridor B Emergency Lights', 'LIGHTING', 'Radiology Floor 2', 'STANDBY', '{"FIRE_DETECTED", "POWER_FAILURE"}'),
('Elevator 4 (Service)', 'ELEVATOR', 'West Wing', 'ONLINE', '{"FIRE_DETECTED", "POWER_FAILURE", "UNAUTHORIZED_PHYSICAL_ACCESS"}'),
('ICU Oxygen Flow Control', 'OXYGEN_VALVE', 'ICU Floor 3', 'ACTIVE', '{"POWER_FAILURE"}'),
('Basement Generator G1', 'BACKUP_POWER', 'Basement Utility', 'STANDBY', '{"POWER_FAILURE"}'),
('CCTV 049 — Pharmacy Entrance', 'CAMERA', 'Pharmacy Floor 1', 'ONLINE', '{"UNAUTHORIZED_PHYSICAL_ACCESS", "PATIENT_ELOPEMENT"}'),
('Nurse Station Alert System', 'NURSE_CALL', 'Emergency Ward Floor 1', 'ONLINE', '{"FIRE_DETECTED", "PATIENT_ELOPEMENT"}'),
('ICU Infusion Pump Net Hub', 'INFUSION_PUMP_NETWORK', 'ICU Floor 3', 'ONLINE', '{"RANSOMWARE_ATTACK"}'),
('Server Room 1 Fire Suppression', 'FIRE_SUPPRESSION', 'Data Center Floor 4', 'STANDBY', '{"FIRE_DETECTED"}'),
('Lab B Biohazard Door', 'DOOR_LOCK', 'Pathology Floor 2', 'LOCKED', '{"UNAUTHORIZED_PHYSICAL_ACCESS"}'),
('MRI Suite Cooling HVAC', 'HVAC', 'Radiology Floor 2', 'ONLINE', '{"POWER_FAILURE"}');
