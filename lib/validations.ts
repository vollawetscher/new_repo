import { z } from 'zod'

export const createAgentSchema = z.object({
  org_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  language: z.string().min(1, 'Language is required'),
  system_prompt: z.string().min(1, 'System prompt is required'),
  elevenlabs_voice_id: z.string().min(1, 'Voice ID is required'),
  voice_stability: z.number().min(0).max(1).optional().default(0.5),
  voice_similarity_boost: z.number().min(0).max(1).optional().default(0.5),
  voice_style: z.string().optional(),
})

export const updateAgentSchema = createAgentSchema.partial().omit({ org_id: true })

export type CreateAgentData = z.infer<typeof createAgentSchema>
export type UpdateAgentData = z.infer<typeof updateAgentSchema>
