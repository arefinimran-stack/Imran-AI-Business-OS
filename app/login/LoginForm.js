'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function LoginForm() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      const supabase = createClient();
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(), password,
          options: { emailRedirectTo: window.location.origin + '/auth/callback' },
        });
        if (authError) throw authError;
        if (data.session) {
          const { data: claim, error: claimError } = await supabase.rpc('claim_founder_workspace');
          if (claimError) throw claimError;
          if (claim?.status === 'owner' || claim?.status === 'member') window.location.assign('/');
          else window.location.assign('/access-pending');
        } else {
          setMessage('Check your email to confirm your account. Then return here to sign in.');
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (authError) throw authError;
        const { data: claim, error: claimError } = await supabase.rpc('claim_founder_workspace');
        if (claimError) throw claimError;
        if (claim?.status === 'owner' || claim?.status === 'member') window.location.assign('/');
        else window.location.assign('/access-pending');
      }
    } catch (e) {
      setError(e.message || 'Unable to complete sign in.');
    } finally { setBusy(false); }
  }

  return <main className="auth-shell"><section className="auth-card">
    <div className="auth-brand"><div className="brand-mark">IA</div><div><b>IMRAN AI</b><small>BUSINESS OS</small></div></div>
    <div className="auth-eyebrow">PRIVATE FOUNDER WORKSPACE</div>
    <h1>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h1>
    <p className="auth-intro">A secure workspace for your legal practice, business operations and ventures.</p>
    <form onSubmit={submit} className="auth-form">
      <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
      <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {message && <p className="auth-message" role="status">{message}</p>}
      <button disabled={busy} type="submit">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in securely' : 'Create account'}</button>
    </form>
    <p className="auth-switch">{mode === 'login' ? 'First time here?' : 'Already registered?'} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('');}}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></p>
    <div className="auth-foot">Access is restricted to an approved workspace member. New accounts require founder authorisation.</div>
  </section></main>;
}
