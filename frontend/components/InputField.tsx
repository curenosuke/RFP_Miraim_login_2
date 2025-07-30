'use client';

import { forwardRef } from 'react';
import { AuthStep } from '@/types/auth';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  currentStep: AuthStep;
  disabled?: boolean;
  onForgotPassword?: () => void;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ value, onChange, currentStep, disabled, onForgotPassword }, ref) => {
    const getInputType = (step: AuthStep) => {
      switch (step) {
        case 'email':
        case 'email_confirm':
          return 'email';
        case 'password':
        case 'password_confirm':
          return 'password';
        case 'birthdate':
          return 'date';
        case 'age':
          return 'number';
        default:
          return 'text';
      }
    };

    const getPlaceholder = (step: AuthStep) => {
      switch (step) {
        case 'name':
          return 'お名前を入力してください';
        case 'email':
        case 'email_confirm':
          return 'メールアドレスを入力してください';
        case 'password':
        case 'password_confirm':
          return 'パスワードを入力してください';
        case 'birthdate':
          return '生年月日を選択してください';
        case 'age':
          return '年齢を入力してください';
        case 'occupation':
          return 'ご職業を入力してください';
        case 'konkatsuStatus':
          return '1、2、3のいずれかまたは内容を入力';
        default:
          return 'メッセージを入力してください';
      }
    };

    return (
      <div className="w-full">
        <input
          ref={ref}
          type={getInputType(currentStep)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getPlaceholder(currentStep)}
          disabled={disabled}
          min={currentStep === 'age' ? 18 : undefined}
          max={currentStep === 'age' ? 100 : undefined}
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
                 {(currentStep === 'password_confirm') && (
           <button
             type="button"
             onClick={onForgotPassword}
             className="mt-2 text-sm text-orange-600 hover:text-orange-700 underline"
           >
             パスワードを忘れた方
           </button>
         )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;