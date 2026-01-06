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

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/api/dashboard/stats").then(setStats);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Homecare Admin</h1>

        <div className="flex gap-2">
          <Link href="/dashboard/import">
            <Button>Import Excel</Button>
          </Link>

          <Link href="/dashboard/visits">
            <Button variant="outline">View Visits</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Visits Today</p>
            <p className="text-2xl font-bold">
              {stats ? stats.visitsToday : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending SMS</p>
            <p className="text-2xl font-bold">
              {stats ? stats.pendingSms : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Failed SMS</p>
            <p className="text-2xl font-bold">
              {stats ? stats.failedSms : "—"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
