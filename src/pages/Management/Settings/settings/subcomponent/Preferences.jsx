import React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function Preferences() {
  const preferencesList = [
    { k: "Email Notifications", d: "Receive email for admissions and fees." },
    { k: "SMS Alerts", d: "Send SMS to parents on absentees." },
    { k: "Auto Roll Numbers", d: "Generate roll numbers automatically." },
    { k: "Two-Factor Auth", d: "Require 2FA for admin accounts." },
  ];

  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-semibold text-lg mb-4">Preferences</h3>
      <div className="space-y-4">
        {preferencesList.map((p) => (
          <div key={p.k} className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">{p.k}</p>
              <p className="text-xs text-muted-foreground">{p.d}</p>
            </div>
            <Switch defaultChecked />
          </div>
        ))}
      </div>
    </Card>
  );
}
