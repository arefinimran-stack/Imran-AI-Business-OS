import { NextResponse } from 'next/server';
export const runtime='nodejs';
export async function POST(request){
  try{
    const body=await request.json();
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key)return NextResponse.json({error:'The secure enquiry service is not configured yet. Please email arefin.imran@gmail.com.'},{status:503});
    const response=await fetch(url.replace(/\/$/,'')+'/functions/v1/adviser-consultation-intake',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':key,'Authorization':'Bearer '+key},
      body:JSON.stringify(body),
      cache:'no-store'
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok)return NextResponse.json({error:data.error||'The enquiry service rejected the submission.'},{status:response.status});
    return NextResponse.json(data,{status:200,headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({error:'The enquiry service is temporarily unavailable. Please email arefin.imran@gmail.com.'},{status:503});}
}