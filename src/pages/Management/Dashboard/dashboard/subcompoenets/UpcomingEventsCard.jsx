import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetEventsQuery } from "@/services/private/resourceService";
import { CalendarDays, Clock, MapPin, ArrowRight, Loader2 } from "lucide-react";

const TYPE_STYLES = {
  Sports: "bg-amber-100 text-amber-700",
  Academic: "bg-blue-100 text-blue-700",
  Cultural: "bg-pink-100 text-pink-700",
  Meeting: "bg-emerald-100 text-emerald-700",
  Holiday: "bg-orange-100 text-orange-700",
  Exam: "bg-red-100 text-red-700",
};

export function UpcomingEventsCard() {
  const { data: eventsRes, isLoading } = useGetEventsQuery({ upcoming: "true" });
  const events = (eventsRes?.data || []).slice(0, 5);

  return (
    <Card className="p-6 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Upcoming Events
            </h3>
            <p className="text-sm text-muted-foreground">Scheduled campus events & exams</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
            <Link to="/event-calendar">
              View Calendar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No upcoming events scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => {
              const d = new Date(ev.date + "T00:00:00");
              const monthShort = d.toLocaleDateString("en-US", { month: "short" });
              const dayNum = d.getDate();
              return (
                <Link
                  key={ev.id}
                  to={`/event-calendar/${ev.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-smooth cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl gradient-primary text-primary-foreground shrink-0">
                    <span className="text-[10px] font-semibold uppercase leading-none">
                      {monthShort}
                    </span>
                    <span className="text-base font-bold leading-tight">{dayNum}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{ev.title}</p>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] border-0 shrink-0 ${TYPE_STYLES[ev.type] || ""}`}
                      >
                        {ev.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {ev.startTime && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ev.startTime}
                          {ev.endTime ? ` - ${ev.endTime}` : ""}
                        </span>
                      )}
                      {ev.venue && (
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3" />
                          {ev.venue}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

