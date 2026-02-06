import { BaseLayout } from "@/src/components/layout/base-layout";
import { GuestOnlyPage } from "@/src/components/guards/guest-only-page";
import { RegisterCard } from "./_components/register-card";

export default function RegisterPage() {
  return (
    <GuestOnlyPage toastMessage="Você já está autenticado">
      <BaseLayout
        config={{
          showHeader: true,
          showFooter: false,
          centered: true,
          fullHeight: true,
          backgroundImage: "/florest-background.webp",
        }}
      >
        <RegisterCard />
      </BaseLayout>
    </GuestOnlyPage>
  );
}
