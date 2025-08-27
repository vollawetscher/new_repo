'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/dashboard/header'
import { CreateOrgDialog } from '@/components/dashboard/create-org-dialog'
import { CreateAgentDialog } from '@/components/dashboard/create-agent-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Bot, Building2, Users, Settings } from 'lucide-react'
import { Organization, Agent } from '@/lib/types'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false)
  const [showCreateAgentDialog, setShowCreateAgentDialog] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadUserAndOrganizations()
  }, [])

  useEffect(() => {
    if (currentOrgId) {
      loadAgents()
    }
  }, [currentOrgId])

  const loadUserAndOrganizations = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      setUser(user)

      const response = await fetch('/api/orgs')
      if (!response.ok) {
        throw new Error('Failed to load organizations')
      }

      const data = await response.json()
      setOrganizations(data.organizations)

      // Set first org as current if available
      if (data.organizations.length > 0) {
        setCurrentOrgId(data.organizations[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAgents = async () => {
    if (!currentOrgId) return

    setIsLoadingAgents(true)
    try {
      const response = await fetch(`/api/agents?org_id=${currentOrgId}`)
      if (!response.ok) {
        throw new Error('Failed to load agents')
      }

      const data = await response.json()
      setAgents(data.agents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
    } finally {
      setIsLoadingAgents(false)
    }
  }

  const handleOrgChange = (orgId: string) => {
    if (orgId === 'create-new') {
      setShowCreateOrgDialog(true)
    } else {
      setCurrentOrgId(orgId)
    }
  }

  const handleCreateOrgSuccess = () => {
    loadUserAndOrganizations()
  }

  const handleCreateAgentSuccess = () => {
    loadAgents()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="flex h-16 items-center px-6">
            <Skeleton className="h-8 w-48" />
            <div className="ml-auto flex items-center space-x-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const currentOrg = organizations.find(org => org.id === currentOrgId)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        user={user}
        organizations={organizations}
        currentOrgId={currentOrgId}
        onOrgChange={handleOrgChange}
        onCreateOrg={() => setShowCreateOrgDialog(true)}
      />

      <main className="p-6">
        {!currentOrg ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No organizations found</h2>
            <p className="text-muted-foreground mb-6">
              Create your first organization to get started with managing agents.
            </p>
            <Button onClick={() => setShowCreateOrgDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agents.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active AI agents in your organization
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{organizations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Organizations you're a member of
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">
                    Active members in current org
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Settings</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">✓</div>
                  <p className="text-xs text-muted-foreground">
                    Configuration status
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Agents Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Agents</CardTitle>
                    <CardDescription>
                      Manage your AI agents for {currentOrg.name}
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateAgentDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Agent
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAgents ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first AI agent to get started.
                    </p>
                    <Button onClick={() => setShowCreateAgentDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Agent
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Voice ID</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">{agent.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{agent.language}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {agent.elevenlabs_voice_id}
                          </TableCell>
                          <TableCell>{formatDate(agent.created_at)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <CreateOrgDialog
        open={showCreateOrgDialog}
        onOpenChange={setShowCreateOrgDialog}
        onSuccess={handleCreateOrgSuccess}
      />

      {currentOrgId && (
        <CreateAgentDialog
          open={showCreateAgentDialog}
          onOpenChange={setShowCreateAgentDialog}
          orgId={currentOrgId}
          onSuccess={handleCreateAgentSuccess}
        />
      )}
    </div>
  )
}
