import { cn } from "@/src/lib/utils";
import { Message } from "@/src/types/message";

interface ChatMessageBubbleProps {
  message: Message;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          message.role === "user"
            ? "bg-white text-gray-800 rounded-br-sm"
            : "bg-secondary text-white rounded-bl-sm"
        )}
      >
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
}
