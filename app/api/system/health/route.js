import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'imran-ai')
      .single();
    if (orgError || !org) return NextResponse.json({ error: 'workspace_not_found' }, { status: 404 });

    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', org.id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();
    if (memberError || !membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'founder_access_required' }, { status: 403 });
    }

    return NextResponse.json({
      supabase_configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
      provider: process.env.AI_PROVIDER || 'not_set',
      model: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3.5-super-vl-120b-a12b',
      provider_key_present: Boolean(process.env.NVIDIA_API_KEY),
      runtime: 'vercel-server-route',
      checked_at: new Date().toISOString()
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'diagnostics_unavailable' }, { status: 503 });
  }
}
