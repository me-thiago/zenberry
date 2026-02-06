"use client";

import { cn } from "@/src/lib/utils";
import { Header } from "@/src/components/header/header";
import { CartDrawer } from "@/src/components/cart/cart-drawer";
import { LayoutConfig } from "./layout-types";
import { Footer } from "../footer/footer";
import { HeroCta } from "../hero-cta/hero-cta";
import { ChatbotModal } from "../chatbot/chatbot-modal";
import { useMemo } from "react";

interface BaseLayoutProps {
  children: React.ReactNode;
  config: LayoutConfig;
}

export function BaseLayout({ children, config }: BaseLayoutProps) {
  const {
    showHeader = true,
    showFooter = false,
    showHeroCta = false,
    centered = false,
    fullHeight = false,
    backgroundImage,
    backgroundImageSize = "big",
  } = config;

  // Calcular altura disponível baseado no header
  const contentHeight = useMemo(() => {
    if (!fullHeight) return undefined;
    return showHeader ? `calc(100vh - 112px)` : "100vh"; // 112px = altura do header (64px glass header + 48px green nav)
  }, [fullHeight, showHeader]);

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col",
          fullHeight ? "h-screen overflow-hidden" : "min-h-screen"
        )}
      >
        {/* Background Image - Always absolute for consistency */}
        {backgroundImage && (
          <div
            className={cn(
              "absolute left-0 right-0 bg-cover bg-no-repeat -z-1",
              backgroundImageSize === "small"
                ? "top-0 h-[40vh]"
                : "h-screen bg-center"
            )}
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
        )}

        {showHeader && <Header />}
        <main
          className={cn(
            "transition-colors duration-200 flex flex-col flex-1",
            fullHeight && "overflow-hidden",
            centered && "items-center justify-center"
          )}
          style={{
            height: contentHeight,
            minHeight: fullHeight ? contentHeight : "auto",
          }}
        >
          {children}
        </main>
      </div>

      {showHeroCta && <HeroCta />}
      {showFooter && <Footer />}

      <CartDrawer />
      <ChatbotModal />
    </>
  );
}
