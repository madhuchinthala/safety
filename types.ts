
export enum SafetyLevel {
  SAFE = 'SAFE',
  CONCERNING = 'CONCERNING',
  DANGER = 'DANGER'
}

export interface TrustedContact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface UserProfile {
  name: string;
  contacts: TrustedContact[];
  gender?: string;
  age?: number;
}

export interface AnalysisResult {
  emotion: string;
  intensity: number;
  statusSummary: string;
  safetyLevel: SafetyLevel;
  recommendation: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string; // Added body for location details
  timestamp: Date;
  isUrgent: boolean;
}
