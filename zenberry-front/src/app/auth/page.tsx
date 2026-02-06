import { BaseLayout } from "@/src/components/layout/base-layout";
import { GuestOnlyPage } from "@/src/components/guards/guest-only-page";
import { AuthCard } from "@/src/app/auth/_components/auth-card";

export default function AuthPage() {
  return (
    <GuestOnlyPage showToast={false} redirectTo="/profile">
      <BaseLayout
        config={{
          showHeader: true,
          showFooter: false,
          centered: true,
          fullHeight: true,
          backgroundImage: "/florest-background.webp",
        }}
      >
        <AuthCard />
      </BaseLayout>
    </GuestOnlyPage>
  );
}
