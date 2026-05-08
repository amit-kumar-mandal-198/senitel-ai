export function processChatbotQuery(conversationHistory: any[]): string {
  // Extract the latest user message from the history array
  const lastUserMessage = conversationHistory.filter(msg => msg.role === 'user').pop();
  
  if (!lastUserMessage || !lastUserMessage.content) {
    return "I am here to help. Please describe the emergency or situation.";
  }

  const query = lastUserMessage.content.toLowerCase();

  // Detect FIRE / GAS emergencies
  if (/(fire|smoke|flame|burning|explosion|gas|evacuate)/.test(query)) {
    return "[FIRE EMERGENCY]\n1. Evacuate immediately via stairs — do not use elevators.\n2. Activate the nearest fire alarm.\n3. Call emergency services: 112 or 101.\n4. Stay low if there is smoke.\nDo not re-enter the building. Help is on the way.";
  }

  // Detect HEALTH / MEDICAL emergencies
  if (/(heart|attack|unconscious|breathing|bleed|injury|seizure|chok|allergic|overdose|medical|collapse)/.test(query)) {
    return "[MEDICAL EMERGENCY]\n1. Call ambulance immediately: 112 or 108.\n2. Do not move the person unless in immediate danger.\n3. Begin CPR or apply pressure to bleeding if trained.\n4. Stay on the line with emergency services.\nHelp is being dispatched. Stay with the person.";
  }

  // Detect SECURITY / THREAT emergencies
  if (/(intruder|theft|threat|suspicious|assault|violenc|lockdown|trespass|follow|gun|weapon)/.test(query)) {
    return "[SECURITY ALERT]\n1. Follow RUN-HIDE-TELL protocol.\n2. Lock doors, silence phones, and hide if you cannot run.\n3. Call police: 112 or 100 silently if needed.\n4. Do not confront the threat.\nStay calm — you are doing the right thing. Help is alerted.";
  }

  // Handle ambiguous or partial queries gracefully
  if (query.split(' ').length <= 2 && !/(help|emergency|urgent|sos)/.test(query)) {
    return "Could you please provide a few more details? Are you experiencing a fire, medical issue, or security threat?";
  }

  // General Emergency Fallback
  return "[GENERAL EMERGENCY]\n1. Move to a safe area away from immediate danger.\n2. Call universal emergency services: 112.\n3. Provide them with your exact location and situation.\n4. Remain calm and follow dispatcher instructions.\nYour request has been logged and our response team has been notified.";
}
