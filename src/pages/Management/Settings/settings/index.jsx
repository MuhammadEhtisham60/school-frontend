import { useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SchoolProfile } from "./subcomponent/SchoolProfile";
import { Preferences } from "./subcomponent/Preferences";
import { ThemeSelector } from "./subcomponent/ThemeSelector";
import { applyTheme, getSavedTheme, THEMES } from "@/utils/themeManager";

function SettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState(() => getSavedTheme());

  const handleSelectTheme = (themeId) => {
    const applied = applyTheme(themeId);
    setSelectedTheme(applied);
    const themeName = THEMES.find((t) => t.id === applied)?.name || applied;
    toast.success(`Theme switched to ${themeName}`);
  };

  const handleSave = () => {
    applyTheme(selectedTheme);
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="School profile, branding, software color themes and system preferences."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ThemeSelector selectedTheme={selectedTheme} onSelectTheme={handleSelectTheme} />
        <SchoolProfile />
        <Preferences />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="gradient-primary text-primary-foreground border-0 shadow-glow"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default SettingsPage;
