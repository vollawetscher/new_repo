export type OrgRole = 'owner' | 'admin' | 'editor' | 'analyst' | 'viewer'

export interface Organization {
  id: string
  name: string
  created_at: string
}

export interface OrganizationMember {
  org_id: string
  user_id: string
  role: OrgRole
  created_at: string
  organization?: Organization
}

export interface Agent {
  id: string
  org_id: string
  name: string
  language: string
  system_prompt: string
  elevenlabs_voice_id: string
  voice_stability?: number
  voice_similarity_boost?: number
  voice_style?: string
  created_by: string
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Voice {
  id: string
  name: string
  language?: string
  category?: string
  description?: string
}
