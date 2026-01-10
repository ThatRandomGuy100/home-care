"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ================= TYPES ================= */

type Visit = {
  id: string;
  startTime: string;
  endTime: string;
  caregiver: { name: string };
  patient: { name: string };
  smsJobs: { status: "PENDING" | "SENT" | "FAILED" | "SKIPPED" }[];
};

/* ================= ICONS ================= */

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const StethoscopeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HourglassIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SkipIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

/* ================= COMPONENT ================= */

type SmsStatusFilter = "ALL" | "PENDING" | "SENT" | "FAILED" | "SKIPPED";

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [smsStatusFilter, setSmsStatusFilter] = useState<SmsStatusFilter>("ALL");

  const loadVisits = async (skip: number = 0) => {
    try {
      const data = await api<Visit[]>(`/api/visits?skip=${skip}&take=50`);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        if (skip === 0) {
          // Deduplicate initial load as well (in case API returns duplicates)
          const uniqueVisits = Array.from(
            new Map(data.map(v => [v.id, v])).values()
          );
          setVisits(uniqueVisits);
        } else {
          // Deduplicate visits by ID to prevent duplicate keys
          setVisits((prev) => {
            const existingIds = new Set(prev.map(v => v.id));
            const newVisits = data.filter(v => !existingIds.has(v.id));
            return [...prev, ...newVisits];
          });
        }
        // If we got less than 50, there's no more data
        if (data.length < 50) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Failed to load visits:", error);
      if (skip === 0) {
        setVisits([]);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    loadVisits(0).finally(() => setLoading(false));
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadVisits(visits.length);
    setLoadingMore(false);
  };

  /* ===== Time formatter ===== */
  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* ===== Filter visits by SMS status ===== */
  const filteredVisits = visits.filter((visit) => {
    if (smsStatusFilter === "ALL") return true;
    
    const statuses = visit.smsJobs.map((job) => job.status);
    
    if (smsStatusFilter === "PENDING") {
      return statuses.includes("PENDING");
    }
    if (smsStatusFilter === "SENT") {
      return statuses.includes("SENT") && !statuses.includes("PENDING") && !statuses.includes("FAILED");
    }
    if (smsStatusFilter === "FAILED") {
      return statuses.includes("FAILED");
    }
    if (smsStatusFilter === "SKIPPED") {
      return statuses.includes("SKIPPED");
    }
    
    return true;
  });

  /* ===== Group visits by date (US time) ===== */
  const groupedVisits = filteredVisits.reduce((groups, visit) => {
    const date = new Date(visit.startTime).toLocaleDateString("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!groups[date]) groups[date] = [];
    groups[date].push(visit);
    return groups;
  }, {} as Record<string, Visit[]>);

  const getSmsStatus = (jobs: Visit["smsJobs"]) => {
    const sentCount = jobs.filter(j => j.status === "SENT").length;
    const pendingCount = jobs.filter(j => j.status === "PENDING").length;
    const failedCount = jobs.filter(j => j.status === "FAILED").length;
    const skippedCount = jobs.filter(j => j.status === "SKIPPED").length;
    const totalCount = jobs.length;

    if (failedCount > 0) {
      return {
        label: failedCount === totalCount
          ? "SMS Failed"
          : `${sentCount} Sent, ${pendingCount} Pending, ${skippedCount} Skipped, ${failedCount} Failed`,
        icon: <AlertCircleIcon />,
        className: "bg-rose-100 text-rose-700"
      };
    }

    if (skippedCount > 0) {
      return {
        label: `${sentCount} Sent, ${pendingCount} Pending, ${skippedCount} Skipped`,
        icon: <SkipIcon />,
        className: "bg-slate-100 text-slate-700"
      };
    }

    if (pendingCount > 0) {
      return {
        label: `${sentCount} Sent, ${pendingCount} Pending`,
        icon: <HourglassIcon />,
        className: "bg-amber-100 text-amber-700"
      };
    }

    return {
      label: "All Sent",
      icon: <CheckCircleIcon />,
      className: "bg-emerald-100 text-emerald-700"
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
          </div>

          {/* Date skeleton */}
          <div className="h-4 w-48 rounded bg-muted animate-pulse" />

          {/* Card skeletons */}
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4 flex gap-4">
                <div className="w-28 space-y-2">
                  <div className="h-3 w-16 mx-auto rounded bg-muted animate-pulse" />
                  <div className="h-5 w-20 mx-auto rounded bg-muted animate-pulse" />
                  <div className="h-3 w-6 mx-auto rounded bg-muted animate-pulse" />
                  <div className="h-5 w-20 mx-auto rounded bg-muted animate-pulse" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-5 w-40 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-20 rounded bg-muted animate-pulse mt-3" />
                  <div className="h-5 w-36 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-7 w-24 rounded-full bg-muted animate-pulse self-start" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="icon" variant="outline">
                <ArrowLeftIcon />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Visits</h1>
          </div>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FilterIcon />
                Filter: {smsStatusFilter === "ALL" ? "All Status" : smsStatusFilter}
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>SMS Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSmsStatusFilter("ALL")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSmsStatusFilter("PENDING")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSmsStatusFilter("SENT")}>
                Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSmsStatusFilter("FAILED")}>
                Failed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSmsStatusFilter("SKIPPED")}>
                Skipped
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Visits */}
        {Object.entries(groupedVisits).map(([date, dateVisits]) => (
          <div key={date} className="space-y-4">
            <p className="text-sm text-muted-foreground">{date}</p>

            {dateVisits.map(visit => {
              const sms = getSmsStatus(visit.smsJobs);

              return (
                <Card key={visit.id}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-28 text-center">
                      <div className="text-xs text-muted-foreground">
                        Time (EST)
                      </div>
                      <div className="font-semibold">{formatTime(visit.startTime)}</div>
                      <div className="text-xs">to</div>
                      <div className="font-semibold">{formatTime(visit.endTime)}</div>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Patient</p>
                      <p className="font-semibold">{visit.patient.name}</p>

                      <p className="text-sm text-muted-foreground mt-2">Caregiver</p>
                      <p>{visit.caregiver.name}</p>
                    </div>

                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 h-fit ${sms.className}`}>
                      {sms.icon}
                      {sms.label}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              className="min-w-32"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}

        {/* No more data message */}
        {!hasMore && visits.length > 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            No more visits to load
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredVisits.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">No visits found</p>
            {smsStatusFilter !== "ALL" && (
              <p className="text-sm mt-2">Try adjusting your filter</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
