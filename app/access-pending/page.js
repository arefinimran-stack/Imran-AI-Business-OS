'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function AccessPendingPage() {
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign('/login');
  }
  return <main className="auth-shell"><section className="auth-card">
    <div className="auth-brand"><div className="brand-mark">IA</div><div><b>IMRAN AI</b><small>BUSINESS OS</small></div></div>
    <div className="auth-eyebrow">ACCESS CONTROL</div><h1>Access pending.</h1>
    <p className="auth-intro">Your account is authenticated, but it has not been authorised for the IMRAN AI founder workspace. Contact the workspace owner to approve access.</p>
    <button className="auth-secondary" onClick={signOut} disabled={busy}>{busy ? 'Signing out…' : 'Sign out'}</button>
  </section></main>;
}
