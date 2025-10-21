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

IMPORTANT: The 'description' field should be a brief Korean summary (1-2 sentences) explaining the music's core mood and theme for users to understand.`

  let userPrompt = ''

  if (!previousLogs || previousLogs.length === 0) {
    // v0 generation - based on book info only
    userPrompt = `Generate a music prompt for the beginning of a reading journey.
Book: ${bookTitle}
${bookDescription ? `Description: ${bookDescription}` : ''}
${bookCategory ? `Category: ${bookCategory}` : ''}

Create a contemplative, anticipatory mood that represents the start of a reading journey.`
  } else if (isFinal) {
    // vFinal generation - synthesis of entire journey
    userPrompt = `Generate a finale music prompt that synthesizes an entire reading journey.
Book: ${bookTitle}

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

Create a conclusive, synthesizing piece that brings closure to the reading journey.`
  } else {
    // vN generation - based on accumulated context
    userPrompt = `Generate a music prompt for a moment in an ongoing reading journey.
Book: ${bookTitle}

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

Create music that reflects this moment while maintaining connection to the journey so far.`
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
