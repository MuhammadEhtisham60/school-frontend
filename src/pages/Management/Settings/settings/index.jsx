import { PageHeader } from "@/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SchoolProfile } from "./subcomponent/SchoolProfile";
import { Preferences } from "./subcomponent/Preferences";

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="School profile, branding and system preferences."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SchoolProfile />
        <Preferences />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={() => toast.success("Settings saved")}
          className="gradient-primary text-primary-foreground border-0 shadow-glow"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default SettingsPage;
