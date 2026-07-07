import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportPage({ params }: PageProps) {
  const { reportId } = await params;
  redirect(`/app/reports/${reportId}`);
}
