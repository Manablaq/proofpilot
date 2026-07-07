import { AppBackground } from "@/components/AppBackground";
import { AppHeader } from "@/components/AppHeader";
import { CampaignsApp } from "@/components/CampaignsApp";
import { Footer } from "@/components/Footer";

export default function CampaignsPage() {
  return (
    <AppBackground>
      <AppHeader />
      <CampaignsApp />
      <Footer />
    </AppBackground>
  );
}
