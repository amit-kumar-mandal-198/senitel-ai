export type TicketStatus = "open" | "acknowledged" | "in_progress" | "resolved" | "prevented";
export type TicketSeverity = "low" | "medium" | "high" | "critical";
export type SimulationMode = "normal" | "drifting" | "spike" | "critical";

export interface SensorConfig {
  sensorId: string;
  name: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  criticalThreshold: number;
  location: string;
  floor: number | null;
}

export interface SensorReading {
  sensorId: string;
  value: number;
  timestamp: number;
  isAnomaly: boolean;
  drift: number;
}

export interface SensorBaseline {
  sensorId: string;
  baselineValue: number;
  lastUpdated: number;
  readingCount: number;
}

export interface DriftConfig {
  mode: SimulationMode;
  driftStartValue?: number;
  driftRate?: number; // per hour
  driftDirection?: "up" | "down";
  lastModeChange?: number;
}

export interface MaintenanceTicket {
  ticketId: string;
  sensorId: string;
  sensorName: string;
  location: string;
  severity: TicketSeverity;
  status: TicketStatus;
  title: string;
  description: string;
  aiReasoning: string;
  trendSummary: string;
  estimatedTimeToFailure: string;
  recommendedAction: string;
  preventedEmergencyType: string;
  detectedAt: number;
  acknowledgedAt: number | null;
  acknowledgedBy: string | null;
  resolvedAt: number | null;
  dataPointsAnalyzed: number;
  confidenceScore: number;
  sensorHistory: SensorReading[];
}

export interface PredictiveAlert {
  alertId: string;
  ticketId: string;
  sensorId: string;
  message: string;
  severity: TicketSeverity;
  isRead: boolean;
  createdAt: number;
}

export interface PreventionStats {
  totalPrevented: number;
  openTickets: number;
  avgLeadTimeHours: number;
  resolutionRate: number;
  totalApiCalls: number;
  avgConfidence: number;
}

export interface SensorWithLatestReading extends SensorConfig {
  latestReading?: SensorReading;
  baseline?: SensorBaseline;
  simulationMode: SimulationMode;
  sparklineData: number[];
}
