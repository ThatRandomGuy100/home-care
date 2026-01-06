"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Visit = {
  id: string;
  startTime: string;
  endTime: string;
  caregiver: { name: string };
  patient: { name: string };
  smsJobs: { status: "PENDING" | "SENT" | "FAILED" }[];
};

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
  

  if (loading) {
    return <p className="p-6">Loading visits...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Visits</h1>

      {visits.map((visit) => {
       const smsJobs = visit.smsJobs ?? [];
       const hasFailed = smsJobs.some(j => j.status === "FAILED");
       const hasPending = smsJobs.some(j => j.status === "PENDING");
       

        return (
          <Card key={visit.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium">
                    {visit.patient.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Caregiver: {visit.caregiver.name}
                  </p>
                </div>

                <div className="text-sm">
                  {new Date(visit.startTime).toLocaleTimeString("en-IN")} –{" "}
                  {new Date(visit.endTime).toLocaleTimeString("en-IN")}
                </div>
              </div>

              <div className="flex gap-2">
                {hasFailed && <Badge variant="destructive">SMS Failed</Badge>}
                {hasPending && <Badge variant="outline">SMS Pending</Badge>}
                {!hasFailed && !hasPending && (
                  <Badge variant="secondary">All SMS Sent</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
