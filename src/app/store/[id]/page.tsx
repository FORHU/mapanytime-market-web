import { Metadata } from "next";
import StorePageClient from "./StorePageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/stores/${id}`,
      { cache: "no-store" },
    );
    const json = await res.json();
    const store = json?.data;
    return {
      title: store?.storeName ?? "Store",
      description:
        store?.description ?? "Browse products from this store on MapAnytime.",
    };
  } catch {
    return { title: "Store" };
  }
}

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  return <StorePageClient storeId={id} />;
}
