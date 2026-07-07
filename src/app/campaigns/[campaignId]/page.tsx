import { AppBackground } from "@/components/AppBackground";
import { AppHeader } from "@/components/AppHeader";
import { CampaignDetailApp } from "@/components/CampaignDetailApp";
import { Footer } from "@/components/Footer";

type PageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  const { campaignId } = await params;

  return (
    <AppBackground>
      <AppHeader />
      <CampaignDetailApp campaignId={campaignId} />
      <Footer />
    </AppBackground>
  );
}
