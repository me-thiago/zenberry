"use client";

import { Button } from "@/src/components/ui/button";
import { useChatbot } from "@/src/contexts/chatbot-context";

export function AboutContactOptions() {
  const { openChatbot } = useChatbot();

  const handleEmailClick = () => {
    window.location.href = "mailto:zenberrynaturals@gmail.com";
  };

  const handleCallClick = () => {
    window.location.href = "tel:+15551234567";
  };

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 pb-6 lg:pb-32 mx-auto"
      aria-label="Opções de contato Zenberry"
    >
      <div className="text-center bg-[#f7f7f7] p-6 border lg:w-xs rounded-3xl">
        <h3 className="font-bold text-2xl text-secondary mb-2">Chat With Us</h3>
        <p className="text-sm text-gray-600 mb-4">
          Get instantly connected with our wellness experts
        </p>
        <Button
          className="bg-primary hover:bg-primary/70 text-secondary w-full"
          aria-label="Start Live Chat"
          onClick={openChatbot}
        >
          Start Live Chat
        </Button>
      </div>
      <div className="text-center bg-[#f7f7f7] p-6 border lg:w-xs rounded-3xl">
        <h3 className="font-bold text-2xl text-secondary mb-2">Email Us</h3>
        <p className="text-sm text-gray-600 mb-4">
          Reach out to us anytime. Response time: 4-8 hours
        </p>
        <Button
          className="bg-primary hover:bg-primary/70 text-secondary w-full"
          aria-label="Send an Email"
          onClick={handleEmailClick}
        >
          Send an Email
        </Button>
      </div>
      <div className="text-center bg-[#f7f7f7] p-6 border lg:w-xs rounded-3xl">
        <h3 className="font-bold text-2xl text-secondary mb-2">Call Us</h3>
        <p className="text-sm text-gray-600 mb-4">
          Speak with us in a more call way if you need any help
        </p>
        <Button
          className="bg-primary hover:bg-primary/70 text-secondary w-full"
          aria-label="Call Now"
          onClick={handleCallClick}
        >
          Call Now
        </Button>
      </div>
    </div>
  );
}
