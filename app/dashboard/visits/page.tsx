"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Visit = {
  id: string;
  startTime: string;
  endTime: string;
  caregiver: { name: string };
  patient: { name: string };
  smsJobs: { status: "PENDING" | "SENT" | "FAILED" }[];
};

// Icons
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

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EmptyIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Visit[]>("/api/visits")
      .then(setVisits)
      .catch((err) => {
        console.error("Failed to load visits", err);
        setVisits([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Group visits by date
  const groupedVisits = visits.reduce((groups, visit) => {
    const date = new Date(visit.startTime).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(visit);
    return groups;
  }, {} as Record<string, Visit[]>);

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getSmsStatus = (smsJobs: Visit["smsJobs"]) => {
    const jobs = smsJobs ?? [];
    const hasFailed = jobs.some((j) => j.status === "FAILED");
    const hasPending = jobs.some((j) => j.status === "PENDING");

    if (hasFailed)
      return {
        status: "failed",
        label: "SMS Failed",
        icon: <AlertCircleIcon />,
        className:
          "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
      };
    if (hasPending)
      return {
        status: "pending",
        label: "SMS Pending",
        icon: <HourglassIcon />,
        className:
          "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
      };
    return {
      status: "sent",
      label: "All Sent",
      icon: <CheckCircleIcon />,
      className:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-lg bg-muted animate-pulse-soft" />
            <div className="h-8 w-32 bg-muted rounded animate-pulse-soft" />
          </div>

          {/* Card Skeletons */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse-soft">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-5 w-48 bg-muted rounded" />
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with Back Button */}
        <header className="animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                <h1 className="text-3xl font-bold tracking-tight">Visits</h1>
                <p className="text-muted-foreground mt-1">
                  {visits.length} scheduled visit{visits.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon />
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Empty State */}
        {visits.length === 0 && (
          <Card className="animate-slide-up">
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-muted/50 text-muted-foreground">
                  <EmptyIcon />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No Visits Found</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                    Import an Excel schedule to see visits here.
                  </p>
                </div>
                <Link href="/dashboard/import">
                  <Button className="mt-2">Import Schedule</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visits Grouped by Date */}
        {Object.entries(groupedVisits).map(([date, dateVisits], groupIndex) => (
          <section
            key={date}
            className="space-y-4 animate-slide-up"
            style={{ animationDelay: `${groupIndex * 100}ms` }}
          >
            {/* Date Header */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm font-medium text-muted-foreground px-3 py-1 rounded-full bg-muted/50">
                {date}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Visit Cards */}
            <div className="grid gap-4">
              {dateVisits.map((visit, index) => {
                const smsStatus = getSmsStatus(visit.smsJobs);

                return (
                  <Card
                    key={visit.id}
                    className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
                    style={{ animationDelay: `${(groupIndex * 100) + (index * 50)}ms` }}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Time Column */}
                        <div className="shrink-0 w-28 bg-linear-to-br from-primary/10 to-primary/5 p-4 flex flex-col items-center justify-center border-r border-border/50">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Time
                          </div>
                          <div className="text-sm font-semibold text-primary">
                            {formatTime(visit.startTime)}
                          </div>
                          <div className="text-xs text-muted-foreground my-1">to</div>
                          <div className="text-sm font-semibold text-primary">
                            {formatTime(visit.endTime)}
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-3">
                              {/* Patient */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500/20 to-teal-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                  <UserIcon />
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Patient
                                  </p>
                                  <p className="font-semibold text-lg">
                                    {visit.patient.name}
                                  </p>
                                </div>
                              </div>

                              {/* Caregiver */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                  <StethoscopeIcon />
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Caregiver
                                  </p>
                                  <p className="font-medium">
                                    {visit.caregiver.name}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* SMS Status Badge */}
                            <div className="flex items-start">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${smsStatus.className}`}
                              >
                                {smsStatus.icon}
                                {smsStatus.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
