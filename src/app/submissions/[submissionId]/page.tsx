import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ submissionId: string }>;
};

export default async function SubmissionPage({ params }: PageProps) {
  const { submissionId } = await params;
  redirect(`/app/submissions/${submissionId}`);
}
