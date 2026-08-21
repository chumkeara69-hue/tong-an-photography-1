import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApproveButton from "./ApproveButton";

export default async function Orders() {
  const u = await getCurrentUser();
  if (!u || u.role !== "ADMIN") redirect("/admin/login");
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { customer: true, items: { include: { photo: true } } } });
  return <main className="container section">
    <div className="section-head"><div><p className="eyebrow">ADMIN</p><h1>Orders & Payments</h1><p className="muted">Review payment screenshots and approve downloads.</p></div></div>
    <div className="admin-list">
      {orders.map(o => <div className="card order-card" key={o.id}>
        <div className="order-top"><div><strong>{o.orderNumber}</strong><div className="muted">{o.customer?.email || "Guest"} · {new Date(o.createdAt).toLocaleString()}</div></div><span className={`status status-${o.paymentStatus.toLowerCase()}`}>{o.paymentStatus}</span></div>
        <div className="order-items">{o.items.map(i => <div key={i.id}>{i.photo.title} — ${(i.priceCents/100).toFixed(2)}</div>)}</div>
        <div className="order-bottom"><strong>Total ${(o.totalCents/100).toFixed(2)}</strong><div className="order-actions">{o.paymentProofStorageKey && <a className="btn btn-dark" href={`/api/admin/orders/${o.id}/proof`} target="_blank">View Receipt</a>}{o.paymentStatus === "PENDING" && o.paymentProofStorageKey && <ApproveButton id={o.id}/>}</div></div>
      </div>)}
    </div>
  </main>;
}
