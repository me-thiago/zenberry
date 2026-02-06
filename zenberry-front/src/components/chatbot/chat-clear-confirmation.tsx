import { memo } from "react";
import { Button } from "../ui/button";

interface ChatClearConfirmationProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const ChatClearConfirmation = memo(function ChatClearConfirmation({
  onCancel,
  onConfirm,
}: ChatClearConfirmationProps) {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Start New Conversation?
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          This will clear your current conversation. This action cannot be
          undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="px-4 bg-red-500 hover:bg-red-600 text-white"
          >
            Clear Chat
          </Button>
        </div>
      </div>
    </div>
  );
});
