// src/app/(seller)/seller/store/[storeId]/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  ShoppingBag,
  QrCode,
  Printer,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export default function SellerCheckout() {
  const params = useParams();
  const storeId = params?.storeId as string;

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  const [cart] = useState<CartItem[]>([
    {
      productId: "123",
      name: "Premium Fresh Strawberry Basket",
      quantity: 2,
      price: 150,
    },
    {
      productId: "456",
      name: "Artisanal Highland Coffee Beans (250g)",
      quantity: 1,
      price: 50,
    },
  ]);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "IDLE" | "PENDING" | "SUCCESS"
  >("IDLE");

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (isSimulationMode) {
      setOrderId("ORD-9841-2026");
      setQrString("https://mapanytime.com/pay/ORD-9841-2026");
      setPaymentStatus("PENDING");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, items: cart, totalAmount }),
      });

      const data = await response.json();
      setOrderId(data.orderId);
      setQrString(data.qrDataString);
      setPaymentStatus("PENDING");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  useEffect(() => {
    if (paymentStatus !== "PENDING" || !orderId) return;

    if (isSimulationMode) {
      const timeout = setTimeout(() => {
        setPaymentStatus("SUCCESS");
      }, 5000);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/orders/${orderId}/status`,
        );
        const data = await response.json();

        if (data.status === "SUCCESS") {
          setPaymentStatus("SUCCESS");
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentStatus, orderId, API_BASE_URL, isSimulationMode]);

  // 📄 STAGE 3: PREMIUM THERMAL RECEIPT SLIP VIEW
  if (paymentStatus === "SUCCESS") {
    return (
      <ReceiptView
        orderId={orderId}
        cart={cart}
        totalAmount={totalAmount}
        clearCart={() => setPaymentStatus("IDLE")}
      />
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
      {/* Simulation Toggle Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          backgroundColor: "#fff",
          padding: "0.75rem 1.25rem",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span
            style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}
          >
            POS Checkout Terminal
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            id="sim-mode"
            checked={isSimulationMode}
            onChange={(e) => setIsSimulationMode(e.target.checked)}
            style={{
              width: "16px",
              height: "16px",
              cursor: "pointer",
              accentColor: "#059669",
            }}
          />
          <label
            htmlFor="sim-mode"
            style={{
              fontSize: "0.85rem",
              color: isSimulationMode ? "#059669" : "#64748b",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Simulation Mode {isSimulationMode ? "(Demo Active)" : "(Off)"}
          </label>
        </div>
      </div>

      {/* 📊 STAGE 1 & 2: TWO-COLUMN MAIN WORKSPACE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Itemized Order Summary Card */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "#f0fdf4",
                borderRadius: "8px",
              }}
            >
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Current Order
              </h3>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                Store Session: {storeId || "Active"}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {cart.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "1rem",
                  borderBottom: "1px dashed #e2e8f0",
                }}
              >
                <div>
                  <h4
                    style={{
                      margin: "0 0 0.25rem 0",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "#334155",
                    }}
                  >
                    {item.name}
                  </h4>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      backgroundColor: "#f8fafc",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    Qty: <strong>{item.quantity}</strong> × ₱{item.price}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  ₱{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "1.25rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#64748b",
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
              }}
            >
              <span>Subtotal</span>
              <span>₱{totalAmount}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#64748b",
                fontSize: "0.85rem",
                marginBottom: "0.75rem",
              }}
            >
              <span>Tax/VAT (0%)</span>
              <span>₱0.00</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "0.75rem",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                Total Amount Due
              </span>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  color: "#10b981",
                }}
              >
                ₱{totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Payment Gateway Engine */}
        <div style={{ minHeight: "380px" }}>
          {paymentStatus === "IDLE" && (
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "3rem 2rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  color: "#3b82f6",
                  justifyContent: "center",
                }}
              >
                <QrCode className="w-8 h-8" />
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  marginBottom: "0.5rem",
                  color: "#0f172a",
                }}
              >
                Generate Digital Payment Link
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.85rem",
                  maxWidth: "320px",
                  margin: "0 auto 2rem auto",
                  lineHeight: 1.5,
                }}
              >
                Click below to construct a protected dynamic QR code tracking
                invoice records directly into checkout systems.
              </p>
              <button
                onClick={handleCheckout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  justifyContent: "center",
                  padding: "1rem 2rem",
                  width: "100%",
                  maxWidth: "320px",
                  cursor: "pointer",
                  backgroundColor: "#0f172a",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.1)",
                  transition: "all 0.2s",
                }}
              >
                Launch QR Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {paymentStatus === "PENDING" && qrString && (
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "2.5rem 2rem",
                textAlign: "center",
                boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.05)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fef3c7",
                  borderRadius: "9999px",
                  marginBottom: "1.5rem",
                }}
              >
                <RefreshCw
                  className="w-3 h-3 text-amber-500 animate-spin"
                  style={{ animation: "spin 2s linear infinite" }}
                />
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#b45309",
                  }}
                >
                  {isSimulationMode
                    ? "Simulation Running..."
                    : "Awaiting Transaction Scan..."}
                </span>
              </div>

              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  margin: "0 0 1.5rem 0",
                  color: "#0f172a",
                }}
              >
                Customer Facing QR display
              </h3>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "1.5rem",
                  display: "inline-block",
                  borderRadius: "24px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    background: "white",
                    padding: "1rem",
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  }}
                >
                  <QRCodeSVG
                    value={qrString}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Unified Transaction Reference
                </span>
                <strong
                  style={{
                    fontSize: "0.95rem",
                    color: "#0f172a",
                    letterSpacing: "0.5px",
                  }}
                >
                  {orderId}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 📄 COMPONENT: AUTHENTIC RETAIL THERMAL INVOICE SLIP
function ReceiptView({
  orderId,
  cart,
  totalAmount,
  clearCart,
}: {
  orderId: string | null;
  cart: CartItem[];
  totalAmount: number;
  clearCart: () => void;
}) {
  return (
    <div style={{ padding: "2rem 1rem", maxWidth: "460px", margin: "0 auto" }}>
      {/* Visual Success Accent Banner */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#dcfce7",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "0.75rem",
            color: "#16a34a",
          }}
        >
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 900,
            color: "#0f172a",
          }}
        >
          Payment Settled
        </h2>
        <p
          style={{
            margin: "0.25rem 0 0 0",
            fontSize: "0.85rem",
            color: "#64748b",
          }}
        >
          Invoice registered securely
        </p>
      </div>

      {/* The Printable Paper Slip */}
      <div
        id="receipt-container"
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          padding: "2.5rem 2rem",
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05)",
          borderRadius: "1px",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h3
            style={{
              margin: "0 0 0.25rem 0",
              fontSize: "1.25rem",
              fontWeight: 900,
              letterSpacing: "-0.5px",
              color: "#0f172a",
            }}
          >
            MapAnytime Marketplace
          </h3>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            Baguio City, Benguet, Ph
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "#64748b",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <span>Ref: {orderId}</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        {/* Itemized Loop */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {cart.map((item) => (
            <div
              key={item.productId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ color: "#334155" }}>
                {item.name}{" "}
                <small style={{ color: "#94a3b8" }}>x{item.quantity}</small>
              </span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>
                ₱{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px dashed #cbd5e1",
            margin: "1.5rem 0",
          }}
        />

        {/* Totals Section */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "#64748b",
            }}
          >
            <span>Settlement Gateway</span>
            <span>Digital QR Code</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.5rem",
            }}
          >
            <span
              style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}
            >
              Total Amount
            </span>
            <span
              style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a" }}
            >
              ₱{totalAmount}
            </span>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "2.5rem",
            fontSize: "0.75rem",
            color: "#94a3b8",
            fontStyle: "italic",
          }}
        >
          Thank you for purchasing!
        </div>
      </div>

      {/* Control Buttons */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        <button
          onClick={() => window.print()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            justifyContent: "center",
            padding: "0.75rem",
            cursor: "pointer",
            backgroundColor: "#fff",
            color: "#334155",
            border: "1px solid #cbd5e1",
            borderRadius: "12px",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          <Printer className="w-4 h-4" /> Print Ticket
        </button>
        <button
          onClick={clearCart}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            justifyContent: "center",
            padding: "0.75rem",
            cursor: "pointer",
            backgroundColor: "#0f172a",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          <PlusCircle className="w-4 h-4" /> New Cycle
        </button>
      </div>
    </div>
  );
}
