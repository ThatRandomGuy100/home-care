"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ImportResult = {
  success: boolean;
  created: number;
  skipped: number;
  total: number;
  error?: string;
};

export default function ExcelImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import/excel", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Import failed");
      }

      setResult(data);
    } catch (err: any) {
      setResult({
        success: false,
        created: 0,
        skipped: 0,
        total: 0,
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Excel Import</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? "Uploading..." : "Upload Excel"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {result.success ? (
              <>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">
                    Total Rows: {result.total}
                  </Badge>
                  <Badge variant="default">
                    Created: {result.created}
                  </Badge>
                  <Badge variant="outline">
                    Skipped: {result.skipped}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-red-600">
                ❌ {result.error}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
