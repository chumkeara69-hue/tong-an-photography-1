```tsx
"use client";

import { use, useEffect, useState } from "react";
import { STORE } from "@/lib/store-config";

type OrderItem = {
  title: string;
  priceCents: number;
  downloadUrl: string | null;
};

type Order = {
  orderNumber: string;
  totalCents: number;
  paymentStatus: string;
  orderStatus: string;
  items: OrderItem[];
};

export default function OrderPage({
  params,
}: {
  params: Promise<{ accessToken: string }>;
}) {
  const { accessToken } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const r = await fetch(`/api/orders/${accessToken}`, {
        cache: "no-store",
      });

      if (r.ok) {
        setOrder(await r.json());
      }
    } catch {
      setMsg("Could not load order.");
    }
  }

  useEffect(() => {
    load();
  }, [accessToken]);

  async function upload() {
    if (!file) return;

    setBusy(true);
    setMsg("");

    try {
      const p = await fetch(`/api/orders/${accessToken}/receipt`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const d = await p.json();

      if (!p.ok) {
        throw new Error(d.error || "Upload setup failed");
      }

      const up = await fetch(d.url, {
        method: "PUT",
        headers: {
          "content-type": file.type,
        },
        body: file,
      });

      if (!up.ok) {
        throw new Error("Could not upload receipt");
      }

      const c = await fetch(
        `/api/orders/${accessToken}/receipt/complete`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            key: d.key,
          }),
        }
      );

      if (!c.ok) {
        const result = await c.json();
        throw new Error(
          result.error || "Could not save payment receipt"
        );
      }

      setMsg(
        "Payment receipt submitted. Please wait for confirmation."
      );

      setFile(null);
      await load();
    } catch (error) {
      setMsg(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );
    } finally {
      setBusy(false);
    }
  }

  if (!order) {
    return (
      <main className="container section">
        <div className="card empty">Loading order…</div>
      </main>
    );
  }

  const paid = order.paymentStatus === "PAID";

  return (
    <main className="container section order-page">
      <div className="order-header">
        <div>
          <p className="eyebrow">
            ORDER {order.orderNumber}
          </p>

          <h1>
            {paid
              ? "Payment Confirmed"
              : "Payment & Download"}
          </h1>

          <p className="muted">
            Keep this page to access your order.
          </p>
        </div>

        <span
          className={`status status-${order.paymentStatus.toLowerCase()}`}
        >
          {order.paymentStatus}
        </span>
      </div>

      {!paid && (
        <div className="payment-layout">
          <div className="card qr-card">
            <h2>1. Pay by QR</h2>

            <img
              className="qr-image"
              src={STORE.paymentQrPath}
              alt="Payment QR code"
            />

            <p className="muted">
              {STORE.paymentNote}
            </p>

            <div className="payment-steps">
              {STORE.paymentInstructions.map(
                (instruction, index) => (
                  <div key={instruction}>
                    <b>{index + 1}</b>
                    <span>{instruction}</span>
                  </div>
                )
              )}
            </div>

            <div className="total-box">
              Amount to pay{" "}
              <strong>
                ${(order.totalCents / 100).toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="card form-card">
            <h2>2. Upload Payment Receipt</h2>

            <p className="muted">
              Upload a clear screenshot showing the
              successful payment and amount.
            </p>

            <input
              className="input"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
            />

            <button
              className="btn btn-gold"
              disabled={!file || busy}
              onClick={upload}
            >
              {busy
                ? "Uploading…"
                : "Submit Receipt"}
            </button>

            {msg && (
              <p className="success">{msg}</p>
            )}

            <p className="muted small">
              After we verify your payment, the download
              button will appear automatically.
            </p>
          </div>
        </div>
      )}

      <div className="card order-items">
        <h2>
          {paid ? "Your Downloads" : "Your Photos"}
        </h2>

        {order.items.map((item, index) => (
          <div
            className="download-row"
            key={`${item.title}-${index}`}
          >
            <div>
              <strong>{item.title}</strong>

              <div className="muted">
                ${(item.priceCents / 100).toFixed(2)}
              </div>
            </div>

            {paid && item.downloadUrl ? (
              <a
                className="btn btn-gold"
                href={item.downloadUrl}
              >
                Download Original
              </a>
            ) : (
              <span className="muted">
                Waiting for payment approval
              </span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
```
