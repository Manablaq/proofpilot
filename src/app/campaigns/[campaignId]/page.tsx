import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  const { campaignId } = await params;
  redirect(`/app/campaigns/${campaignId}`);
}
