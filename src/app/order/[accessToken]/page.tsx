'use client';
import { useEffect, useState } from "react";
import { STORE } from "@/lib/store-config";
export default function OrderPage({params}:{params:Promise<{accessToken:string}>}){
 const [token,setToken]=useState(""); const [order,setOrder]=useState<any>(null); const [file,setFile]=useState<File|null>(null); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState("");
 useEffect(()=>{params.then(p=>setToken(p.accessToken))},[params]);
 async function load(){if(!token)return;const r=await fetch(`/api/orders/${token}`,{cache:'no-store'});if(r.ok)setOrder(await r.json())}
 useEffect(()=>{load()},[token]);
 async function upload(){if(!file)return;setBusy(true);setMsg("");try{const p=await fetch(`/api/orders/${token}/receipt`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({fileName:file.name,fileType:file.type,fileSize:file.size})});const d=await p.json();if(!p.ok)throw new Error(d.error);const up=await fetch(d.url,{method:'PUT',headers:{'content-type':file.type},body:file});if(!up.ok)throw new Error('Could not upload receipt');const c=await fetch(`/api/orders/${token}/receipt/complete`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:d.key})});if(!c.ok)throw new Error((await c.json()).error);setMsg('Payment receipt submitted. Please wait for confirmation.');load();}catch(e){setMsg(e instanceof Error?e.message:'Upload failed')}setBusy(false)}
 if(!order)return <main className="container section"><div className="card empty">Loading order…</div></main>;
 const paid=order.paymentStatus==='PAID';
 return <main className="container section order-page"><div className="order-header"><div><p className="eyebrow">ORDER {order.orderNumber}</p><h1>{paid?'Payment Confirmed':'Payment & Download'}</h1><p className="muted">Keep this page to access your order.</p></div><span className={`status status-${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span></div>
 {!paid&&<div className="payment-layout"><div className="card qr-card"><h2>1. Pay by QR</h2><img className="qr-image" src={STORE.paymentQrPath} alt="Payment QR code"/><p className="muted">{STORE.paymentNote}</p><div className="payment-steps">{STORE.paymentInstructions.map((x,i)=><div key={x}><b>{i+1}</b><span>{x}</span></div>)}</div><div className="total-box">Amount to pay <strong>${(order.totalCents/100).toFixed(2)}</strong></div></div>
 <div className="card form-card"><h2>2. Upload Payment Receipt</h2><p className="muted">Upload a clear screenshot showing the successful payment and amount.</p><input className="input" type="file" accept="image/*,.pdf" onChange={e=>setFile(e.target.files?.[0]||null)}/><button className="btn btn-gold" disabled={!file||busy} onClick={upload}>{busy?'Uploading…':'Submit Receipt'}</button>{msg&&<p className="success">{msg}</p>}<p className="muted small">After we verify your payment, the download button will appear automatically.</p></div></div>}
 <div className="card order-items"><h2>{paid?'Your Downloads':'Your Photos'}</h2>{order.items.map((i:any)=><div className="download-row" key={i.title}><div><strong>{i.title}</strong><div className="muted">${(i.priceCents/100).toFixed(2)}</div></div>{paid&&i.downloadUrl?<a className="btn btn-gold" href={i.downloadUrl}>Download Original</a>:<span className="muted">Waiting for payment approval</span>}</div>)}</div>
 </main>
}
