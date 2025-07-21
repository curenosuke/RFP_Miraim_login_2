import { AuthStep, AuthMode, ValidationResult, StepProgress } from '@/types/auth';

export function validateInput(step: AuthStep, input: string): ValidationResult {
  const trimmedInput = input.trim();

  switch (step) {
    case 'name':
      if (!trimmedInput) {
        return { isValid: false, error: 'お名前を入力してください。' };
      }
      if (trimmedInput.length < 1 || trimmedInput.length > 50) {
        return { isValid: false, error: 'お名前は1文字以上50文字以下で入力してください。' };
      }
      return { isValid: true };

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedInput) {
        return { isValid: false, error: 'メールアドレスを入力してください。' };
      }
      if (!emailRegex.test(trimmedInput)) {
        return { 
          isValid: false, 
          error: 'メールアドレスには「@」マークが必要です。\n\n例：tanaka@example.com のような形式でお願いします 📧' 
        };
      }
      return { isValid: true };

    case 'password':
      if (!trimmedInput) {
        return { isValid: false, error: 'パスワードを入力してください。' };
      }
      if (trimmedInput.length < 8) {
        return { 
          isValid: false, 
          error: 'あら、少し短いようですね 😅\nパスワードは8文字以上必要です。\n\nもう少し長めのパスワードをお願いします。\n例：「password123」のような感じです。' 
        };
      }
      if (!/[a-zA-Z]/.test(trimmedInput) || !/\d/.test(trimmedInput)) {
        return { 
          isValid: false, 
          error: 'もう少しですね！\n今度は英字と数字の両方を含めてください。\n\n例えば「mypass123」のように数字も入れていただけますか？' 
        };
      }
      return { isValid: true };

    case 'age':
      const age = parseInt(trimmedInput);
      if (isNaN(age)) {
        return { isValid: false, error: '年齢は数字で入力してください。' };
      }
      if (age < 18) {
        return { 
          isValid: false, 
          error: 'ありがとうございます。\n申し訳ございませんが、Miraimは18歳以上の方にご利用いただいております。\n\n18歳になられましたら、ぜひまたお越しください。\nお待ちしております！' 
        };
      }
      if (age > 100) {
        return { isValid: false, error: '年齢を正しく入力してください。' };
      }
      return { isValid: true };

    case 'occupation':
      if (!trimmedInput) {
        return { isValid: false, error: 'ご職業を入力してください。' };
      }
      return { isValid: true };

    case 'konkatsuStatus':
      const validInputs = ['1', '2', '3', '初心者', '経験', '再チャレンジ'];
      const isValid = validInputs.some(valid => 
        trimmedInput === valid || trimmedInput.includes(valid)
      );
      
      if (!isValid) {
        return { 
          isValid: false, 
          error: '1️⃣、2️⃣、3️⃣のいずれかの番号、または\n「初心者」「経験あり」「再チャレンジ」で教えてください。' 
        };
      }
      return { isValid: true };

    default:
      return { isValid: true };
  }
}

export function getNextStep(currentStep: AuthStep, mode: AuthMode): AuthStep | null {
  if (mode === 'login') {
    switch (currentStep) {
      case 'email_confirm':
        return 'complete';
      default:
        return null;
    }
  }

  // Register mode
  switch (currentStep) {
    case 'start':
      return 'name';
    case 'name':
      return 'email';
    case 'email':
      return 'password';
    case 'password':
      return 'age';
    case 'age':
      return 'occupation';
    case 'occupation':
      return 'konkatsuStatus';
    case 'konkatsuStatus':
      return 'complete';
    default:
      return null;
  }
}

export function getStepProgress(currentStep: AuthStep, mode: AuthMode): StepProgress | null {
  if (mode === 'login') {
    const steps = ['email', 'password'];
    const current = steps.indexOf(currentStep) + 1;
    return current > 0 ? { current: Math.min(current, 2), total: 2 } : null;
  }

  // Register mode
  const steps = ['name', 'email', 'password', 'age', 'occupation', 'konkatsuStatus'];
  const current = steps.indexOf(currentStep) + 1;
  return current > 0 ? { current: Math.min(current, 6), total: 6 } : null;
}

export function getStepTitle(step: AuthStep): string {
  switch (step) {
    case 'name':
      return 'お名前';
    case 'email':
      return 'メールアドレス';
    case 'password':
      return 'パスワード';
    case 'age':
      return '年齢';
    case 'occupation':
      return 'ご職業';
    case 'konkatsuStatus':
      return '婚活状況';
    case 'location':
      return 'お住まい';
    case 'hobbies':
      return 'ご趣味';
    default:
      return '';
  }
}