import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createOrgSchema } from '@/lib/validations'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: memberships, error } = await supabase
      .from('organization_members')
      .select(`
        org_id,
        role,
        organization:organizations(id, name, created_at)
      `)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const organizations = memberships?.map(m => ({
      ...m.organization,
      role: m.role
    })) || []

    return NextResponse.json({ organizations })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const serviceSupabase = createServiceClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createOrgSchema.parse(body)

    // Check if user has permission to create orgs (for now, allow all authenticated users)
    const { data: org, error: orgError } = await serviceSupabase
      .from('organizations')
      .insert({ name: validatedData.name })
      .select()
      .single()

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 })
    }

    // Add user as owner
    const { error: memberError } = await serviceSupabase
      .from('organization_members')
      .insert({
        org_id: org.id,
        user_id: user.id,
        role: 'owner'
      })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({ organization: org })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
