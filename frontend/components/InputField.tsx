'use client';

import { forwardRef } from 'react';
import { AuthStep } from '@/types/auth';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  currentStep: AuthStep;
  disabled?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ value, onChange, currentStep, disabled }, ref) => {
    const getInputType = (step: AuthStep) => {
      switch (step) {
        case 'email':
          return 'email';
        case 'password':
          return 'password';
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
          return 'メールアドレスを入力してください';
        case 'password':
          return 'パスワードを入力してください';
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
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;