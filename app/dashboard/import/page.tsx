"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ImportResult = {
  success: boolean;
  created: number;
  skipped: number;
  total: number;
  error?: string;
};

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default function ExcelImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Import failed");
      }

      setResult(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Import failed";
      setResult({
        success: false,
        created: 0,
        skipped: 0,
        total: 0,
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".xlsx")) {
        setFile(droppedFile);
        setResult(null);
      }
    }
  };

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with Back Button */}
        <header className="animate-fade-in">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl hover:bg-accent/50 transition-all duration-300"
              >
                <ArrowLeftIcon />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Import Schedule</h1>
              <p className="text-muted-foreground mt-1">
                Upload your Excel file to import visits
              </p>
            </div>
          </div>
        </header>

        {/* Upload Card */}
        <Card className="animate-slide-up overflow-hidden">
          <CardContent className="p-0">
            {/* Drop Zone */}
            <div
              className={`relative p-8 transition-all duration-300 ${
                dragActive
                  ? "bg-primary/5 border-2 border-dashed border-primary"
                  : "border-b border-border"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center space-y-4">
                <div
                  className={`inline-flex p-4 rounded-2xl transition-colors duration-300 ${
                    dragActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <UploadCloudIcon />
                </div>

                <div>
                  <p className="text-lg font-medium">
                    {dragActive ? "Drop your file here" : "Drag and drop your Excel file"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click below to browse
                  </p>
                </div>

                <div className="pt-2">
                  <label className="cursor-pointer">
                    <Input
                      type="file"
                      accept=".xlsx"
                      className="hidden"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] || null);
                        setResult(null);
                      }}
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">
                      <FileIcon />
                      Browse Files
                    </span>
                  </label>
                </div>

                <p className="text-xs text-muted-foreground">
                  Supported format: .xlsx
                </p>
              </div>
            </div>

            {/* Selected File */}
            {file && (
              <div className="p-4 bg-muted/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  Remove
                </Button>
              </div>
            )}

            {/* Upload Button */}
            <div className="p-6">
              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full h-12 text-base gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <SpinnerIcon />
                    Importing...
                  </>
                ) : (
                  <>
                    <UploadCloudIcon />
                    Upload & Import
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && (
          <Card
            className={`animate-slide-up overflow-hidden ${
              result.success
                ? "border-emerald-200 dark:border-emerald-800/30"
                : "border-rose-200 dark:border-rose-800/30"
            }`}
          >
            <CardContent className="p-6">
              {result.success ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <CheckCircleIcon />
                    <span className="font-semibold text-lg">Import Successful!</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <p className="text-2xl font-bold">{result.total}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Total Rows
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-emerald-500/10">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {result.created}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Created
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-amber-500/10">
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {result.skipped}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Skipped
                      </p>
                    </div>
                  </div>

                  <Link href="/dashboard/visits">
                    <Button variant="outline" className="w-full mt-2 gap-2">
                      View Imported Visits
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-rose-600 dark:text-rose-400">
                  <XCircleIcon />
                  <div>
                    <p className="font-semibold">Import Failed</p>
                    <p className="text-sm mt-1 opacity-90">{result.error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="animate-slide-up border-dashed" style={{ animationDelay: "200ms" }}>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Excel Format Guidelines</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Include columns: Patient Name, Caregiver Name, Visit Date, Start Time, End Time
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Dates should be in a standard format (DD/MM/YYYY or YYYY-MM-DD)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Times should include AM/PM or use 24-hour format
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Duplicate visits will be automatically skipped
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
