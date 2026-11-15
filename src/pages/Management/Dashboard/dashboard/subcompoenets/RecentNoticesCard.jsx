import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetNoticesQuery } from "@/services/private/resourceService";
import { Bell, Pin, Users, ArrowRight, Loader2 } from "lucide-react";

export function RecentNoticesCard() {
  const { data: noticesRes, isLoading } = useGetNoticesQuery();
  const notices = (noticesRes?.data || []).slice(0, 5);

  return (
    <Card className="p-6 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Notice Board
            </h3>
            <p className="text-sm text-muted-foreground">Latest school announcements</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
            <Link to="/notice">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notices.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No notices published yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <Link
                key={n.id}
                to={`/notice/${n.id}`}
                className="flex items-start justify-between gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-smooth cursor-pointer"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {n.pinned ? (
                    <Pin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  ) : (
                    <Bell className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm truncate">{n.title}</p>
                      {n.pinned && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">
                          Pinned
                        </Badge>
                      )}
                    </div>
                    {n.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {n.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{n.date || n.publishedDate}</span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" /> {n.audience || "All"}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-primary/10 text-primary border-0 shrink-0"
                >
                  {n.category}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

