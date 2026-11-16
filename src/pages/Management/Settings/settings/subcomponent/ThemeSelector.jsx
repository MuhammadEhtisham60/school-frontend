import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Palette } from "lucide-react";
import { THEMES } from "@/utils/themeManager";

export function ThemeSelector({ selectedTheme, onSelectTheme }) {
  return (
    <Card className="p-6 shadow-card lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Palette className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">Software Color Theme</h3>
            <p className="text-xs text-muted-foreground">
              Choose a theme palette to update the entire application appearance instantly.
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          Active: {THEMES.find((t) => t.id === selectedTheme)?.name || "EduPulse Classic"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {THEMES.map((theme) => {
          const isActive = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={`text-left rounded-xl border p-4 transition-smooth cursor-pointer relative ${
                isActive
                  ? "border-primary ring-2 ring-primary/30 bg-accent/40 shadow-card"
                  : "bg-card hover:border-primary/40 hover:bg-accent/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">{theme.name}</span>
                {isActive && (
                  <span className="h-5 w-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed min-h-[32px]">
                {theme.description}
              </p>

              {/* Color Swatches */}
              <div className="mt-3 flex items-center gap-1.5">
                {theme.swatches.map((swatch) => (
                  <div
                    key={swatch.label}
                    title={`${swatch.label}: ${swatch.hex}`}
                    className="h-6 flex-1 rounded-md border border-black/10 shadow-xs"
                    style={{ backgroundColor: swatch.hex }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
