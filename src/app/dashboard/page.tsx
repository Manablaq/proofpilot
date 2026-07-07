import { AppBackground } from "@/components/AppBackground";
import { AppHeader } from "@/components/AppHeader";
import { DashboardPreview } from "@/components/DashboardPreview";

export default function DashboardPage() {
  return (
    <AppBackground>
      <AppHeader />
      <DashboardPreview />
    </AppBackground>
  );
}
