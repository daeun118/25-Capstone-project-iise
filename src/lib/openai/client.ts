import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Music prompt generation using GPT-4o-mini
export async function generateMusicPrompt(params: {
  bookTitle: string
  bookDescription?: string
  bookCategory?: string
  previousLogs?: Array<{
    quote?: string
    emotions?: string[]
    memo?: string
    // Music metadata for continuity
    musicGenre?: string
    musicMood?: string
    musicTempo?: number
  }>
  userInput?: {
    quote?: string
    emotions?: string[]
    memo?: string
  }
  isFinal?: boolean
}) {
  const { bookTitle, bookDescription, bookCategory, previousLogs, userInput, isFinal } = params

  let systemPrompt = `You are a music prompt generator for an AI music creation system.
Generate detailed music prompts that capture the essence of a reading journey.
Return a JSON object with: prompt (string), genre (string), mood (string), tempo (number), description (string).

CROSSFADE OPTIMIZATION RULES:
1. Maintain tempo consistency (±5 BPM variation between tracks)
2. Request gentle fade-in/fade-out capabilities in the prompt
3. Ensure smooth transitions by using compatible genres and moods
4. Include "suitable for crossfading" or "smooth transitions" in prompts
5. For endings: request "gradual fade-out" or "gentle conclusion"
6. For beginnings: request "soft introduction" or "gradual build-up"

IMPORTANT: The 'description' field should be a brief Korean summary (1-2 sentences) explaining the music's core mood and theme for users to understand.`

  let userPrompt = ''

  if (!previousLogs || previousLogs.length === 0) {
    // v0 generation - based on book info only
    userPrompt = `Generate a music prompt for the beginning of a reading journey.
Book: ${bookTitle}
${bookDescription ? `Description: ${bookDescription}` : ''}
${bookCategory ? `Category: ${bookCategory}` : ''}

Create a mood that represents the start of a reading journey.
The output will be used as an input for the Mureka music generation model.

IMPORTANT: 
- Start with a soft, gradual introduction (first 5-10 seconds)
- Use a moderate tempo (70-90 BPM) that can transition smoothly to various moods
- End with a gentle fade-out suitable for crossfading
- Include "ambient introduction with smooth transitions" in the prompt.

IMPORTANT: Analyze the book description to infer its genre, and create music that fits the mood of that genre.  
For example:  
- Sci-Fi → futuristic and mysterious electronic sounds  
- Romance → warm, emotional piano and string instruments  
- Mystery → dark, tense, and suspenseful tones  
- Fantasy → epic and magical orchestral atmosphere  
- Horror → eerie and unsettling ambient sounds  
- Adventure → energetic and uplifting rhythm  
`
  } else if (isFinal) {
    // vFinal generation - synthesis of entire journey
    const lastTrack = previousLogs[previousLogs.length - 1];
    const lastTempo = lastTrack?.musicTempo || 70;
    const lastGenre = lastTrack?.musicGenre || 'ambient';
    
    userPrompt = `Generate a finale music prompt that synthesizes an entire reading journey.
Book: ${bookTitle}

Previous track context:
- Last genre: ${lastGenre}
- Last tempo: ${lastTempo} BPM

Previous journey moments:
${previousLogs.map((log, i) => `
Moment ${i + 1}:
${log.quote ? `Quote: "${log.quote}"` : ''}
${log.emotions?.length ? `Emotions: ${log.emotions.join(', ')}` : ''}
${log.memo ? `Reflection: ${log.memo}` : ''}
`).join('\n')}

${userInput ? `
Final reflection:
${userInput.quote ? `Final quote: "${userInput.quote}"` : ''}
${userInput.emotions?.length ? `Final emotions: ${userInput.emotions.join(', ')}` : ''}
${userInput.memo ? `Final thoughts: ${userInput.memo}` : ''}
` : ''}

Create a conclusive, synthesizing piece that brings closure to the reading journey.
The output will be used as an input for the Mureka music generation model.

IMPORTANT:
- Begin with a smooth crossfade from ${lastGenre} at ${lastTempo} BPM
- Gradually evolve to a grand finale while maintaining tempo within ±15 BPM
- Include an extended outro (15-20 seconds) with gradual fade-out
- Make it "suitable for seamless crossfading from previous track"`
  } else {
    // vN generation - based on accumulated context
    const prevTrack = previousLogs[previousLogs.length - 1];
    const prevTempo = prevTrack?.musicTempo || 80;
    const prevGenre = prevTrack?.musicGenre || 'ambient';
    const prevMood = prevTrack?.musicMood || 'contemplative';
    
    userPrompt = `Generate a music prompt for a moment in an ongoing reading journey. Do not use drums, electric guitars.
Use minor scale for negative situations/emotions.
Use major scale for positive situations/emotions.
Book: ${bookTitle}

Previous track context:
- Genre: ${prevGenre}
- Mood: ${prevMood}
- Tempo: ${prevTempo} BPM

Previous journey moments:
${previousLogs.slice(-2).map((log, i) => `
Moment ${i + 1}:
${log.quote ? `Quote: "${log.quote}"` : ''}
${log.emotions?.length ? `Emotions: ${log.emotions.join(', ')}` : ''}
`).join('\n')}

Current moment:
${userInput?.quote ? `Quote: "${userInput.quote}"` : ''}
${userInput?.emotions?.length ? `Emotions: ${userInput.emotions.join(', ')}` : ''}
${userInput?.memo ? `Reflection: ${userInput.memo}` : ''}

Create music that reflects this moment while maintaining connection to the journey so far.
The output will be used as an input for the Mureka music generation model.
IMPORTANT:
- Keep tempo within ${prevTempo - 20} to ${prevTempo + 5} BPM for smooth transitions
- Ensure genre compatibility with ${prevGenre} for crossfading
- Include "smooth fade-in from ${prevMood} mood" in the opening
- End with a gentle fade suitable for transitioning to the next track
- Be careful not to interfere with reading.
`
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')

  return {
    prompt: result.prompt || '',
    genre: result.genre || 'ambient',
    mood: result.mood || 'contemplative',
    tempo: result.tempo || 60,
    description: result.description || '',
  }
}
