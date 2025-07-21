'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, User } from 'lucide-react';
import { Message } from '@/types/auth';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (message.type === 'bot') {
      setIsTyping(true);
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= message.content.length) {
          setDisplayedContent(message.content.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 30);

      return () => clearInterval(typingInterval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, message.type]);

  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  const isBot = message.type === 'bot';

  return (
    <div className={`flex items-start space-x-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">M</span>
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isBot ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isBot
              ? 'bg-white rounded-tl-md text-gray-800'
              : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-tr-md'
          }`}
        >
          <p className="whitespace-pre-wrap leading-relaxed">
            {displayedContent}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>
        
        <div className={`mt-1 text-xs text-gray-500 ${isBot ? 'text-left' : 'text-right'}`}>
          {message.timestamp.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}