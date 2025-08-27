interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: string
  labels: Record<string, string>
  description?: string
  preview_url?: string
  available_for_tiers?: string[]
  settings?: {
    stability: number
    similarity_boost: number
    style?: number
    use_speaker_boost?: boolean
  }
}

interface Voice {
  id: string
  name: string
  language?: string
  category?: string
  description?: string
}

interface VoiceSettings {
  stability: number
  similarity_boost: number
  style?: string
}

class ElevenLabsClient {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ElevenLabs API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  async listVoices(): Promise<Voice[]> {
    const response = await this.request<{ voices: ElevenLabsVoice[] }>('/voices')
    
    return response.voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      language: voice.labels?.language || voice.labels?.accent,
      category: voice.category,
      description: voice.description,
    }))
  }

  async getVoice(voiceId: string): Promise<Voice | null> {
    try {
      const voice = await this.request<ElevenLabsVoice>(`/voices/${voiceId}`)
      
      return {
        id: voice.voice_id,
        name: voice.name,
        language: voice.labels?.language || voice.labels?.accent,
        category: voice.category,
        description: voice.description,
      }
    } catch (error) {
      console.error(`Failed to get voice ${voiceId}:`, error)
      return null
    }
  }

  // Placeholder for future TTS implementation
  async speakStream(
    text: string, 
    voiceId: string, 
    options: VoiceSettings = { stability: 0.5, similarity_boost: 0.5 }
  ): Promise<ReadableStream> {
    // This will be implemented in Card 3
    throw new Error('TTS streaming not implemented yet')
  }
}

// Singleton instance
let elevenLabsClient: ElevenLabsClient | null = null

export function getElevenLabsClient(): ElevenLabsClient {
  if (!elevenLabsClient) {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required')
    }
    elevenLabsClient = new ElevenLabsClient(apiKey)
  }
  return elevenLabsClient
}

export type { Voice, VoiceSettings }
