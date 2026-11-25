import type { Metadata } from "next";
import { PasswordForm, ShopSettingsForm } from "@/components/admin/SettingsForms";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Réglages" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl">Réglages</h1>
      <ShopSettingsForm values={settings} />
      <PasswordForm />
    </div>
  );
}
