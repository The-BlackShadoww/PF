import { PageHeader } from "@/components/layouts/PageHeader";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" />
      <div className="mx-auto max-w-5xl">
        <SettingsTabs />
      </div>
    </div>
  );
}
