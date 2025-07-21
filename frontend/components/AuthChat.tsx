'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, ArrowLeft, CheckCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ProgressIndicator from './ProgressIndicator';
import InputField from './InputField';
import { AuthStep, AuthMode, UserData, Message } from '@/types/auth';
import { validateInput, getNextStep, getStepProgress } from '@/utils/authFlow';

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: 'こんにちは！Miraimへようこそ 🎉\n婚活を頑張るあなたを全力でサポートします！',
    timestamp: new Date()
  }
];

export default function AuthChat() {
  const [mode, setMode] = useState<AuthMode>('register');
  const [currentStep, setCurrentStep] = useState<AuthStep>('start');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [userData, setUserData] = useState<UserData>({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentStep === 'start' && mode === 'register') {
      setTimeout(() => {
        setCurrentStep('name');
        addBotMessage('まずはお名前を教えてください。\n（例：山田太郎）');
      }, 1000);
    }
  }, [currentStep]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = (content: string) => {
    setIsLoading(true);
    setTimeout(() => {
      addMessage({ type: 'bot', content });
      setIsLoading(false);
    }, 800);
  };

  const addUserMessage = (content: string) => {
    addMessage({ type: 'user', content });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const trimmedValue = inputValue.trim();
    setInputValue('');
    setValidationError('');

    // Add user message
    addUserMessage(trimmedValue);

    // Validate input
    const validation = validateInput(currentStep, trimmedValue);
    if (!validation.isValid) {
      setValidationError(validation.error || '');
      setTimeout(() => {
        addBotMessage(validation.error || 'もう一度入力してください。');
      }, 500);
      return;
    }

    // Store user data
    const updatedUserData = { ...userData };
    switch (currentStep) {
      case 'name':
        updatedUserData.name = trimmedValue;
        break;
      case 'email':
        updatedUserData.email = trimmedValue;
        break;
      case 'password':
        updatedUserData.password = trimmedValue;
        break;
      case 'age':
        updatedUserData.age = parseInt(trimmedValue);
        break;
      case 'occupation':
        updatedUserData.occupation = trimmedValue;
        break;
      case 'konkatsuStatus':
        updatedUserData.konkatsuStatus = trimmedValue;
        break;
    }
    setUserData(updatedUserData);

    // Get next step and response
    const nextStep = getNextStep(currentStep, mode);
    const response = getStepResponse(currentStep, trimmedValue, nextStep);

    setTimeout(() => {
      addBotMessage(response);
      if (nextStep) {
        setCurrentStep(nextStep);
      } else {
        // Complete registration/login
        handleComplete(updatedUserData);
      }
    }, 1000);
  };

  const getStepResponse = (step: AuthStep, input: string, nextStep: AuthStep | null): string => {
    switch (step) {
      case 'name':
        return `${input}さん、よろしくお願いします！\n素敵なお名前ですね ✨\n\n次に、ログインで使用するメールアドレスを教えてください。`;
      case 'email':
        return `ありがとうございます！\nメールアドレスを確認しました 📧\n\n続いて、安全なパスワードを設定しましょう。\n以下の条件を満たすパスワードをお願いします：\n• 8文字以上\n• 英字と数字を含む`;
      case 'password':
        return `とても良いパスワードです！セキュリティもばっちりですね 🔒\n\n年齢を教えていただけますか？\n（マッチングの参考にさせていただきます）`;
      case 'age':
        return `${input}歳ですね！\n\nお仕事は何をされていますか？\n（例：会社員、エンジニア、営業など）`;
      case 'occupation':
        return `${input}のお仕事、素晴らしいですね！👨‍💻\n\n最後に、現在の婚活状況を教えてください：\n1️⃣ 婚活初心者です\n2️⃣ 婚活経験があります\n3️⃣ 再チャレンジです\n\n番号または内容で答えてください。`;
      case 'konkatsuStatus':
        let status = '';
        if (input === '1' || input.includes('初心者')) {
          status = '婚活初心者の方ですね！🔰\n一緒に素敵な出会いを見つけていきましょう 💪';
        } else if (input === '2' || input.includes('経験')) {
          status = '婚活経験がおありなんですね！\n今度こそ素敵な出会いを見つけましょう ✨';
        } else {
          status = '再チャレンジですね！\n新しい気持ちで頑張りましょう 🌟';
        }
        return `${status}\n\n登録が完了しました！🎊\n${userData.name}さんの婚活成功を心から応援しています。\n\n早速、Miraimの機能を使ってみませんか？`;
      case 'email_confirm':
        return `メールアドレスを確認しました。\n\nパスワードを入力してください。`;
      default:
        return 'ありがとうございます！';
    }
  };

  const handleComplete = (finalUserData: UserData) => {
    console.log('Registration completed:', finalUserData);
    
    setTimeout(() => {
      addMessage({
        type: 'system',
        content: '登録完了 - メイン画面に移動'
      });
    }, 2000);
  };

  const handleModeSwitch = () => {
    const newMode = mode === 'register' ? 'login' : 'register';
    setMode(newMode);
    setCurrentStep('start');
    setUserData({});
    setMessages(INITIAL_MESSAGES);
    
    if (newMode === 'login') {
      setTimeout(() => {
        addBotMessage('おかえりなさい！👋\nMiraimにログインしましょう。\n\nメールアドレスを教えてください。');
        setCurrentStep('email_confirm');
      }, 1000);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addBotMessage('申し訳ありません。音声入力はこのブラウザではサポートされていません。\nキーボードで入力してください。');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      addBotMessage('音声認識に失敗しました。\nもう一度お試しいただくか、キーボードで入力してください。');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const progress = getStepProgress(currentStep, mode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>戻る</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">
              {mode === 'register' ? '新規登録' : 'ログイン'}
            </h1>
            {progress && (
              <ProgressIndicator 
                current={progress.current} 
                total={progress.total} 
              />
            )}
          </div>

          <button
            onClick={handleModeSwitch}
            className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            {mode === 'register' ? 'ログイン' : '新規登録'}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">M</span>
                </div>
                <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-orange-100">
            <form onSubmit={handleSubmit} className="space-y-2">
              {validationError && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">
                  {validationError}
                </div>
              )}
              
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <InputField
                    ref={inputRef}
                    value={inputValue}
                    onChange={setInputValue}
                    currentStep={currentStep}
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isLoading || isListening}
                  className={`p-3 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}