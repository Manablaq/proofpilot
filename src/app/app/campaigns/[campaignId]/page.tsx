import { AppCampaignDetail } from "@/components/app/AppCampaignDetail";

type PageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function ProductCampaignDetailPage({ params }: PageProps) {
  const { campaignId } = await params;
  return <AppCampaignDetail campaignId={campaignId} />;
}
