import { Suspense } from "react";
import { AppSubmitProject } from "@/components/app/AppSubmitProject";

export default function SubmitProjectPage() {
  return (
    <Suspense fallback={null}>
      <AppSubmitProject />
    </Suspense>
  );
}
