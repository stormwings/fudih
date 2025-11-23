'use client';

import { useState } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { chatApi } from '@/lib/api';
import { Message } from '@/types/chat';

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>('');

  const handleAddImage = (imageData: string) => {
    setPendingImages(prev => [...prev, imageData]);
  };

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      role: 'user',
      content,
      ...(pendingImages.length > 0 && { image_data: pendingImages }),
    };

    try {
      setIsLoading(true);
      setPendingImages([]);
      setMessages(prev => [...prev, newMessage]);
      setStreamingMessage('');

      await chatApi.sendMessage([...messages, newMessage], (chunk) => {
        if (chunk.status === 'streaming' && chunk.content) {
          setStreamingMessage(chunk.content);
        } else if (chunk.status === 'generating_image') {
          setStreamingMessage('Generating image...');
        } else if (chunk.status === 'done' && chunk.content) {
          const assistantMessage: Message = {
            role: 'assistant',
            content: chunk.content,
          };
          setMessages(prev => [...prev, assistantMessage]);
          setStreamingMessage('');
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setPendingImages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-32 py-4">
        <div className="max-w-3xl mx-auto">
          <MessageList messages={messages} streamingMessage={streamingMessage} />
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            onAddImage={handleAddImage}
            pendingImages={pendingImages}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
