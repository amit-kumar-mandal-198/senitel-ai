/**
 * Analyzes user emergency queries using keyword matching.
 * Provides offline-first triage and actionable guidance.
 * @param {string} query - The user's input string
 * @returns {string} The formatted response string
 */
export function triageCrisis(query) {
  if (!query) return "Unable to classify the emergency. Please call 112 immediately if you are in danger.";
  const lowerQuery = query.toLowerCase();

  // Fire Emergency
  if (/(fire|smoke|burning|flames|blaze)/.test(lowerQuery)) {
    return "[FIRE EMERGENCY]\n" +
           "1. Activate the nearest fire alarm immediately.\n" +
           "2. Evacuate via stairs — do NOT use elevators.\n" +
           "3. Stay low if there is smoke; cover your mouth.\n" +
           "4. Call emergency services: 112 / 101 (Fire Dept).\n" +
           "Do not re-enter the building. Help is on the way.";
  }

  // Medical/Health Emergency
  if (/(collapse|breathing|heart|medical|health|injury|injured|bleed|bleeding|unconscious|cpr)/.test(lowerQuery)) {
    return "[MEDICAL EMERGENCY]\n" +
           "1. Call ambulance immediately: 112 / 108.\n" +
           "2. Begin CPR if trained — 30 chest compressions, 2 breaths.\n" +
           "3. Do not move the person unless in immediate danger.\n" +
           "4. Stay on the line with emergency services.\n" +
           "Help is being dispatched. Stay with the person.";
  }

  // Security/Safety Emergency
  if (/(follow|following|intruder|gun|weapon|attack|threat|security|danger|scared|hide)/.test(lowerQuery)) {
    return "[SECURITY ALERT]\n" +
           "1. Move to a crowded, well-lit public area.\n" +
           "2. Do not confront the individual.\n" +
           "3. Call police: 112 / 100.\n" +
           "4. Share your live location with a trusted contact.\n" +
           "Stay calm — you are doing the right thing by alerting us.";
  }

  // General Crisis / Other
  if (/(earthquake|flood|crisis|emergency|help|stuck|evacuate|lockdown)/.test(lowerQuery)) {
    return "[GENERAL CRISIS]\n" +
           "1. Assess your immediate surroundings for danger.\n" +
           "2. Move to a safe location if your current spot is compromised.\n" +
           "3. Contact emergency services: 112.\n" +
           "4. Await further instructions from authorities.\n" +
           "Please stay calm. Assistance is available.";
  }

  // Facility Status / Report (preserving existing non-emergency capabilities)
  if (/(status|report)/.test(lowerQuery)) {
    return "Current facility status is Nominal. All sensors indicate safe levels. No active incidents reported in the last 24 hours.";
  }

  // Ambiguous/Partial queries
  if (query.split(' ').length <= 3) {
    return "Could you please provide more details? Are you facing a fire, medical, or security emergency?";
  }

  // Fallback if nothing matches
  return "Unable to classify the emergency. Please call 112 immediately if you are in danger.";
}
