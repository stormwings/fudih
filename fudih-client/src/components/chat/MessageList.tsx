import { Message } from "@/types/chat";
import Image from "next/image";
import { clsx } from "clsx";
import Markdown from "react-markdown";
import { useRef, useEffect } from "react";

interface MessageListProps {
  messages: Message[];
  streamingMessage?: string;
}

export const MessageList = ({ messages, streamingMessage }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  return (
    <div className="flex flex-col space-y-6 py-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={clsx("flex", {
            "justify-end": message.role === "user",
            "justify-start": message.role === "assistant",
          })}
        >
          <div
            className={clsx("max-w-[85%] rounded-2xl px-4 py-3", {
              "bg-[#09995b] text-white": message.role === "user",
              "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100":
                message.role === "assistant",
            })}
          >
            <Markdown
              components={{
                img: ({ node, ...props }) => {
                  return <img {...props} className="rounded-xl my-2.5" />;
                },
              }}
            >
              {message.content}
            </Markdown>

            {message.image_data && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {Array.isArray(message.image_data) ? (
                  message.image_data.map((imgData, imgIndex) => (
                    <Image
                      key={imgIndex}
                      src={`data:image/jpeg;base64,${imgData}`}
                      alt={`Uploaded image ${imgIndex + 1}`}
                      width={300}
                      height={300}
                      className="rounded-xl"
                    />
                  ))
                ) : (
                  <Image
                    src={`data:image/jpeg;base64,${message.image_data}`}
                    alt="Uploaded image"
                    width={300}
                    height={300}
                    className="rounded-xl"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {streamingMessage && (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <Markdown>{streamingMessage}</Markdown>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
