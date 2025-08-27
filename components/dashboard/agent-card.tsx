import { Agent } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Volume2, Settings, Trash2, Play } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AgentCardProps {
  agent: Agent
  voiceName?: string
  onEdit?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
  onTest?: (agent: Agent) => void
}

export function AgentCard({ agent, voiceName, onEdit, onDelete, onTest }: AgentCardProps) {
  const languageLabels: Record<string, string> = {
    'de-DE': 'German',
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'es-ES': 'Spanish',
    'fr-FR': 'French',
    'it-IT': 'Italian',
    'pt-PT': 'Portuguese',
    'nl-NL': 'Dutch',
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border bg-surface/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
              {agent.name}
            </CardTitle>
            <CardDescription className="text-textSecondary">
              Created {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onTest && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTest(agent)}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(agent)}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(agent)}
                className="h-8 w-8 p-0 hover:bg-error/10 hover:text-error"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {languageLabels[agent.language] || agent.language}
          </Badge>
          {agent.voice_style && (
            <Badge variant="outline" className="border-border text-textSecondary">
              {agent.voice_style}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Volume2 className="h-4 w-4 text-primary" />
            <span className="text-text font-medium">
              {voiceName || 'Unknown Voice'}
            </span>
          </div>
          
          {(agent.voice_stability !== undefined || agent.voice_similarity_boost !== undefined) && (
            <div className="grid grid-cols-2 gap-4 text-xs text-textSecondary">
              {agent.voice_stability !== undefined && (
                <div>
                  <span className="font-medium">Stability:</span> {agent.voice_stability.toFixed(2)}
                </div>
              )}
              {agent.voice_similarity_boost !== undefined && (
                <div>
                  <span className="font-medium">Similarity:</span> {agent.voice_similarity_boost.toFixed(2)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-textSecondary line-clamp-2">
          {agent.system_prompt}
        </div>
      </CardContent>
    </Card>
  )
}
