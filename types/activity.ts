export type ActivityType = 
  | 'registration'
  | 'login'
  | 'logout'
  | 'password_reset'
  | 'email_verification'
  | 'profile_update'
  | 'google_login';

export interface UserActivity {
  id: string;
  userId: string;
  type: string;
  metadata: {
    success: boolean;
    error?: string;
    [key: string]: any;
  };
  timestamp: Date;
}

export interface LoginAttempt {
  id: string;
  userId: string;
  email: string;
  method: string;
  metadata: {
    success: boolean;
    device: string;
    browser: string;
    error?: string;
  };
  timestamp: Date;
}

export interface UserRegistration {
  id: string;
  userId: string;
  email: string;
  timestamp: Date;
  method: 'email' | 'google';
  companyId: string;
  metadata: {
    ip?: string;
    userAgent?: string;
    location?: string;
    device?: string;
    browser?: string;
  };
} 