import { AppSubmitProject } from "@/components/app/AppSubmitProject";
import { deployment } from "@/lib/deployment";

type PageProps = {
  searchParams?: Promise<{
    campaignId?: string;
  }>;
};

export default async function SubmitProjectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const campaignId = params?.campaignId || deployment.campaignId;

  return <AppSubmitProject campaignId={campaignId} />;
}
