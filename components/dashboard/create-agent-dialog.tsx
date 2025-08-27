'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAgentSchema, CreateAgentData } from '@/lib/validations'
import { Voice } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Combobox } from '@/components/ui/combobox'
import { Loader2, Volume2 } from 'lucide-react'

interface CreateAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgId: string
  onSuccess: () => void
}

const languages = [
  { value: 'de-DE', label: 'German (Germany)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'fr-FR', label: 'French (France)' },
  { value: 'it-IT', label: 'Italian (Italy)' },
  { value: 'pt-PT', label: 'Portuguese (Portugal)' },
  { value: 'nl-NL', label: 'Dutch (Netherlands)' },
]

const voiceStyles = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'customer_support', label: 'Customer Support' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
]

export function CreateAgentDialog({ open, onOpenChange, orgId, onSuccess }: CreateAgentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voices, setVoices] = useState<Voice[]>([])
  const [loadingVoices, setLoadingVoices] = useState(false)

  const form = useForm<CreateAgentData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      org_id: orgId,
      name: '',
      language: 'de-DE',
      system_prompt: '',
      elevenlabs_voice_id: '',
      voice_stability: 0.5,
      voice_similarity_boost: 0.5,
      voice_style: 'neutral',
    },
  })

  // Load voices when dialog opens
  useEffect(() => {
    if (open && voices.length === 0) {
      loadVoices()
    }
  }, [open])

  const loadVoices = async () => {
    setLoadingVoices(true)
    try {
      const response = await fetch('/api/voices')
      if (!response.ok) {
        throw new Error('Failed to load voices')
      }
      const data = await response.json()
      setVoices(data.voices)
    } catch (err) {
      console.error('Error loading voices:', err)
      setError('Failed to load voices. Please try again.')
    } finally {
      setLoadingVoices(false)
    }
  }

  const voiceOptions = voices.map(voice => ({
    value: voice.id,
    label: voice.name,
    description: voice.language ? `${voice.language}${voice.category ? ` • ${voice.category}` : ''}` : voice.category,
  }))

  const onSubmit = async (data: CreateAgentData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create agent')
      }

      form.reset({
        org_id: orgId,
        name: '',
        language: 'de-DE',
        system_prompt: '',
        elevenlabs_voice_id: '',
        voice_stability: 0.5,
        voice_similarity_boost: 0.5,
        voice_style: 'neutral',
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Create Agent
          </DialogTitle>
          <DialogDescription>
            Create a new AI agent with custom configuration and voice settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter agent name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="elevenlabs_voice_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice</FormLabel>
                  <FormControl>
                    <Combobox
                      options={voiceOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={loadingVoices ? "Loading voices..." : "Select a voice"}
                      searchPlaceholder="Search voices..."
                      emptyText="No voices found."
                      disabled={loadingVoices || isLoading}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Choose an ElevenLabs voice for your agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="system_prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the system prompt for your agent..."
                      className="min-h-[120px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Define how your agent should behave and respond
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced-settings">
                <AccordionTrigger className="text-sm font-medium">
                  Advanced Voice Settings
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="voice_stability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Voice Stability: {field.value?.toFixed(2)}
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={[field.value || 0.5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            disabled={isLoading}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Higher values make the voice more stable and consistent
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="voice_similarity_boost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Similarity Boost: {field.value?.toFixed(2)}
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={[field.value || 0.5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            disabled={isLoading}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Higher values make the voice more similar to the original
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="voice_style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select voice style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {voiceStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the speaking style for your agent
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || loadingVoices}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Agent
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
