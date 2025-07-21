'use client';

import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import AuthChat from '@/components/AuthChat';

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {!showAuth ? (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center space-y-8 max-w-md">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-8 h-8 text-orange-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Miraim
              </h1>
            </div>
            
            {/* Hero Text */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">
                婚活を頑張るあなたを<br />
                全力でサポート
              </h2>
              <p className="text-gray-600 leading-relaxed">
                内面スタイリングで、<br />
                素敵な出会いを見つけましょう ✨
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowAuth(true)}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-4 px-8 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>はじめる</span>
            </button>

            <p className="text-sm text-gray-500">
              親しみやすい会話形式で<br />
              簡単に登録できます
            </p>
          </div>
        </div>
      ) : (
        <AuthChat />
      )}
    </div>
  );
}