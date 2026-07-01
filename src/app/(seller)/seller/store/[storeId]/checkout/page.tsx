"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { createOrder, getOrderStatus } from "@/features/orders/api/orders.api";
import { Card, Badge, CustomButton } from "@/shared/components";
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
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  const [isSimulationMode, setIsSimulationMode] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "IDLE" | "PENDING" | "SUCCESS"
  >("IDLE");

  const [cart] = useState<CartItem[]>([
    {
      productId: "prod_str_001",
      name: "Premium Fresh Strawberry Basket",
      quantity: 2,
      price: 150,
    },
    {
      productId: "prod_cof_002",
      name: "Artisanal Highland Coffee Beans (250g)",
      quantity: 1,
      price: 50,
    },
  ]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (isSimulationMode) {
      setOrderId("ORD-LOCAL-SIM-2026");
      setQrString(
        `https://mapanytime.com/pay/ORD-LOCAL-SIM-${storeId.substring(0, 6)}`,
      );
      setPaymentStatus("PENDING");
      return;
    }

    try {
      const data = await createOrder({ storeId, items: cart, totalAmount });
      setOrderId(data.orderId || data.id);
      setQrString(data.qrDataString || data.qrCode);
      setPaymentStatus("PENDING");
    } catch (error) {
      console.error("Error creating transactional context order:", error);
    }
  };

  useEffect(() => {
    if (paymentStatus !== "PENDING" || !orderId) return;

    if (isSimulationMode) {
      const timeout = setTimeout(() => setPaymentStatus("SUCCESS"), 4000);
      return () => clearTimeout(timeout);
    }

    const statusInterval = setInterval(async () => {
      try {
        const data = await getOrderStatus(orderId);
        if (data.status === "SUCCESS" || data.status === "PAID") {
          setPaymentStatus("SUCCESS");
          clearInterval(statusInterval);
        }
      } catch (error) {
        console.error("Error evaluating transactional loop state:", error);
      }
    }, 3000);

    return () => clearInterval(statusInterval);
  }, [paymentStatus, orderId, isSimulationMode]);

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
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Card
        variant="outlined"
        padding="sm"
        className="flex justify-between items-center !rounded-2xl"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-500">
            POS Checkout Terminal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sim-mode"
            checked={isSimulationMode}
            onChange={(e) => setIsSimulationMode(e.target.checked)}
            className="accent-emerald-600 cursor-pointer w-4 h-4"
          />
          <label
            htmlFor="sim-mode"
            className={`text-xs font-black cursor-pointer ${isSimulationMode ? "text-emerald-600" : "text-slate-400"}`}
          >
            Simulation Sandbox Active
          </label>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card
          variant="outlined"
          padding="md"
          className="!rounded-2xl space-y-4"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <h3 className="font-black text-sm text-slate-900">
              Current Basket
            </h3>
          </div>
          <div className="divide-y divide-dashed divide-slate-200">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-700">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Qty: {item.quantity} × ₱{item.price}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-slate-900">
                  ₱{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-900">
              Total Amount Due
            </span>
            <span className="text-xl font-black text-emerald-500 font-mono">
              ₱{totalAmount}
            </span>
          </div>
        </Card>

        <div>
          {paymentStatus === "IDLE" ? (
            <Card
              variant="outlined"
              padding="lg"
              className="text-center flex flex-col items-center justify-center min-h-[300px] !rounded-2xl"
            >
              <QrCode className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-sm font-black text-slate-800">
                Generate Dynamic Invoice
              </h3>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mb-6 mt-1">
                Construct customer-facing map payment endpoints tracked directly
                by compliance ledger nodes.
              </p>
              <CustomButton
                onClick={handleCheckout}
                className="w-full max-w-xs bg-slate-900 text-white"
              >
                Launch Link QR <ArrowRight className="w-4 h-4" />
              </CustomButton>
            </Card>
          ) : (
            <Card
              variant="outlined"
              padding="lg"
              className="text-center flex flex-col items-center justify-center !rounded-2xl shadow-xs"
            >
              <Badge
                variant="warning"
                size="sm"
                className="mb-4 gap-1.5 font-bold !px-3 !py-1"
              >
                <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                <span>
                  {isSimulationMode
                    ? "Simulation Auto-settling..."
                    : "Awaiting Scanner Read Hook..."}
                </span>
              </Badge>
              <h3 className="text-xs font-black text-slate-800 mb-4">
                Customer Invoice Portal Display
              </h3>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl mb-4">
                <QRCodeSVG
                  value={qrString || ""}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Ref Signature Code:
              </span>
              <strong className="text-xs text-slate-800 font-mono block mt-0.5">
                {orderId}
              </strong>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="max-w-md mx-auto p-4 text-center space-y-4">
      <div className="flex flex-col items-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
        <h2 className="text-lg font-black text-slate-900">
          Payment Settled Successfully
        </h2>
      </div>
      <Card
        variant="outlined"
        padding="none"
        className="p-6 text-left space-y-3 shadow-sm font-mono text-xs !rounded-2xl"
      >
        <h3 className="text-center font-black text-sm">
          MapAnytime Marketplace
        </h3>
        <p className="text-center text-[10px] text-slate-400 -mt-2">
          Baguio City, Benguet, Ph
        </p>
        <div className="border-b border-dashed border-slate-200 pb-2 flex justify-between text-[10px] text-slate-400">
          <span>Ref: {orderId}</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="space-y-1.5 py-2 border-b border-dashed border-slate-200">
          {cart.map((i) => (
            <div key={i.productId} className="flex justify-between">
              <span>
                {i.name} x{i.quantity}
              </span>
              <span>₱{i.price * i.quantity}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center font-bold text-sm pt-2">
          <span>Total Amount</span>
          <span>₱{totalAmount}</span>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 text-xs font-bold">
        <button
          onClick={() => window.print()}
          className="border border-slate-200 p-2.5 rounded-xl bg-white text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Ticket
        </button>
        <CustomButton
          onClick={clearCart}
          className="bg-slate-900 text-white !py-2.5"
        >
          <PlusCircle className="w-4 h-4" /> New Cycle
        </CustomButton>
      </div>
    </div>
  );
}
