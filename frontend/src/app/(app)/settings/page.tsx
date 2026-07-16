import { PageHeader } from "@/components/layouts/PageHeader";
import { CategoriesManager } from "@/components/settings/CategoriesManager";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" />
      <div className="mx-auto max-w-5xl">
        <CategoriesManager />
      </div>
    </div>
  );
}
