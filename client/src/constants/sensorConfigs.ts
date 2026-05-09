import { SensorConfig } from '../types/maintenance';

export const SENSORS: SensorConfig[] = [
  {
    sensorId: 'PIPE_F2_MAIN',
    name: 'Floor 2 Main Water Pressure',
    unit: 'PSI',
    normalMin: 55,
    normalMax: 75,
    criticalThreshold: 40,
    location: 'Floor 2 Utility',
    floor: 2
  },
  {
    sensorId: 'SMOKE_F3_CORR',
    name: 'Floor 3 Corridor Smoke PPM',
    unit: 'PPM',
    normalMin: 0,
    normalMax: 10,
    criticalThreshold: 50,
    location: 'Floor 3 Corridor B',
    floor: 3
  },
  {
    sensorId: 'ELEV_MOTOR_1',
    name: 'Elevator 1 Motor Temp',
    unit: '°C',
    normalMin: 40,
    normalMax: 65,
    criticalThreshold: 95,
    location: 'Elevator Shaft',
    floor: null
  },
  {
    sensorId: 'HVAC_FILTER_1',
    name: 'HVAC Filter Airflow',
    unit: 'CFM',
    normalMin: 300,
    normalMax: 500,
    criticalThreshold: 150,
    location: 'Rooftop Unit A',
    floor: null
  },
  {
    sensorId: 'BOILER_TEMP_1',
    name: 'Boiler Water Temperature',
    unit: '°C',
    normalMin: 70,
    normalMax: 85,
    criticalThreshold: 110,
    location: 'Basement Boiler Room',
    floor: 0
  },
  {
    sensorId: 'STRUCT_VIB_P1',
    name: 'Parking Level Vibration',
    unit: 'mm/s',
    normalMin: 0,
    normalMax: 2,
    criticalThreshold: 10,
    location: 'Parking Level P1',
    floor: -1
  },
  {
    sensorId: 'FIRE_SYS_PSI',
    name: 'Sprinkler System Pressure',
    unit: 'PSI',
    normalMin: 100,
    normalMax: 175,
    criticalThreshold: 60,
    location: 'Central Fire Room',
    floor: 0
  },
  {
    sensorId: 'GENSET_FUEL_1',
    name: 'Backup Generator Fuel Level',
    unit: '%',
    normalMin: 20,
    normalMax: 100,
    criticalThreshold: 10,
    location: 'Generator Room',
    floor: 0
  }
];
