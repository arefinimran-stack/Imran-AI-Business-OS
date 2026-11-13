import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data } = await supabase.rpc('claim_founder_workspace');
      if (data?.status === 'owner' || data?.status === 'member') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.redirect(new URL('/access-pending', request.url));
    }
  }
  return NextResponse.redirect(new URL('/login?error=confirmation', request.url));
}
