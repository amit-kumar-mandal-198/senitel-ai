import { getDatabase, ref, set, push, get, update, query, limitToLast, orderByChild, equalTo } from 'firebase/database';
import { SENSORS } from '../constants/sensorConfigs';
import { SensorReading, MaintenanceTicket, TicketSeverity, PredictiveAlert, SensorConfig, SensorBaseline } from '../types/maintenance';

const ANTHROPIC_API_KEY = "YOUR_ANTHROPIC_API_KEY"; // In real app, use proxy
const db = getDatabase();

let isDetectionRunning = false;
let lastAnalysisTimestamp: Record<string, number> = {};

export const runAnomalyDetectionCycle = async (propertyId: string) => {
  if (isDetectionRunning) return;
  isDetectionRunning = true;

  try {
    const analysisPromises = SENSORS.map(async (sensor) => {
      // 1. Rate limit: Max 1 analysis per 10 minutes per sensor
      const now = Date.now();
      if (lastAnalysisTimestamp[sensor.sensorId] && (now - lastAnalysisTimestamp[sensor.sensorId] < 600000)) {
        return;
      }

      // 2. Fetch last 20 readings
      const readingsRef = query(ref(db, `sensorReadings/${sensor.sensorId}`), limitToLast(20));
      const readingsSnap = await get(readingsRef);
      if (!readingsSnap.exists()) return;

      const readingsData = readingsSnap.val();
      const readings: SensorReading[] = Object.values(readingsData).sort((a: any, b: any) => b.timestamp - a.timestamp) as any;
      const latestReading = readings[0];

      // 3. Get baseline
      const baselineRef = ref(db, `sensorBaselines/${sensor.sensorId}`);
      const baselineSnap = await get(baselineRef);
      if (!baselineSnap.exists()) return;
      const baseline: SensorBaseline = baselineSnap.val();

      // 4. Drift check (> 8%)
      const currentDrift = Math.abs(latestReading.drift);
      if (currentDrift < 8 && !latestReading.isAnomaly) {
        return;
      }

      // 5. Check for existing open ticket
      const openTicketsRef = query(ref(db, 'maintenanceTickets'), orderByChild('sensorId'), equalTo(sensor.sensorId));
      const ticketsSnap = await get(openTicketsRef);
      let existingTicketId = null;
      if (ticketsSnap.exists()) {
        const tickets = ticketsSnap.val();
        existingTicketId = Object.keys(tickets).find(id => tickets[id].status !== 'resolved' && tickets[id].status !== 'prevented');
      }

      // 6. Analyze with Claude
      console.log(`[AI Anomaly] Analyzing ${sensor.sensorId} with Claude...`);
      const analysis = await analyzeSensorTrendWithClaude(sensor, readings, baseline);
      
      if (analysis && analysis.requiresTicket && analysis.confidence >= 70) {
        lastAnalysisTimestamp[sensor.sensorId] = now;
        await createOrUpdateTicket(sensor, analysis, readings, existingTicketId);
      }
    });

    await Promise.all(analysisPromises);

    // Log cycle summary
    await push(ref(db, 'analyticsLogs/anomalyDetector/cycles'), {
      timestamp: Date.now(),
      status: 'completed',
      sensorsChecked: SENSORS.length
    });

  } catch (error) {
    console.error("[AI Anomaly] Cycle failed:", error);
  } finally {
    isDetectionRunning = false;
  }
};

const analyzeSensorTrendWithClaude = async (sensor: SensorConfig, readings: SensorReading[], baseline: SensorBaseline) => {
  try {
    const latestValue = readings[0].value;
    const readingsStr = readings.map((r, i) => `T-${i * 10}s: ${r.value}`).join(' | ');

    const prompt = `You are an IoT anomaly detection AI for a hotel safety platform. Analyze the sensor trend below and determine if predictive maintenance is required BEFORE a crisis occurs.

SENSOR: ${sensor.name}
LOCATION: ${sensor.location}
UNIT: ${sensor.unit}
NORMAL RANGE: ${sensor.normalMin}–${sensor.normalMax} ${sensor.unit}
CRITICAL THRESHOLD: ${sensor.criticalThreshold} ${sensor.unit}
CURRENT VALUE: ${latestValue} ${sensor.unit}
7-DAY BASELINE: ${baseline.baselineValue} ${sensor.unit}

LAST 20 READINGS (newest first):
${readingsStr}

TREND ANALYSIS TASK:
1. Is this sensor showing a gradual degradation trend?
2. If trend continues unchanged, when will it reach the critical threshold?
3. What is the most likely physical cause?
4. What is the specific recommended maintenance action?
5. What emergency would occur if left unaddressed?

RESPOND ONLY with this exact JSON — no other text:
{
  "requiresTicket": true/false,
  "severity": "low|medium|high|critical",
  "confidence": 0-100,
  "title": "short ticket title (max 60 chars)",
  "trendSummary": "one line: what the data shows",
  "aiReasoning": "2-3 sentences of technical analysis",
  "estimatedTimeToFailure": "human-readable time range",
  "recommendedAction": "numbered steps, max 4 steps",
  "preventedEmergencyType": "name of prevented emergency",
  "dataPattern": "gradual_decline|spike|oscillation|stable"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "dangerously-allow-browser": "true"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
    const data = await response.json();
    const rawText = data.content[0].text.trim();
    
    try {
      return JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    }
  } catch (error) {
    console.error(`[AI Anomaly] Claude analysis failed for ${sensor.sensorId}:`, error);
    return null;
  }
};

const createOrUpdateTicket = async (sensor: SensorConfig, analysis: any, readings: SensorReading[], existingTicketId: string | null) => {
  const ticketId = existingTicketId || `TKT-${Date.now()}`;
  const ticketRef = ref(db, `maintenanceTickets/${ticketId}`);

  const ticketData: any = {
    ticketId,
    sensorId: sensor.sensorId,
    sensorName: sensor.name,
    location: sensor.location,
    severity: analysis.severity as TicketSeverity,
    status: existingTicketId ? undefined : 'open', // Don't overwrite status if updating
    title: analysis.title,
    description: analysis.aiReasoning,
    aiReasoning: analysis.aiReasoning,
    trendSummary: analysis.trendSummary,
    estimatedTimeToFailure: analysis.estimatedTimeToFailure,
    recommendedAction: analysis.recommendedAction,
    preventedEmergencyType: analysis.preventedEmergencyType,
    detectedAt: existingTicketId ? undefined : Date.now(),
    dataPointsAnalyzed: readings.length,
    confidenceScore: analysis.confidence,
    sensorHistory: readings.slice(0, 20)
  };

  // Remove undefined fields for update
  Object.keys(ticketData).forEach(key => ticketData[key] === undefined && delete ticketData[key]);

  if (existingTicketId) {
    await update(ticketRef, ticketData);
  } else {
    await set(ticketRef, ticketData);
    
    // Create alert
    const alertId = `ALR-${Date.now()}`;
    const alert: PredictiveAlert = {
      alertId,
      ticketId,
      sensorId: sensor.sensorId,
      message: `AI Warning: ${analysis.title}`,
      severity: analysis.severity as TicketSeverity,
      isRead: false,
      createdAt: Date.now()
    };
    await set(ref(db, `predictiveAlerts/${alertId}`), alert);
  }

  return ticketId;
};
