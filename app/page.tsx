import { TripHeader } from "@/components/dashboard/TripHeader";
import { TripTabs } from "@/components/dashboard/TripTabs";
import { MainLayout } from "@/components/layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <TripHeader />
      <TripTabs />
    </MainLayout>
  );
}

