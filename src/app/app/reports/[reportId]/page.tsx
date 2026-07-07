import { AppReportDetail } from "@/components/app/AppReportDetail";

type PageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ProductReportPage({ params }: PageProps) {
  const { reportId } = await params;
  return <AppReportDetail reportId={reportId} />;
}
