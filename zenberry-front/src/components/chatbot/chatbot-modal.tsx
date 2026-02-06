"use client";

import { Bot, ChevronDown, X, Plus } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useCallback } from "react";
import { useChatbot } from "@/src/contexts/chatbot-context";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { ChatInterface } from "./chat-interface";
import { ChatClearConfirmation } from "./chat-clear-confirmation";

export function ChatbotModal() {
  const { isOpen, toggleChatbot } = useChatbot();
  const clearChatRef = useRef<(() => void) | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleNewChatClick = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmNewChat = useCallback(() => {
    if (clearChatRef.current) {
      clearChatRef.current();
    }
    setShowConfirmDialog(false);
  }, []);

  const handleCancelNewChat = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleChatbot}
        className={cn(
          "fixed bottom-6 left-6 z-50 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-101 cursor-pointer",
          isOpen ? "p-3" : "pl-3 py-1.5"
        )}
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <div className="bg-theme-accent-secondary rounded-xl">
            <ChevronDown className="h-6 w-6" />
          </div>
        ) : (
          <div className="flex justify-center items-center gap-2 px-2">
            <h4 className="text-theme-accent-secondary font-semibold">
              Ask Your Questions
            </h4>
            <div className="bg-theme-accent-secondary p-2 rounded-full">
              <Bot className="h-6 w-6" />
            </div>
          </div>
        )}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed md:bottom-22 md:left-6 bottom-0 left-0 z-50 w-full h-[100dvh] md:max-w-md md:h-[700px] chat-container">
          <div className="bg-[#e0e0e0] md:rounded-3xl h-full shadow-2xl overflow-hidden border border-gray-300 relative flex flex-col">
            {/* Header */}
            <div className="shrink-0 p-4 flex items-center justify-between">
              <div className="flex items-center flex-1 justify-center">
                <Image
                  priority
                  width={150}
                  height={40}
                  className="m-auto"
                  alt="Zenberry Logo"
                  src="/logo-zenberry-black.webp"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewChatClick}
                  className="text-gray-600 hover:text-gray-900"
                  aria-label="New conversation"
                >
                  <Plus className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleChatbot}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Chat Interface - ocupa o espaço restante */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <ChatInterface
                useStreaming={false}
                onNewChat={(clearFn) => (clearChatRef.current = clearFn)}
              />
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
              <ChatClearConfirmation
                onCancel={handleCancelNewChat}
                onConfirm={handleConfirmNewChat}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
