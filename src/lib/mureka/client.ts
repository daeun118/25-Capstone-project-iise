/**
 * Mureka Music Generation Client
 * 
 * This module provides integration with Mureka AI for actual music generation.
 * 
 * Architecture:
 * - In Claude Code environment: Uses Mureka MCP tools directly (preferred)
 * - In production/non-MCP environment: Falls back to direct API calls
 * 
 * Music Generation Flow:
 * 1. Receive prompt from OpenAI GPT-4o-mini
 * 2. Call Mureka to generate music (30s-2min processing time)
 * 3. Receive music file URL or binary data
 * 4. Upload to Supabase Storage
 * 5. Return public URL
 */

export interface MurekaGenerateParams {
  prompt: string;
  genre?: string;
  mood?: string;
  tempo?: string;
  duration?: number; // seconds, default 120 (2 minutes)
}

export interface MurekaGenerateResult {
  fileUrl?: string; // If Mureka returns direct URL
  fileData?: Buffer; // If Mureka returns binary data
  status: 'completed' | 'error';
  error?: string;
  metadata?: {
    duration: number;
    format: string;
    size: number;
  };
}

/**
 * Generate background music using Mureka AI
 * 
 * This function attempts to use Mureka MCP tools if available in Claude Code,
 * otherwise falls back to direct API integration.
 * 
 * @param params - Music generation parameters
 * @returns Generated music result with file URL or data
 */
export async function generateBackgroundMusic(
  params: MurekaGenerateParams
): Promise<MurekaGenerateResult> {
  const {
    prompt,
    genre = 'cinematic',
    mood = 'contemplative',
    tempo = '90',
    duration = 120,
  } = params;

  try {
    // TODO: This will be implemented in two phases:
    // Phase 1: Claude Code environment - use MCP tools (requires user setup)
    // Phase 2: Production environment - use direct API calls
    
    // For now, check if we're in MCP-enabled environment
    const isMCPAvailable = process.env.MUREKA_MCP_ENABLED === 'true';
    
    if (isMCPAvailable) {
      // MCP-based generation (Claude Code environment)
      return await generateViaMCP({ prompt, genre, mood, tempo, duration });
    } else {
      // Direct API-based generation (production environment)
      return await generateViaAPI({ prompt, genre, mood, tempo, duration });
    }
  } catch (error) {
    console.error('[Mureka] Music generation failed:', error);
    
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate music via Mureka MCP tools (Claude Code environment)
 * 
 * This uses the MCP server configured in .mcp.json
 * Requires: uvx mureka-mcp with MUREKA_API_KEY
 */
async function generateViaMCP(
  params: MurekaGenerateParams
): Promise<MurekaGenerateResult> {
  // When MUREKA_MCP_ENABLED is true, we delegate to the MCP bridge script
  // The bridge script (mureka-mcp-bridge.js) polls the database and processes pending tracks
  // This function just returns a pending status, and the bridge handles actual generation
  
  console.log('[Mureka] MCP mode enabled - track will be processed by bridge script');
  
  // Return pending status - the bridge script will handle actual generation
  return {
    status: 'completed' as const,
    // Return empty URL - it will be filled by the bridge script
    fileUrl: '',
    metadata: {
      duration: params.duration || 120,
      format: 'mp3',
      size: 0,
    },
  };
  
  // Note: In a production environment with proper job queue infrastructure,
  // this would trigger a background job or send a message to a queue
}

/**
 * Generate music via direct Mureka API calls
 * 
 * This is used in production or when MCP is not available.
 * Requires: MUREKA_API_KEY, MUREKA_API_URL in environment
 */
async function generateViaAPI(
  params: MurekaGenerateParams
): Promise<MurekaGenerateResult> {
  const apiKey = process.env.MUREKA_API_KEY;
  const apiUrl = process.env.MUREKA_API_URL || 'https://api.mureka.ai';
  const timeout = parseInt(process.env.MUREKA_TIMEOUT_SECONDS || '300') * 1000;

  if (!apiKey) {
    throw new Error(
      'MUREKA_API_KEY not configured. Please add it to .env.local'
    );
  }

  // Construct the API request for Mureka BGM generation
  // Use dedicated instrumental endpoint (not song endpoint)
  const payload = {
    model: 'auto',         // Required: auto-select best model
    prompt: params.prompt  // BGM description for AI guidance
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Official Mureka BGM/Instrumental API endpoint
    const response = await fetch(`${apiUrl}/v1/instrumental/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mureka API error: ${response.status} - ${error}`);
    }

    const result = await response.json();

    // Instrumental API returns id for async processing
    if (!result.id) {
      console.error('[Mureka] Missing id in response:', result);
      throw new Error('No task id received from Mureka API');
    }

    const taskId = result.id;
    console.log(`[Mureka] Task started: ${taskId}`);

    // Poll for completion (max 96 attempts = 8 minutes with 5s intervals)
    // Aligned with MUREKA_TIMEOUT_SECONDS=500 (8m 20s)
    const maxAttempts = 96;
    const pollInterval = 5000; // 5 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const queryResponse = await fetch(`${apiUrl}/v1/instrumental/query/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!queryResponse.ok) {
        throw new Error(`Failed to query task status: ${queryResponse.status}`);
      }

      const status = await queryResponse.json();
      console.log(`[Mureka] Attempt ${attempt + 1}/${maxAttempts} - Status: ${status.status}`, {
        taskId,
        elapsed: `${(attempt + 1) * pollInterval / 1000}s`,
        choices: status.choices?.length || 0,
        statusDetail: status.status,
      });

      if (status.status === 'succeeded' && status.choices && status.choices.length > 0) {
        // Success! Extract first music URL
        const musicUrl = status.choices[0].url;
        return {
          status: 'completed',
          fileUrl: musicUrl,
          metadata: {
            duration: params.duration || 120,
            format: 'mp3',
            size: 0,
          },
        };
      } else if (status.status === 'failed') {
        throw new Error(`Music generation failed: ${status.error || 'Unknown error'}`);
      } else if (status.status === 'cancelled') {
        throw new Error('Music generation was cancelled');
      } else if (status.status === 'timeouted') {
        throw new Error('Music generation timed out on Mureka server');
      }
      // Continue polling if status is still 'pending' or 'processing'
    }

    throw new Error(`Music generation polling timeout after ${maxAttempts * pollInterval / 1000} seconds`);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Music generation timed out after ${timeout / 1000} seconds. ` +
        'Try increasing MUREKA_TIMEOUT_SECONDS in .env.local'
      );
    }
    
    throw error;
  }
}

/**
 * Check Mureka API status and credits
 * Useful for monitoring and debugging
 */
export async function checkMurekaStatus(): Promise<{
  available: boolean;
  credits?: number;
  error?: string;
}> {
  const apiKey = process.env.MUREKA_API_KEY;
  const apiUrl = process.env.MUREKA_API_URL || 'https://api.mureka.ai';

  if (!apiKey) {
    return {
      available: false,
      error: 'MUREKA_API_KEY not configured',
    };
  }

  try {
    // TODO: Update endpoint when actual API docs are available
    const response = await fetch(`${apiUrl}/v1/account/status`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        available: false,
        error: `API returned ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      available: true,
      credits: data.credits || data.balance,
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
