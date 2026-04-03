"use client";

import { useTransition } from "react";
import { Bell, Check } from "lucide-react";
import { markNotificationRead } from "@/app/(auth)/mi-equipo/actions";

type Notification = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  isRead: boolean;
};

export function NotificationsFeed({
  notifications,
}: {
  notifications: Notification[];
}) {
  const [pending, startTransition] = useTransition();

  if (notifications.length === 0) return null;

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-amber-500" />
        <h3 className="font-display text-lg uppercase tracking-tight">
          Avisos
        </h3>
        {unread > 0 && (
          <span className="h-5 min-w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5">
            {unread}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-3.5 rounded-xl transition-colors ${
              n.isRead
                ? "bg-white shadow-sm"
                : "bg-amber-50 border border-amber-200 shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  )}
                  <h4 className="text-sm font-medium truncate">{n.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                  {n.body}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-2">
                  {formatTimeAgo(n.createdAt)} · {n.authorName}
                </p>
              </div>
              {!n.isRead && (
                <button
                  disabled={pending}
                  onClick={() => {
                    startTransition(() => markNotificationRead(n.id));
                  }}
                  className="shrink-0 h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                  title="Marcar como leida"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}
