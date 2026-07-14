"use client";

export interface AIAnalysisPayload {
  title: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  tags: string[];
}

export async function uploadAIImage(file: File): Promise<AIAnalysisPayload> {
  return new Promise((resolve, reject) => {
    if (!file) return reject("No file stream present");

    setTimeout(() => {
      const cleanName = file.name
        .split(".")[0]
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

      resolve({
        title: `AI Extracted: ${file.name.split(".")[0].replace(/[-_]/g, " ")}`,
        description: `Automated semantic data extraction matrix executed successfully for file structural node: ${file.name}. Verification pending manual operator signing.`,
        price: parseFloat((Math.random() * 150 + 10).toFixed(2)),
        stock: Math.floor(Math.random() * 100) + 1,
        sku: `SKU-${cleanName}-${Math.floor(1000 + Math.random() * 9000)}`,
        tags: ["AI Ingested", "New Inventory", "Pending Audit"],
      });
    }, 2500);
  });
}
