import { AppBackground } from "@/components/AppBackground";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { ReportDetailApp } from "@/components/ReportDetailApp";

type PageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportPage({ params }: PageProps) {
  const { reportId } = await params;

  return (
    <AppBackground>
      <AppHeader />
      <ReportDetailApp reportId={reportId} />
      <Footer />
    </AppBackground>
  );
}
