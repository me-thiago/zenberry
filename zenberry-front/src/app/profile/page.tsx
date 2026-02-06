import { BaseLayout } from "@/src/components/layout/base-layout";
import { ProtectedPage } from "@/src/components/guards/protected-page";
import { Hero } from "@/src/components/hero/hero";
import { ProfileHeader } from "./_components/profile-header";
import { ProfileQuickActions } from "./_components/profile-quick-actions";
import { LastOrderSummary } from "./_components/last-order-summary";
import { EditProfileForm } from "./edit/_components/edit-profile-form";

export default function ProfilePage() {
  return (
    <ProtectedPage toastMessage="You need to be authenticated to access your profile">
      <BaseLayout
        config={{
          showHeader: true,
          showFooter: true,
          showHeroCta: true,
          backgroundImage: "/zenberry-product-background-small.webp",
          backgroundImageSize: "small",
        }}
      >
        <div className="pb-3">
          <Hero title="Profile" />

          <div className="w-full bg-background">
            <div className="container mx-auto px-4 lg:px-[20%] py-8">
              {/* Profile Header */}
              <ProfileHeader />
              {/* <ProfileQuickActions /> */}
              {/* <LastOrderSummary /> */}
              
              {/* Edit Profile Form */}
              <div className="mt-6">
                <EditProfileForm />
              </div>
            </div>
          </div>
        </div>
      </BaseLayout>
    </ProtectedPage>
  );
}
