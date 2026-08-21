'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function ApproveButton({id}:{id:string}) {
 const [busy,setBusy]=useState(false); const router=useRouter();
 async function approve(){ if(!confirm('Approve this payment and unlock the original photo?')) return; setBusy(true); const r=await fetch(`/api/admin/orders/${id}/approve`,{method:'POST'}); if(!r.ok) alert((await r.json()).error||'Approval failed'); else router.refresh(); setBusy(false); }
 return <button className="btn btn-gold" onClick={approve} disabled={busy}>{busy?'Approving…':'Approve Payment'}</button>
}
