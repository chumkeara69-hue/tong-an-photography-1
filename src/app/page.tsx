import Link from "next/link";
import { prisma } from "@/lib/prisma";
export default async function Home() {
 const photos=await prisma.photo.findMany({where:{status:"PUBLISHED"},orderBy:{createdAt:"desc"},take:8,include:{category:true}});
 return <main><section className="hero"><div className="container hero-inner"><div><p className="eyebrow">TONG AN PHOTOGRAPHY</p><h1>Capture the Beauty.<br/>Preserve the Moment.</h1><p className="lead">Original photography, beautiful Cambodian moments, and high-quality licensed downloads.</p><div className="hero-actions"><Link className="btn btn-gold" href="/photos">Browse Photos</Link></div></div>{photos[0]?<img className="hero-image" src={photos[0].previewStorageKey} alt={photos[0].title}/>:<img className="hero-image" src="/version-3-preview.png" alt="Tong An Photography"/>}</div></section>
 <section className="container section"><div className="section-head"><h2>Latest Photos</h2><Link href="/photos">View all →</Link></div><div className="photo-grid">{photos.map(p=><Link key={p.id} href={`/photos/${p.slug}`} className="card photo-card"><img src={p.previewStorageKey} alt={p.title}/><div className="photo-info"><div><div className="photo-title">{p.title}</div><small>{p.category.name}</small></div><div className="price">${(p.priceCents/100).toFixed(2)}</div></div></Link>)}</div></section></main>;
}
