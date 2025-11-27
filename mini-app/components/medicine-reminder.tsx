"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";

type Reminder = {
  id: string;
  medicine: string;
  time: string; // "HH:MM"
  frequency: string; // "once", "twice", "specific"
  days?: string[]; // for specific days
};

export default function MedicineReminder() {
  const [medicine, setMedicine] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [days, setDays] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Load reminders from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("medicineReminders");
    if (stored) {
      setReminders(JSON.parse(stored));
    }
  }, []);

  // Persist reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("medicineReminders", JSON.stringify(reminders));
  }, [reminders]);

  // Notification loop: check every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      reminders.forEach((rem) => {
        if (rem.time === currentTime) {
          alert(`Time to take your medicine: ${rem.medicine}`);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const handleSave = () => {
    if (!medicine || !time) return;
    const newReminder: Reminder = {
      id: uuidv4(),
      medicine,
      time,
      frequency,
      days: frequency === "specific" ? days : undefined,
    };
    setReminders((prev) => [...prev, newReminder]);
    // Reset form
    setMedicine("");
    setTime("");
    setFrequency("once");
    setDays([]);
  };

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };
  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((rem) => rem.id !== id));
  };

  return (
    <div className="w-full max-w-md space-y-6 bg-background p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-primary">Create a Medicine Reminder</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="medicine">Medicine</Label>
          <Input
            id="medicine"
            placeholder="e.g., Aspirin"
            value={medicine}
            onChange={(e) => setMedicine(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={frequency}
            onValueChange={(value) => setFrequency(value)}
          >
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">Once daily</SelectItem>
              <SelectItem value="twice">Twice daily</SelectItem>
              <SelectItem value="specific">Specific days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {frequency === "specific" && (
          <div className="space-y-2">
            <Label>Days of the week</Label>
            <div className="flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="flex items-center space-x-1">
                  <Checkbox
                    id={day}
                    checked={days.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <Label htmlFor={day}>{day}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
        <Button variant="primary" onClick={handleSave}>Save</Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Saved Reminders</h3>
        {reminders.length === 0 ? (
          <p>No reminders yet.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map((rem) => (
              <li key={rem.id} className="border border-primary p-3 rounded bg-muted">
                <div className="flex justify-between items-start">
                  <p>
                    <strong>{rem.medicine}</strong> at <strong>{rem.time}</strong> ({rem.frequency === "once"
                      ? "Once daily"
                      : rem.frequency === "twice"
                      ? "Twice daily"
                      : `Specific: ${rem.days?.join(", ")}`})
                  </p>
                  <Button variant="destructive" size="icon" onClick={() => deleteReminder(rem.id)} aria-label="Delete reminder">
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </li>
                <p>
                  <strong>{rem.medicine}</strong> at <strong>{rem.time}</strong>{" "}
                  ({rem.frequency === "once"
                    ? "Once daily"
                    : rem.frequency === "twice"
                    ? "Twice daily"
                    : `Specific: ${rem.days?.join(", ")}`})
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
