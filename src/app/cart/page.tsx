'use client';
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
type Photo={id:string,title:string,category:string,priceCents:number,previewStorageKey:string};
export default function CartPage(){const params=useSearchParams();const [ids,setIds]=useState<string[]>([]);const [photos,setPhotos]=useState<Photo[]>([]);
 useEffect(()=>{fetch('/api/photos').then(r=>r.json()).then(setPhotos);},[]);
 useEffect(()=>{const saved=JSON.parse(localStorage.getItem('tong_an_cart')||'[]');let next=[...saved];const add=params.get('add');if(add&&!next.includes(add))next.push(add);localStorage.setItem('tong_an_cart',JSON.stringify(next));setIds(next)},[params]);
 const items=useMemo(()=>ids.map(id=>photos.find(p=>p.id===id)).filter(Boolean) as Photo[],[ids,photos]);const total=items.reduce((s,p)=>s+p.priceCents,0);
 function remove(id:string){const next=ids.filter(x=>x!==id);setIds(next);localStorage.setItem('tong_an_cart',JSON.stringify(next))}
 return <main className="container section"><p className="eyebrow">YOUR CART</p><h1>Selected Photos</h1>{items.length===0?<div className="card empty"><p>Your cart is empty.</p><Link className="btn btn-gold" href="/photos">Browse Photos</Link></div>:<><div className="cart-list">{items.map(p=><div className="card cart-item" key={p.id}><img src={p.previewStorageKey} alt={p.title}/><div><h3>{p.title}</h3><p className="muted">{p.category}</p><strong className="price">${(p.priceCents/100).toFixed(2)}</strong></div><button className="btn btn-dark" onClick={()=>remove(p.id)}>Remove</button></div>)}</div><div className="checkout-bar"><div><span className="muted">Total</span><strong>${(total/100).toFixed(2)}</strong></div><Link className="btn btn-gold" href="/checkout">Continue to Payment</Link></div></>}</main>}
