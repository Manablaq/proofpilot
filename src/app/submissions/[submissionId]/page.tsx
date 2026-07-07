import { AppBackground } from "@/components/AppBackground";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { SubmissionDetailApp } from "@/components/SubmissionDetailApp";

type PageProps = {
  params: Promise<{ submissionId: string }>;
};

export default async function SubmissionPage({ params }: PageProps) {
  const { submissionId } = await params;

  return (
    <AppBackground>
      <AppHeader />
      <SubmissionDetailApp submissionId={submissionId} />
      <Footer />
    </AppBackground>
  );
}
