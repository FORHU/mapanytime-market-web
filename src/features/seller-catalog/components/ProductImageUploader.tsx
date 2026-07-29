"use client";

import React, { useState, ChangeEvent } from "react";
import { useS3AssetUpload } from "@/shared/hooks/useS3AssetUpload";
import { Button } from "@/shared/components/ui/Button";
import { Camera } from "lucide-react";

export default function ProductImageUploader() {
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const { mutate, isPending } = useS3AssetUpload("products");

  const handleSelection = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTargetFile(e.target.files[0]);
    }
  };

  const commitAsset = () => {
    if (targetFile) {
      mutate(targetFile, {
        onSuccess: () => setTargetFile(null), // Reset selection on success
      });
    }
  };

  return (
    <div className="space-y-4 text-left">
      <label
        className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer group"
        style={{ borderColor: "var(--border-light)" }}
      >
        <Camera className="w-8 h-8 text-zinc-400 group-hover:scale-110 transition-transform mb-2" />
        <span className="text-xs font-semibold text-zinc-500 text-center max-w-[200px] truncate">
          {targetFile ? targetFile.name : "Select Snapshot Media"}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleSelection}
          className="hidden"
        />
      </label>

      <Button
        onClick={commitAsset}
        isLoading={isPending}
        disabled={!targetFile}
      >
        Publish Media Live
      </Button>
    </div>
  );
}
