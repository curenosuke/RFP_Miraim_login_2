export type AuthMode = 'register' | 'login';

export type AuthStep = 
  | 'start'
  | 'name'
  | 'email'
  | 'password'
  | 'age'
  | 'occupation'
  | 'konkatsuStatus'
  | 'location'
  | 'hobbies'
  | 'email_confirm'
  | 'complete';

export interface UserData {
  name?: string;
  email?: string;
  password?: string;
  age?: number;
  occupation?: string;
  konkatsuStatus?: string;
  location?: string;
  hobbies?: string;
}

export interface Message {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  timestamp: Date;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface StepProgress {
  current: number;
  total: number;
}