import { AppBuilderProfile } from "@/components/app/AppBuilderProfile";

type PageProps = {
  params: Promise<{ address: string }>;
};

export default async function ProductBuilderProfilePage({ params }: PageProps) {
  const { address } = await params;
  return <AppBuilderProfile address={address} />;
}
