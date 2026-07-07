import { AppBackground } from "@/components/AppBackground";
import { AppHeader } from "@/components/AppHeader";
import { BuildersApp } from "@/components/BuildersApp";
import { Footer } from "@/components/Footer";

export default function BuildersPage() {
  return (
    <AppBackground>
      <AppHeader />
      <BuildersApp />
      <Footer />
    </AppBackground>
  );
}
