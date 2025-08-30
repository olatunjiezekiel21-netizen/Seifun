import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Info, Bug, Trash2, Copy, Download } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: any;
  stack?: string;
}

interface DebugConsoleProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ isVisible, onToggle }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error' | 'info'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    // Intercept console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (level: 'log' | 'warn' | 'error' | 'info', ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      const newLog: LogEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        level,
        message,
        data: args.length > 1 ? args : undefined
      };

      setLogs(prev => [...prev, newLog]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', ...args);
      
      // Capture stack trace for errors
      const error = args.find(arg => arg instanceof Error);
      if (error) {
        setLogs(prev => {
          const lastLog = prev[prev.length - 1];
          if (lastLog && lastLog.level === 'error') {
            return prev.map(log => 
              log.id === lastLog.id 
                ? { ...log, stack: error.stack }
                : log
            );
          }
          return prev;
        });
      }
    };

    console.info = (...args) => {
      originalInfo(...args);
      addLog('info', ...args);
    };

    // Cleanup function
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, [isVisible]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      console.log('Logs copied to clipboard');
    });
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seifun-debug-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'warn': return 'text-yellow-400 bg-yellow-900/20';
      case 'info': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-300 bg-gray-800/20';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle size={14} />;
      case 'warn': return <AlertTriangle size={14} />;
      case 'info': return <Info size={14} />;
      default: return <Bug size={14} />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bug size={16} className="text-green-400" />
          <span className="text-sm font-medium text-gray-200">Debug Console</span>
          <span className="text-xs text-gray-400">({logs.length} logs)</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyLogs}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
            title="Copy logs"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={downloadLogs}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
            title="Download logs"
          >
            <Download size={14} />
          </button>
          <button
            onClick={clearLogs}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
            title="Clear logs"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
            title="Close console"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 p-2 border-b border-gray-700 bg-gray-800">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1"
        >
          <option value="all">All ({logs.length})</option>
          <option value="log">Log ({logs.filter(l => l.level === 'log').length})</option>
          <option value="info">Info ({logs.filter(l => l.level === 'info').length})</option>
          <option value="warn">Warn ({logs.filter(l => l.level === 'warn').length})</option>
          <option value="error">Error ({logs.filter(l => l.level === 'error').length})</option>
        </select>
        
        <label className="flex items-center space-x-1 text-xs text-gray-400">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded"
          />
          <span>Auto-scroll</span>
        </label>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-48">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="text-xs font-mono">
              <div className="flex items-start space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded ${getLevelColor(log.level)}`}>
                  {getLevelIcon(log.level)}
                  <span className="uppercase">{log.level}</span>
                </div>
                <span className="text-gray-400 text-xs">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="ml-4 mt-1 text-gray-300 break-words">
                {log.message}
              </div>
              {log.stack && (
                <div className="ml-4 mt-1 text-red-400 text-xs font-mono whitespace-pre-wrap">
                  {log.stack}
                </div>
              )}
              {log.data && log.data.length > 1 && (
                <div className="ml-4 mt-1 text-gray-400 text-xs">
                  <details>
                    <summary className="cursor-pointer hover:text-gray-300">View data</summary>
                    <pre className="mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};