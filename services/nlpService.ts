
import { AnalysisResult, SafetyLevel, UserProfile } from "../types";

// =========================================================
// 🌍 DEPLOYMENT CONFIGURATION
// If you deploy the backend to Render, put the URL here.
// Example: const API_URL = "https://sentient-backend.onrender.com/analyze";
// =========================================================
const API_URL = "https://safety-txzq.onrender.com"; 

// Local fallback regex (kept for offline redundancy)
const localAnalyze = (text: string): AnalysisResult => {
  const t = text.toLowerCase();
  
  const patterns = {
    DANGER: [
      /\bhelp\b/i, /\bdanger\b/i, /\bemergency\b/i, /\bsos\b/i,
      /\bhelp me\b/i, /\bneed help\b/i, /\bin danger\b/i, /\bcall 911\b/i,
      /\bkill\b/i, /\bsuicide\b/i, /\bdie\b/i, /\bhurt myself\b/i, 
      /\bend it all\b/i, /\bself-harm\b/i, /\bno point\b/i, /\bharm\b/i
    ],
    CONCERNING: [
      /\bsad\b/i, /\blonely\b/i, /\bdepressed\b/i, /\bangry\b/i, 
      /\banxious\b/i, /\bfear\b/i, /\bcrying\b/i, /\bhate\b/i, /\bworthless\b/i,
      /\btired\b/i, /\bpain\b/i, /\bnot feeling good\b/i
    ]
  };

  if (patterns.DANGER.some(regex => regex.test(t))) {
    return {
      emotion: "CRITICAL / DANGER",
      intensity: 10,
      statusSummary: "Immediate safety risk detected (Keywords found).",
      safetyLevel: SafetyLevel.DANGER,
      recommendation: "Emergency protocols activated."
    };
  }

  if (patterns.CONCERNING.some(regex => regex.test(t))) {
    return {
      emotion: "Distress",
      intensity: 7,
      statusSummary: "High emotional weight detected.",
      safetyLevel: SafetyLevel.CONCERNING,
      recommendation: "Wellness check advised."
    };
  }

  return {
    emotion: "Neutral",
    intensity: 3,
    statusSummary: "No immediate risks found.",
    safetyLevel: SafetyLevel.SAFE,
    recommendation: "Keep journaling."
  };
};

export const analyzeEmotion = async (
  text: string, 
  user?: UserProfile, 
  location?: string
): Promise<{ result: AnalysisResult; source: 'node' | 'local'; emailSent?: boolean }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for slower free tier servers

    // Use the variable defined at top of file
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, user, location }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return { 
        result: data, 
        source: 'node',
        emailSent: data.emailSent
      };
    }
    throw new Error('Backend error');
  } catch (error) {
    console.warn("Backend unreachable/failed, using local fallback.", error);
    return { result: localAnalyze(text), source: 'local', emailSent: false };
  }
};
