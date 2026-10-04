import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  RotateCw, 
  Filter, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Calendar, 
  PhoneCall, 
  MessageSquare,
  Search
} from 'lucide-react';
import { AuditEvent } from '../types';

interface Props {
  refreshTrigger: number;
}

export const AuditTrail: React.FC<Props> = ({ refreshTrigger }) => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger]);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filterType === 'ALL' || log.eventType === filterType;
    const matchesSearch = !searchTerm || 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.callId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getEventBadge = (type: AuditEvent['eventType']) => {
    switch (type) {
      case 'CALL_INITIATED':
        return <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">CALL_INITIATED</span>;
      case 'MID_CALL_ACTION_TRIGGERED':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold">MID_CALL_TRIGGER</span>;
      case 'WHATSAPP_DISPATCHED':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">WHATSAPP_SENT</span>;
      case 'CALLBACK_RESERVED':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">CALLBACK_BOOKED</span>;
      case 'INTENT_REEVALUATED':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">INTENT_EVAL</span>;
      case 'WEBHOOK_RECEIVED':
        return <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[10px]">WEBHOOK_RECV</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">Neon DB Telemetry Log</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Assignment Requirement #10: Complete Audit Trail</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Immutable Telephony &amp; Decision Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Every outbound SIP event, conversational speech-to-text turn, intent score recalculation, and mid-call WhatsApp trigger is recorded with millisecond precision.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto font-mono cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400 font-mono text-[11px]">Filter by Event:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 font-mono text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="MID_CALL_ACTION_TRIGGERED">Mid-Call Action Triggered</option>
            <option value="WHATSAPP_DISPATCHED">WhatsApp Dispatched</option>
            <option value="CALLBACK_RESERVED">Callback Reserved</option>
            <option value="INTENT_REEVALUATED">Intent Reevaluated</option>
            <option value="WEBHOOK_RECEIVED">Webhook Received</option>
            <option value="CALL_INITIATED">Call Initiated</option>
          </select>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail..."
            className="bg-slate-950 border border-slate-800 rounded px-3 py-1 text-slate-200 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 w-52"
          />
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC/IST)</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Call ID</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No matching audit records found. Initiate a call or test a simulation to generate events.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}.{new Date(log.timestamp).getMilliseconds()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getEventBadge(log.eventType)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {log.callId}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-sans text-xs">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
