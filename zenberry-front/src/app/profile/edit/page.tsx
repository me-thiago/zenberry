import { BaseLayout } from "@/src/components/layout/base-layout";
import { ProtectedPage } from "@/src/components/guards/protected-page";
import { Hero } from "@/src/components/hero/hero";
import { EditProfileForm } from "./_components/edit-profile-form";

export default function EditProfilePage() {
  return (
    <ProtectedPage toastMessage="You need to be authenticated to access the profile">
      <BaseLayout
        config={{
          showHeader: true,
          showFooter: true,
          showHeroCta: true,
          backgroundImage: "/zenberry-product-background-small.webp",
          backgroundImageSize: "small",
        }}
      >
        <Hero title="Profile" />

        <div className="w-full flex-1 flex items-center justify-center bg-background py-8">
          <div className="max-w-4xl w-full mx-auto px-4">
            <h2 className="text-2xl font-semibold text-secondary mb-5">
              My Data
            </h2>
            <EditProfileForm />
          </div>
        </div>
      </BaseLayout>
    </ProtectedPage>
  );
}
