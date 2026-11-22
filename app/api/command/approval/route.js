import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { createClient } from '../../../../lib/supabase/server.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in to approve this action.' }, { status: 401 });

  try {
    const body = await request.json();
    const approvalId = typeof body.approval_id === 'string' ? body.approval_id : '';
    const decision = body.decision === 'approved' ? 'approved' : body.decision === 'rejected' ? 'rejected' : '';
    if (!approvalId || !decision) return NextResponse.json({ error: 'A valid approval id and YES/NO decision are required.' }, { status: 400 });

    const { data: org, error: orgError } = await supabase.from('organizations').select('id').eq('slug', 'imran-ai').single();
    if (orgError || !org) return NextResponse.json({ error: 'Founder workspace not found.' }, { status: 404 });

    const { data: membership, error: membershipError } = await supabase.from('organization_members')
      .select('role').eq('organization_id', org.id).eq('user_id', user.id).eq('is_active', true).maybeSingle();
    if (membershipError || !membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only the founder or an authorised administrator can decide this request.' }, { status: 403 });
    }

    const { data: approval, error: approvalError } = await supabase.from('ai_approval_requests')
      .select('id,job_id,decision,action_key,action_payload,action_hash,expires_at')
      .eq('id', approvalId).eq('organization_id', org.id).maybeSingle();
    if (approvalError || !approval) return NextResponse.json({ error: 'Approval request not found.' }, { status: 404 });
    if (approval.decision !== 'pending') return NextResponse.json({ error: 'This request has already been decided.' }, { status: 409 });
    if (new Date(approval.expires_at).getTime() <= Date.now()) {
      await supabase.from('ai_approval_requests').update({
        decision: 'expired', decided_by: user.id, decided_at: new Date().toISOString(), reason: 'Approval window expired.'
      }).eq('id', approval.id).eq('organization_id', org.id);
      return NextResponse.json({ error: 'This approval request has expired. Ask the agent to prepare a new request.' }, { status: 410 });
    }

    const expectedHash = createHash('sha256').update(JSON.stringify(approval.action_payload)).digest('hex');
    if (expectedHash !== approval.action_hash) return NextResponse.json({ error: 'Action integrity check failed. No action was executed.' }, { status: 409 });

    const { error: decisionError } = await supabase.from('ai_approval_requests').update({
      decision,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
      reason: decision === 'rejected' ? 'Rejected by founder.' : 'Approved by founder.'
    }).eq('id', approval.id).eq('organization_id', org.id);
    if (decisionError) return NextResponse.json({ error: 'Could not record the founder decision.' }, { status: 500 });

    if (decision === 'rejected') {
      await supabase.from('ai_orchestration_jobs').update({
        status: 'cancelled',
        result: { approval_id: approval.id, action_status: 'rejected_by_founder' },
        completed_at: new Date().toISOString()
      }).eq('id', approval.job_id).eq('organization_id', org.id);
      return NextResponse.json({ message: 'Rejected. No change was made to the workspace.' });
    }

    let createdRecord = null;
    if (approval.action_key === 'task.create') {
      const payload = approval.action_payload || {};
      const { data, error } = await supabase.from('tasks').insert({
        organization_id: org.id,
        title: payload.title,
        description: payload.description || null,
        priority: ['low', 'normal', 'high', 'urgent'].includes(payload.priority) ? payload.priority : 'normal',
        status: 'todo'
      }).select('id,title,status').single();
      if (error) {
        await supabase.from('ai_orchestration_jobs').update({
          status: 'failed', error_code: 'TASK_CREATE_FAILED', error_summary: 'The approved task could not be created.',
          completed_at: new Date().toISOString()
        }).eq('id', approval.job_id).eq('organization_id', org.id);
        return NextResponse.json({ error: 'Approval recorded, but task creation failed. No success is being reported.' }, { status: 500 });
      }
      createdRecord = { type: 'task', ...data };
    } else if (approval.action_key === 'document.draft') {
      const payload = approval.action_payload || {};
      const { data, error } = await supabase.from('legal_documents').insert({
        organization_id: org.id,
        title: payload.title,
        content: payload.content,
        language: payload.language === 'Bangla' ? 'Bangla' : 'English',
        template_key: payload.template_key || 'custom',
        matter_type: payload.matter_type || null,
        prompt: payload.prompt || null,
        status: 'draft'
      }).select('id,title,status').single();
      if (error) {
        await supabase.from('ai_orchestration_jobs').update({
          status: 'failed', error_code: 'DOCUMENT_DRAFT_FAILED', error_summary: 'The approved document draft could not be saved.',
          completed_at: new Date().toISOString()
        }).eq('id', approval.job_id).eq('organization_id', org.id);
        return NextResponse.json({ error: 'Approval recorded, but the document draft could not be saved.' }, { status: 500 });
      }
      createdRecord = { type: 'document', ...data };
    } else {
      await supabase.from('ai_orchestration_jobs').update({
        status: 'failed', error_code: 'ACTION_NOT_SUPPORTED', error_summary: 'The approved action has no registered execution adapter.',
        completed_at: new Date().toISOString()
      }).eq('id', approval.job_id).eq('organization_id', org.id);
      return NextResponse.json({ error: 'This action has no verified execution adapter. No external action was taken.' }, { status: 409 });
    }

    await supabase.from('ai_orchestration_jobs').update({
      status: 'succeeded',
      result: { approval_id: approval.id, action_status: 'executed', created_record: createdRecord },
      completed_at: new Date().toISOString()
    }).eq('id', approval.job_id).eq('organization_id', org.id);

    return NextResponse.json({ message: 'Approved and executed. The internal record is now saved.', created_record: createdRecord });
  } catch {
    return NextResponse.json({ error: 'The approval request could not be processed.' }, { status: 500 });
  }
}
