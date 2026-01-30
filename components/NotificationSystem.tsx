
import React from 'react';
import { EmailLog } from '../types';

interface NotificationSystemProps {
  logs: EmailLog[];
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full z-50">
      <div className="bg-slate-900 rounded-xl p-4 shadow-2xl border border-slate-700 text-white overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Sentient Mail Gateway</h4>
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {[...logs].reverse().map((log) => (
            <div key={log.id} className={`p-3 rounded-lg text-xs border ${log.isUrgent ? 'bg-red-950/40 border-red-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`font-semibold ${log.isUrgent ? 'text-red-400' : 'text-slate-300'}`}>
                  {log.isUrgent ? '🚨 SOS ALERT' : '✉️ Report Sent'}
                </span>
                <span className="text-[10px] text-slate-500">{log.timestamp.toLocaleTimeString()}</span>
              </div>
              <p className="text-slate-400 mb-1">To: {log.to}</p>
              <p className="font-medium text-white mb-1">{log.subject}</p>
              <p className="text-[10px] text-slate-400 font-mono break-all bg-black/20 p-1 rounded">{log.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;
