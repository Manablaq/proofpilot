import { AppSubmissionDetail } from "@/components/app/AppSubmissionDetail";

type PageProps = {
  params: Promise<{ submissionId: string }>;
};

export default async function ProductSubmissionPage({ params }: PageProps) {
  const { submissionId } = await params;
  return <AppSubmissionDetail submissionId={submissionId} />;
}
