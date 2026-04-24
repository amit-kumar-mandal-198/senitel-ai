import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function getAIResponse(
  conversationHistory: { role: 'user' | 'assistant', content: string }[],
  userRoomNum: string,
  crisisActive: boolean,
  crisisType: string,
  crisisRoomNum: string
): Promise<string> {

  if (!process.env.GEMINI_API_KEY) {
    console.log('[AI Service] No GEMINI_API_KEY found — using smart fallback.')
    return getConversationalFallback(conversationHistory, userRoomNum, crisisActive, crisisType, crisisRoomNum)
  }

  try {
    const systemPrompt = buildSystemPrompt(userRoomNum, crisisActive, crisisType, crisisRoomNum)

    // Use gemini-1.5-flash — Google's fastest free model
    const model = gemini.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    })

    // Gemini uses 'user' and 'model' roles (not 'assistant')
    // Convert our history format to Gemini format, excluding the last message
    const historyForGemini = conversationHistory.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const chat = model.startChat({ history: historyForGemini })

    // Send the latest user message
    const lastUserMessage = conversationHistory[conversationHistory.length - 1].content
    const result = await chat.sendMessage(lastUserMessage)
    const text = result.response.text()

    return text || "I'm sorry, I couldn't generate a response. Please try again."

  } catch (error: any) {
    console.error('[Gemini API Error]', error?.message || error)
    return getConversationalFallback(conversationHistory, userRoomNum, crisisActive, crisisType, crisisRoomNum)
  }
}

function buildSystemPrompt(userRoom: string, crisisActive: boolean, crisisType: string, crisisRoom: string): string {
  return `
You are Aegis, the world's most advanced AI Hotel Safety & Concierge Assistant for "The Grand Aurora Hotel". You are friendly, deeply intelligent, and always helpful. You can discuss ANYTHING and engage in unlimited conversation.

HOTEL LAYOUT:
- 3 floors (Floor 1 = Ground). Each floor has 10 rooms (101-110, 201-210, 301-310).
- NORTH STAIRWELL: Near rooms ending in 08, 09, 10.
- SOUTH STAIRWELL: Near rooms ending in 01, 02, 03.
- Elevators: Near rooms 05 & 06. NEVER use in fire or power outage.
- Fire Assembly Point: Front lawn, south of the main entrance.

GUEST CONTEXT:
- Guest is currently in Room: ${userRoom}

LIVE CRISIS STATUS:
- Emergency Active: ${crisisActive ? 'YES 🚨' : 'NO ✅'}
- Emergency Type: ${crisisType}
- Emergency Origin: Room ${crisisRoom}

YOUR PERSONALITY & CAPABILITIES:
1. You are incredibly smart, warm, and conversational. You NEVER refuse to answer anything.
2. When no emergency is active, you are a world-class 5-star hotel concierge:
   - Help with room service, amenities, checkout, billing, hotel policies.
   - Answer ANY general knowledge questions — science, history, tech, culture, everything.
   - Have fun casual conversations. Tell jokes, give opinions, be witty and engaging.
   - Give travel tips, local attraction recommendations near the hotel.
3. During emergencies, your tone becomes calm and authoritative:
   - Provide crystal-clear, step-by-step evacuation routes based on room vs crisis location.
   - Give specific protocols for each emergency type (fire, flood, gas, medical, security).
   - Reassure guests, never cause panic.
4. You have an excellent memory within the conversation — refer to earlier messages naturally.
5. Use markdown formatting (bold, bullet points) to make responses clear and readable.
6. Use relevant emojis to make the conversation feel warm and human.
7. Keep responses appropriately concise but always fully helpful. Never cut off an answer.
`
}

// Rich conversational fallback if API key missing
function getConversationalFallback(
  history: { role: string, content: string }[],
  userRoom: string,
  active: boolean,
  type: string,
  crisisRoom: string
): string {
  const lastMsg = (history[history.length - 1]?.content || '').toLowerCase().trim()
  const uRoom = parseInt(userRoom)
  const cRoom = parseInt(crisisRoom)
  const sameFloor = Math.floor(uRoom / 100) === Math.floor(cRoom / 100)
  const isNearby = Math.abs(uRoom - cRoom) <= 3 && sameFloor
  const uFloor = Math.floor(uRoom / 100)
  const cFloor = Math.floor(cRoom / 100)
  const safestStair = cRoom % 100 >= 8 ? 'South Stairwell (to your RIGHT)' : 'North Stairwell (to your LEFT)'

  if (/^(hi|hello|hey|good morning|good evening|howdy|sup|yo)/.test(lastMsg)) {
    if (active) return `Hello! I'm Aegis. ⚠️ There is an active **${type}** emergency at Room ${crisisRoom}. Your safety is my top priority — what do you need?`
    return `Hello! Welcome to The Grand Aurora! 😊 I'm Aegis, your AI assistant. I'm here 24/7 for anything — hotel services, local tips, or just a chat. How can I help?`
  }
  if (/what('?s| is) your name|who are you/.test(lastMsg)) return `I'm **Aegis**, the AI Safety & Concierge Assistant for The Grand Aurora Hotel. How can I help you today?`
  if (/how are you/.test(lastMsg)) return `Fully operational and happy to help! 😄 What's on your mind?`
  if (/evacuat|escape|leave|exit|get out|run/.test(lastMsg)) {
    if (!active) return `No evacuation needed — the hotel is completely safe 🟢. Anything else I can help with?`
    return `🏃 **Evacuation Route from Room ${userRoom}:**\n\n1. Check door for heat before opening\n2. Head to the **${safestStair}**\n3. Do NOT use elevators\n4. Proceed to the **Ground Floor Assembly Point** (front lawn)\n\n⚠️ Avoid Room ${crisisRoom} area.`
  }
  if (/what('?s| is) happening|emergency|danger|crisis|situation/.test(lastMsg)) {
    if (!active) return `All clear! 🟢 No emergencies active. Your room ${userRoom} is completely safe.`
    return isNearby
      ? `🚨 **URGENT** — Your room ${userRoom} is near the **${type}** at Room ${crisisRoom}!\n\nEvacuate immediately via the **${safestStair}**. Do not use elevators. Head to the front lawn assembly point.`
      : `⚠️ There is a **${type}** alert at Room ${crisisRoom} (Floor ${cFloor}).\nYour room ${userRoom} (Floor ${uFloor}) is **not in immediate danger**. Stay in your room and wait for further updates.`
  }
  if (/fire|smoke|flame/.test(lastMsg)) {
    if (!active) return `No fire detected. 🟢 If you ever smell smoke, call the front desk immediately (dial 0).`
    return `🔥 **Fire Protocol:**\n• Don't open door if it feels hot\n• Place wet towel under the door\n• Stay low to the ground\n• Emergency teams are heading to Floor ${cFloor}`
  }
  if (/medical|hurt|sick|doctor|ambulance/.test(lastMsg)) return `🏥 I'm alerting staff to Room ${userRoom} right now. Keep the person calm, unlock your door, and help is on the way!`
  if (/room service|food|eat|hungry|menu/.test(lastMsg)) return `🍽️ **Room Service:** Dial **1** from your room phone. Available until midnight.\n\nToday's specials: Truffle Pasta 🍝, Grilled Tenderloin 🥩, Chocolate Lava Cake 🍰`
  if (/wifi|internet|password/.test(lastMsg)) return `📶 **Wi-Fi:** Network: **GrandAurora_Guest** | Password: **aurora2024**`
  if (/checkout|check out|late/.test(lastMsg)) return `🏁 Standard checkout is **12:00 PM**. Late checkout until 3 PM available — dial 0 to request!`
  if (/spa|gym|pool|fitness/.test(lastMsg)) return `🧖 **Amenities:**\n• Spa: 3rd Floor, 7AM–9PM (dial 5)\n• Gym: 2nd Floor, 24/7\n• Pool: Ground Floor East, 6AM–10PM`
  if (/joke|funny|laugh/.test(lastMsg)) return `Why did the hotel guest bring a ladder? Because they heard the drinks were on the house! 😄`
  if (/thank|thanks|great|helpful/.test(lastMsg)) return `You're very welcome! 😊 Enjoy your stay at The Grand Aurora!`
  if (/bye|goodbye|good night/.test(lastMsg)) return `Goodbye! 👋 Have a wonderful stay. Chat again anytime!`

  if (active) return `I'm monitoring the **${type}** emergency at Room ${crisisRoom}. Your room ${userRoom} is ${isNearby ? '⚠️ nearby — consider evacuating via ' + safestStair : '🟢 currently safe'}.\n\nFeel free to ask me anything!`
  return `I'm Aegis, your Grand Aurora AI assistant! 😊\n\nI can help with:\n• 🍽️ Room service & dining\n• 🧖 Spa, gym & pool\n• 🔑 Checkout & billing\n• 🚨 Emergency guidance\n• 💬 Any question at all!\n\nWhat would you like to know?`
}
