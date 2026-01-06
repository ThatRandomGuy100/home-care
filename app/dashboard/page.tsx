"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Stats = {
  visitsToday: number;
  pendingSms: number;
  failedSms: number;
};

// Icons as SVG components
const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Stats>("/api/dashboard/stats")
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Visits Today",
      value: stats?.visitsToday ?? 0,
      icon: <CalendarIcon />,
      color: "from-cyan-500/20 to-teal-500/10",
      iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-200/50 dark:border-cyan-800/30",
    },
    {
      label: "Pending SMS",
      value: stats?.pendingSms ?? 0,
      icon: <ClockIcon />,
      color: "from-amber-500/20 to-orange-500/10",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      border: "border-amber-200/50 dark:border-amber-800/30",
    },
    {
      label: "Failed SMS",
      value: stats?.failedSms ?? 0,
      icon: <AlertIcon />,
      color: "from-rose-500/20 to-red-500/10",
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      border: "border-rose-200/50 dark:border-rose-800/30",
    },
  ];

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <header className="animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 text-primary">
                <HeartIcon />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                  Homecare Admin
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage visits and SMS notifications
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/dashboard/import">
                <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                  <UploadIcon />
                  Import Excel
                </Button>
              </Link>

              <Link href="/dashboard/visits">
                <Button variant="outline" className="gap-2 hover:bg-accent/50 transition-all duration-300">
                  <ListIcon />
                  View Visits
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <Card
              key={stat.label}
              className={`relative overflow-hidden border ${stat.border} hover:shadow-lg transition-all duration-300 animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-50`} />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      {loading ? (
                        <div className="h-10 w-16 bg-muted/50 rounded animate-pulse-soft" />
                      ) : (
                        <p className="text-4xl font-bold tracking-tight">
                          {stat.value}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Quick Actions Section */}
        <section className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <Card className="border-dashed border-2 hover:border-primary/30 transition-colors duration-300">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-muted/50">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Quick Start</h3>
                  <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                    Import your Excel schedule to automatically generate SMS reminders for caregivers and patients.
                  </p>
                </div>
                <Link href="/dashboard/import">
                  <Button variant="outline" size="lg" className="mt-2 gap-2">
                    <UploadIcon />
                    Upload Schedule
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
