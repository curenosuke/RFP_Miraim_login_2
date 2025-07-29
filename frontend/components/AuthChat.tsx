'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, ArrowLeft, CheckCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ProgressIndicator from './ProgressIndicator';
import InputField from './InputField';
import { AuthStep, AuthMode, UserData, Message } from '@/types/auth';
import { validateInput, getNextStep, getStepProgress } from '@/utils/authFlow';
import login from './login';
import register from './register';
import { useRouter } from 'next/navigation';

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

  const router = useRouter();

  useEffect(() => {
    // 初期メッセージ表示時にもスクロール
    setTimeout(() => {
      scrollToBottom();
    }, 100);
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

  const calculateScrollOffset = (content: string) => {
    // 改行数を計算
    const lineCount = (content.match(/\n/g) || []).length + 1;
    // 1行あたりの高さ（概算）
    const lineHeight = 24; // px
    // メッセージのパディング
    const messagePadding = 32; // px
    // 余裕を持ったオフセット
    const extraOffset = 100; // px
    
    return lineCount * lineHeight + messagePadding + extraOffset;
  };

  const scrollToBottomWithOffset = (content: string) => {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        const offset = calculateScrollOffset(content);
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight + offset,
          behavior: 'smooth'
        });
      }
    }, 100); // 少し遅延させてDOMの更新を待つ
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
      // botメッセージ追加後に適切なオフセットでスクロール
      scrollToBottomWithOffset(content);
    }, 800);
  };

  const addUserMessage = (content: string) => {
    addMessage({ type: 'user', content });
    // ユーザーメッセージ追加後もスクロール
    setTimeout(() => {
      scrollToBottom();
    }, 100);
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
      case 'email_confirm':
        updatedUserData.email = trimmedValue;
        break;
      case 'password':
        updatedUserData.password = trimmedValue;
        break;
      case 'password_confirm':
        updatedUserData.password = trimmedValue;
        break;
      case 'birthdate':
        updatedUserData.birthdate = trimmedValue;
        break;
      case 'konkatsuStatus':
        updatedUserData.konkatsuStatus = trimmedValue;
        break;
      case 'optional_confirm':
        // ユーザーの選択を保存（実際の処理は別途実装）
        break;
      case 'occupation':
        updatedUserData.occupation = trimmedValue;
        break;
      case 'birthplace':
        updatedUserData.birthplace = trimmedValue;
        break;
      case 'location':
        updatedUserData.location = trimmedValue;
        break;
      case 'hobbies':
        updatedUserData.hobbies = trimmedValue;
        break;
      case 'holiday_style':
        updatedUserData.holidayStyle = trimmedValue;
        break;
    }
    setUserData(updatedUserData);

    // Get next step and response
    const nextStep = getNextStep(currentStep, mode);
    const response = getStepResponse(currentStep, trimmedValue, nextStep, updatedUserData);

    setTimeout(() => {
      addBotMessage(response);
      if (nextStep) {
        // optional_confirmステップの特別処理
        if (currentStep === 'optional_confirm') {
          const isYes = ['はい', 'yes', 'y', '1', '入力', 'する'].some(option => 
            trimmedValue.toLowerCase().includes(option.toLowerCase())
          );
          if (isYes) {
            setCurrentStep('occupation');
          } else {
            // 任意項目をスキップして登録完了
            handleComplete(updatedUserData);
          }
        } else {
          setCurrentStep(nextStep);
        }
      } else {
        // Complete registration/login
        handleComplete(updatedUserData);
      }
    }, 1000);
  };

  const getStepResponse = (step: AuthStep, input: string, nextStep: AuthStep | null, userData: UserData): string => {
    switch (step) {
      case 'name':
        return `${input}さん、よろしくお願いします！\n素敵なお名前ですね ✨\n\n次に、ログインで使用するメールアドレスを教えてください。`;
      case 'email':
        return `ありがとうございます！\nメールアドレスを確認しました 📧\n\n続いて、安全なパスワードを設定しましょう。\n以下の条件を満たすパスワードをお願いします：\n• 8文字以上\n• 英字と数字を含む`;
      case 'password':
        return `とても良いパスワードです！セキュリティもばっちりですね 🔒\n\n生年月日を教えていただけますか？\n（マッチングの参考にさせていただきます）\n\n形式：YYYY-MM-DD\n例：1990-01-15`;
      case 'birthdate':
        // 年齢を計算
        const birthDate = new Date(input);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
        
        // 年齢に応じたメッセージを生成
        let ageMessage = '';
        if (actualAge >= 40) {
          ageMessage = `${actualAge}歳でいらっしゃるんですね！\n人生経験豊富な魅力的な年代です ✨\n\nきっと素敵な出会いが待っていますよ。`;
        } else if (actualAge >= 30 && actualAge < 40) {
          ageMessage = `${actualAge}歳！充実した人生経験と若さを兼ね備えている素敵な年代ですね✨`;
        } else if (actualAge >= 18 && actualAge < 30) {
          ageMessage = `${actualAge}歳！若々しくて素晴らしいですね 🌟\nこれからたくさんの可能性が広がっています。`;
        }
        
        return `${ageMessage}\n\n最後に、現在の婚活状況を教えてください：\n1️⃣ 婚活初心者です\n2️⃣ 婚活経験があります\n3️⃣ 再チャレンジです\n\n番号または内容で答えてください。`;

      case 'konkatsuStatus':
        let status = '';
        if (input === '1' || input.includes('初心者')) {
          status = '婚活初心者の方ですね！🔰\n一緒に素敵な出会いを見つけていきましょう 💪';
        } else if (input === '2' || input.includes('経験')) {
          status = '婚活経験がおありなんですね！\n今度こそ素敵な出会いを見つけましょう ✨';
        } else {
          status = '再チャレンジですね！\n新しい気持ちで頑張りましょう 🌟';
        }
        return `${status}\n\n以降の項目は任意ですが、よりパーソナライズされた提案・練習ができますよ！\n\n入力しますか？\n\n「はい」または「いいえ」でお答えください。`;
      case 'optional_confirm':
        const isYes = ['はい', 'yes', 'y', '1', '入力', 'する'].some(option => 
          input.toLowerCase().includes(option.toLowerCase())
        );
        if (isYes) {
          return 'ありがとうございます！\n\nまずは、お仕事を教えてください。\n（例：会社員、エンジニア、営業など）';
        } else {
          return `承知いたしました！\n\n登録が完了しました！🎊\n${userData.name}さんの婚活成功を心から応援しています。\n\n早速、Miraimの機能を使ってみませんか？`;
        }
      case 'occupation':
        // 職業に応じたメッセージを生成
        let occupationMessage = '';
        if (input.includes('無職') || input.includes('失業') || input.includes('求職中')) {
          occupationMessage = `ありがとうございます。\n現在お仕事を探されている状況なんですね。\n\n職業は出会いのきっかけの一つですが、\nあなたの魅力はそれだけではありません！\n\n趣味や特技、人柄など、たくさんの魅力があると思います ✨`;
        } else if (input.includes('学生') || input.includes('大学生') || input.includes('大学院生')) {
          occupationMessage = `学生さんなんですね！📚\n勉強お疲れ様です。\n\n将来に向けて頑張っていらっしゃる姿勢、とても素敵です。`;
        } else if (input.includes('専業主夫') || input.includes('主夫')) {
          occupationMessage = `専業主夫というお立場なんですね！\n家庭を支える大切なお仕事です 🏠\n\nきっと思いやりのある素敵な方なんでしょうね。`;
        } else if (input.includes('会社員') || input.includes('サラリーマン')) {
          occupationMessage = `${input}としてお仕事をされているんですね！\n社会で活躍されている姿、とても素敵です 👔`;
        } else if (input.includes('エンジニア') || input.includes('プログラマー') || input.includes('IT')) {
          occupationMessage = `${input}としてお仕事をされているんですね！\n論理的思考と創造性を兼ね備えた素敵な職業です 💻`;
        } else if (input.includes('医師') || input.includes('看護師') || input.includes('医療')) {
          occupationMessage = `${input}としてお仕事をされているんですね！\n人を助ける素晴らしいお仕事です 🏥`;
        } else if (input.includes('教師') || input.includes('先生') || input.includes('教員')) {
          occupationMessage = `${input}としてお仕事をされているんですね！\n次世代を育てる大切なお仕事です 📖`;
        } else if (input.includes('営業') || input.includes('セールス')) {
          occupationMessage = `${input}としてお仕事をされているんですね！\nコミュニケーション能力が素晴らしい方ですね 💼`;
        } else if (input.includes('自営業') || input.includes('経営者') || input.includes('社長')) {
          occupationMessage = `${input}としてお仕事をされているんですね！\nリーダーシップと決断力のある素敵な方ですね 🎯`;
        } else {
          occupationMessage = `${input}としてお仕事をされているんですね！\n素晴らしいお仕事です ✨`;
        }
        
        return `${occupationMessage}\n\n出身地を教えてください。\n（例：東京都、大阪府、北海道など）`;
      case 'birthplace':
        return `${input}！素敵な場所です 🌟\n\n現在の居住地を教えてください。\n（例：東京都渋谷区、大阪府大阪市など）`;
      case 'location':
        return `${input}にお住まいなんですね！\n\n趣味・興味を教えてください。\n（例：読書、旅行、料理、スポーツなど）`;
      case 'hobbies':
        return `${input}がお好きなんですね！素敵な趣味です ✨\n\n最後に、休日の過ごし方を教えてください。\n（例：家でゆっくり、友達と遊ぶ、趣味に没頭など）`;
      case 'holiday_style':
        return `${input}！素敵な休日の過ごし方です 🌟\n\n登録が完了しました！🎊\n${userData.name}さんの婚活成功を心から応援しています。\n\n早速、Miraimの機能を使ってみませんか？`;
      case 'email_confirm':
        return `メールアドレスを確認しました。\n\nパスワードを入力してください。`;
      case 'password_confirm':
        return 'ありがとうございます、パスワードを確認しました!'
      default:
        return 'ありがとうございます！';
    }
  };

  const handleComplete = async (finalUserData: UserData) => {
    if (mode == 'register'){
      const res = await register(finalUserData);
      return;
    }

    const email = finalUserData.email;
    const password = finalUserData.password;
    const res = await login(email, password);
    
    if (res){
      router.push("/mypage");
    }
    // setTimeout(() => {
    //   addMessage({
    //     type: 'system',
    //     content: '登録完了 - メイン画面に移動'
    //   });
    // }, 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex flex-col relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm border-b border-orange-100 p-4">
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
      <div className="flex-1 overflow-hidden pb-32 pt-28"> {/* ← 上部にヘッダー分のパディングを追加 */}
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-container">
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
          <div className="fixed bottom-0 left-0 w-full z-10 p-4 bg-white/80 backdrop-blur-sm border-t border-orange-100">
            <form onSubmit={handleSubmit} className="space-y-2 max-w-2xl mx-auto">
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