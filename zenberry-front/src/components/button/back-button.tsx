"use client";

import { Button } from "@/src/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={() => router.back()}
      className="border-theme-text-secondary/20 text-theme-text-primary hover:bg-theme-bg-secondary transition-all duration-200 w-full sm:w-auto"
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      Go Back
    </Button>
  );
}
