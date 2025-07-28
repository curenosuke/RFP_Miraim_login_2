export type AuthMode = 'register' | 'login';

export type AuthStep = 
  | 'start'
  | 'name'
  | 'email'
  | 'password'
  | 'birthdate'
  | 'konkatsuStatus'
  | 'optional_confirm'
  | 'occupation'
  | 'birthplace'
  | 'location'
  | 'hobbies'
  | 'holiday_style'
  | 'email_confirm'
  | 'password_confirm'
  | 'complete';

export interface UserData {
  name?: string;
  email?: string;
  password?: string;
  birthdate?: string;
  konkatsuStatus?: string;
  occupation?: string;
  birthplace?: string;
  location?: string;
  hobbies?: string;
  holidayStyle?: string;
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