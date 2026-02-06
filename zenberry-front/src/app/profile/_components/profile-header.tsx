"use client"

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { useAuthContext } from "@/src/contexts/auth-context";
import { Edit, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ProfileHeader() {
  const router = useRouter();
  const { customer, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      router.push("/");
      await logout();
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between flex-col lg:flex-row">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
              <Image
                src="/hero-cta-background.webp"
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">
                Welcome, {customer?.firstName || "Bruno Henrique"}
              </h2>
              <p className="text-sm text-gray-600">
                {customer?.email || "brunohenrique@gmail.com"}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-full lg:w-auto gap-3">
            <Button
              className="bg-red-500 hover:bg-red-400 w-32 mt-7 lg:mt-0 text-black cursor-pointer"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
