
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnalysisResult, SafetyLevel, EmailLog, TrustedContact } from './types';
import SimpleLogin from './components/SimpleLogin';
import TrustedContacts from './components/TrustedContacts';
import NotificationSystem from './components/NotificationSystem';
import { analyzeEmotion } from './services/nlpService';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [emotionText, setEmotionText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMicBlocked, setIsMicBlocked] = useState(false);
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null);
  const [engineSource, setEngineSource] = useState<'node' | 'local' | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [scanning, setScanning] = useState(false); // Visual indicator for background scan
  
  const recognitionRef = useRef<any>(null);
  const shouldBeListeningRef = useRef<boolean>(true);
  const userRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sentient_v2_user_simple');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      userRef.current = parsed;
    }
  }, []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const getLocationLink = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("Location not available");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`https://www.google.com/maps?q=${latitude},${longitude}`);
        },
        () => resolve("Location permission denied")
      );
    });
  };

  // Helper for automated background analysis
  const handleAutoAnalysis = async (textChunk: string) => {
    if (!userRef.current || !textChunk.trim()) return;

    setScanning(true); // Show scanning UI

    const loc = await getLocationLink();
    
    try {
      // Analyze the CHUNK (the latest sentence), not the whole text, to trigger immediate alerts
      const { result, source, emailSent } = await analyzeEmotion(textChunk, userRef.current, loc);
      
      // Always update UI to show we analyzed it, even if Safe
      setLastResult(result);
      setEngineSource(source);

      if (emailSent && userRef.current.contacts.length > 0) {
        userRef.current.contacts.forEach(c => {
          addEmailLog(
            c.email,
            `AUTO-ALERT: ${result.safetyLevel}`,
            `Sent via Backend.\nTrigger: "${textChunk}"`,
            result.safetyLevel === SafetyLevel.DANGER
          );
        });
      }
    } catch (e) {
      console.error("Auto-analysis error", e);
    } finally {
      setTimeout(() => setScanning(false), 1000);
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
          const trimmedChunk = finalChunk.trim();
          setEmotionText(prev => (prev + ' ' + trimmedChunk).trim());
          console.log("Speech Final:", trimmedChunk);
          handleAutoAnalysis(trimmedChunk);
        }
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsMicBlocked(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (shouldBeListeningRef.current && !isMicBlocked) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.warn("Recognition auto-restart failed");
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setIsMicBlocked(true);
          shouldBeListeningRef.current = false;
          setIsListening(false);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        shouldBeListeningRef.current = false;
        recognitionRef.current.stop();
      }
    };
  }, [isMicBlocked]);

  useEffect(() => {
    if (user && recognitionRef.current && !isListening && shouldBeListeningRef.current && !isMicBlocked) {
      const startListening = () => {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Interaction usually required
        }
      };
      const timer = setTimeout(startListening, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isListening, isMicBlocked]);

  const handleLogin = (name: string) => {
    const newUser: UserProfile = { name, contacts: [] };
    setUser(newUser);
    userRef.current = newUser;
    localStorage.setItem('sentient_v2_user_simple', JSON.stringify(newUser));
    shouldBeListeningRef.current = true;
  };

  const toggleListening = () => {
    if (isListening) {
      shouldBeListeningRef.current = false;
      recognitionRef.current?.stop();
    } else {
      setIsMicBlocked(false);
      shouldBeListeningRef.current = true;
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Manual start failed:", e);
      }
    }
  };

  const addEmailLog = (to: string, subject: string, body: string, isUrgent: boolean = false) => {
    const newLog: EmailLog = {
      id: Math.random().toString(36).substr(2, 9),
      to,
      subject,
      body,
      timestamp: new Date(),
      isUrgent
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleSubmit = async () => {
    if (!emotionText.trim() || !user) return;
    setIsAnalyzing(true);
    setLastResult(null);

    const loc = await getLocationLink();

    try {
      const { result, source, emailSent } = await analyzeEmotion(emotionText, user, loc);
      setLastResult(result);
      setEngineSource(source);

      if (emailSent && user.contacts.length > 0) {
        user.contacts.forEach(c => {
          addEmailLog(
            c.email,
            `MANUAL-ALERT: ${result.safetyLevel}`,
            `Backend confirmed email sent.\nLocation: ${loc}`,
            result.safetyLevel === SafetyLevel.DANGER
          );
        });
      }
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Is server.js running?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateContacts = (newContacts: TrustedContact[]) => {
    if (!user) return;
    const updatedUser = { ...user, contacts: newContacts };
    setUser(updatedUser);
    userRef.current = updatedUser;
    localStorage.setItem('sentient_v2_user_simple', JSON.stringify(updatedUser));
  };

  if (!user) {
    return <SimpleLogin onEnter={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 relative pb-40">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-800 tracking-tight block">SentientGuardian</span>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${isMicBlocked ? 'bg-orange-100 text-orange-600' : isListening ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                {isMicBlocked ? '⚠️ Mic Blocked' : isListening ? '🔴 Monitor Active' : '⚪ Paused'}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${scanning ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`}>
                {scanning ? '⚡ Scanning Voice...' : engineSource === 'node' ? 'Node Backend' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-sm font-bold text-gray-800">{user.name}</p>
           </div>
           <button 
              onClick={() => { localStorage.removeItem('sentient_v2_user_simple'); setUser(null); userRef.current = null; }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
        </div>
      </header>

      {isMicBlocked && (
        <div className="bg-orange-500 text-white px-6 py-2 text-sm font-medium flex items-center justify-between animate-fade-in">
          <span>Microphone blocked. Enable it to use voice features.</span>
          <button onClick={toggleListening} className="underline font-bold">Retry</button>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 pt-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
            Safety & <span className="text-indigo-600">Emotion</span>
          </h2>
          <p className="text-gray-500 mt-4 text-lg max-w-lg mx-auto italic">
            Monitoring Enabled. Say <span className="font-bold text-red-500">"Help"</span> or <span className="font-bold text-red-500">"Danger"</span> to trigger emergency.
          </p>
        </div>

        <div className={`bg-white rounded-[2rem] shadow-xl p-6 md:p-10 border-4 transition-all duration-300 relative overflow-hidden ${isListening ? 'border-indigo-100 ring-4 ring-indigo-50' : 'border-gray-50'}`}>
           <textarea
            className="w-full min-h-[150px] text-xl p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none placeholder-gray-400"
            placeholder={isMicBlocked ? "Type here..." : "Listening for safety triggers..."}
            value={emotionText}
            onChange={(e) => setEmotionText(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8">
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                onClick={toggleListening}
                className={`flex-1 sm:flex-none p-5 rounded-2xl transition-all relative ${
                  isListening ? 'bg-red-500 text-white shadow-xl' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${isListening ? 'animate-pulse' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setEmotionText('')}
                className="flex-1 sm:flex-none p-5 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <button
              disabled={isAnalyzing || !emotionText.trim()}
              onClick={handleSubmit}
              className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 ${
                isAnalyzing ? 'bg-indigo-300 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isAnalyzing ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </div>

        {lastResult && (
          <div className={`mt-10 p-8 rounded-[2rem] border-2 animate-fade-in shadow-xl transition-all ${
            lastResult.safetyLevel === SafetyLevel.DANGER ? 'bg-red-50 border-red-200 text-red-900' :
            lastResult.safetyLevel === SafetyLevel.CONCERNING ? 'bg-amber-50 border-amber-200 text-amber-900' :
            'bg-green-50 border-green-200 text-green-900'
          }`}>
             <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">
                  {lastResult.safetyLevel === SafetyLevel.DANGER ? '🆘' : lastResult.intensity > 6 ? '⚠️' : '✅'}
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  {lastResult.emotion}
                </h3>
              </div>
              <p className="text-xl font-medium opacity-80 leading-relaxed mb-6">
                {lastResult.statusSummary}
              </p>
              {lastResult.safetyLevel === SafetyLevel.DANGER && (
                <div className="bg-red-100 p-4 rounded-xl border border-red-200 mb-4 animate-pulse">
                  <p className="font-bold text-red-700">⚠️ AUTOMATIC EMAIL TRIGGERED</p>
                  {lastResult.emailSent === false && <p className="text-xs text-red-500 mt-1">(Check server console for delivery status)</p>}
                </div>
              )}
              <div className="bg-white/60 p-5 rounded-2xl shadow-sm border border-white/50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Recommendation</p>
                <p className="text-gray-800 leading-relaxed font-medium">{lastResult.recommendation}</p>
              </div>
          </div>
        )}

        <TrustedContacts 
          contacts={user.contacts} 
          onAdd={(c) => updateContacts([...user.contacts, c])}
          onRemove={(id) => updateContacts(user.contacts.filter(c => c.id !== id))}
        />
      </main>

      <NotificationSystem logs={logs} />
    </div>
  );
};

export default App;
