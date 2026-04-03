import React, { useState, useEffect } from 'react';
import { Activity, Plus, Server, CheckCircle2, XCircle, Trash2, Clock, Globe, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, XAxis, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { getMonitors, addMonitor, deleteMonitor, getLogs } from './api';

function formatDistanceStrict(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Subcomponent: Monitor Card
function MonitorCard({ monitor, onDelete, onClick }) {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    getLogs(monitor.id).then(data => setLogs(data.reverse()));
  }, [monitor.id]);

  const isUp = monitor.status === 'UP';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick(monitor, logs)}
      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] cursor-pointer rounded-2xl p-5 overflow-hidden relative group transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
            {monitor.name}
          </h3>
          <p className="text-zinc-400 text-sm flex items-center gap-1 mt-1 truncate max-w-[200px]" title={monitor.url}>
            <Globe className="w-3 h-3" /> {monitor.url}
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {isUp ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {monitor.status}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(monitor.id); }}
            className="md:opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-rose-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-24 w-full mt-4 -ml-2 -mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={logs}>
            <defs>
              <linearGradient id={`color-${monitor.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ background: 'rgba(24, 24, 27, 0.95)', border: '1px solid #27272a', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: '#e4e4e7', fontSize: '12px', fontWeight: 'bold' }}
              formatter={(val) => [`${val}ms`, 'Latency']}
              cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke={isUp ? "#10b981" : "#f43f5e"} 
              fillOpacity={1} 
              fill={`url(#color-${monitor.id})`} 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-xs text-zinc-500">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Checked {monitor.last_checked ? formatDistanceStrict(monitor.last_checked) : 'never'}</span>
        <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 font-medium">Details <ChevronRight className="w-3 h-3"/></span>
      </div>
    </motion.div>
  );
}

// Subcomponent: Detailed Monitoring View
function DetailedModal({ monitor, initialLogs, onClose }) {
  const [logs, setLogs] = useState(initialLogs);
  
  useEffect(() => {
    // Poll for real-time log updates while modal is open
    const intv = setInterval(() => {
      getLogs(monitor.id).then(data => setLogs(data.reverse()));
    }, monitor.interval_seconds * 1000);
    return () => clearInterval(intv);
  }, [monitor]);

  const isUp = monitor.status === 'UP';

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 flex flex-col"
      >
        <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-zinc-800 p-6 sm:px-8 flex justify-between items-start z-20">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{monitor.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {monitor.status}
              </span>
            </div>
            <a href={monitor.url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
              <Globe className="w-4 h-4"/> {monitor.url}
            </a>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Big Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-6 text-white">Response Time History</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logs}>
                  <defs>
                    <linearGradient id="colorBig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="created_at" 
                    tickFormatter={(tick) => {
                      if(!tick) return '';
                      return format(new Date(tick), 'HH:mm:ss');
                    }}
                    stroke="#52525b" 
                    tick={{fill: '#a1a1aa', fontSize: 12}}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    tick={{fill: '#a1a1aa', fontSize: 12}}
                    tickFormatter={(val) => `${val}ms`}
                    width={50}
                  />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(24, 24, 27, 0.95)', border: '1px solid #3f3f46', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                    labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy HH:mm:ss')}
                    formatter={(val) => [`${val} ms`, 'Latency']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="latency" 
                    stroke={isUp ? "#10b981" : "#f43f5e"} 
                    fillOpacity={1} 
                    fill="url(#colorBig)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800">
               <h3 className="text-lg font-bold text-white">Recent Pings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 text-zinc-400 text-sm">
                    <th className="py-4 px-6 font-medium">Timestamp</th>
                    <th className="py-4 px-6 font-medium">Status</th>
                    <th className="py-4 px-6 font-medium">Latency</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-zinc-800">
                  {logs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3 px-6 text-zinc-300 font-mono">
                        {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${log.status === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {log.status === 'UP' ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 font-mono text-zinc-300">
                        {log.latency} ms
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-zinc-500">No pings recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function App() {
  const [monitors, setMonitors] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: 'https://', interval_seconds: 60 });
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    getMonitors().then(data => {
      setMonitors(data);
      setLoading(false);
    }).catch(e => console.error(e));
  };

  useEffect(() => {
    loadData();
    const intv = setInterval(loadData, 15000);
    return () => clearInterval(intv);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addMonitor(formData);
    setIsAdding(false);
    setFormData({ name: '', url: 'https://', interval_seconds: 60 });
    loadData();
  };

  const handleDelete = async (id) => {
    if(confirm("Are you sure you want to remove this monitor?")) {
      await deleteMonitor(id);
      loadData();
      if (selectedMonitor && selectedMonitor.monitor.id === id) {
        setSelectedMonitor(null);
      }
    }
  };

  const activeCount = monitors.filter(m => m.status === 'UP').length;
  const downCount = monitors.length - activeCount;

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-emerald-500/30 pb-20">
      
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-2xl border-b border-zinc-900 support-backdrop-blur:bg-white/95">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-105 transition-all duration-300">
                <Activity className="w-6 h-6 text-emerald-950" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Nexus Monitor</h1>
                <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Pro Uptime</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:from-emerald-400 hover:to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all cursor-pointer z-50 relative hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Add Endpoint
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-16">
        {/* Dynamic Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="md:col-span-2 flex flex-col justify-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white to-zinc-600 bg-clip-text text-transparent mb-3">
              Network Pulse
            </h2>
            <p className="text-zinc-400 text-lg">Real-time health telemetry across all infrastructure endpoints.</p>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Server className="w-20 h-20 text-white"/></div>
             <span className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-1 z-10">Total endpoints</span>
             <span className="text-5xl font-black text-white z-10">{monitors.length}</span>
          </div>
          <div className="bg-emerald-950/20 backdrop-blur-sm border border-emerald-900/30 rounded-3xl p-6 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-20 h-20 text-emerald-500"/></div>
             <span className="text-sm font-semibold text-emerald-500 uppercase tracking-widest mb-1 z-10">System Status</span>
             <div className="flex items-center gap-2 z-10 mt-1">
               <div className={`w-3 h-3 rounded-full ${downCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]'}`}></div>
               <span className={`text-xl font-bold ${downCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                 {downCount > 0 ? `${downCount} Degraded` : 'All Systems Operational'}
               </span>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-6 text-zinc-500">
            <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-emerald-500 animate-spin"></div>
            <p className="text-lg animate-pulse">Establishing secure connection...</p>
          </div>
        ) : monitors.length === 0 ? (
          <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[2rem] p-16 text-center flex flex-col items-center max-w-3xl mx-auto shadow-2xl">
            <div className="w-24 h-24 bg-zinc-900 shadow-xl rounded-3xl flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-3xl blur-xl"></div>
              <Activity className="w-10 h-10 text-zinc-500 relative z-10" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-white">No active monitors</h3>
            <p className="text-zinc-400 text-lg max-w-md mb-8">Deploy your first health check to start gathering real-time latency and uptime metrics.</p>
            <button onClick={() => setIsAdding(true)} className="bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:bg-zinc-200 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              Initialize First Check
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {monitors.map(monitor => (
                <MonitorCard 
                  key={monitor.id} 
                  monitor={monitor} 
                  onDelete={handleDelete} 
                  onClick={(m, l) => setSelectedMonitor({ monitor: m, logs: l })}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedMonitor && (
          <DetailedModal 
            monitor={selectedMonitor.monitor} 
            initialLogs={selectedMonitor.logs} 
            onClose={() => setSelectedMonitor(null)} 
          />
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-[2rem] w-full max-w-md relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                 <Server className="w-6 h-6 text-emerald-400" />
              </div>

              <h2 className="text-3xl font-bold mb-2">New Monitor</h2>
              <p className="text-zinc-400 mb-8">Configure endpoint testing parameters.</p>
              
              <form onSubmit={handleAdd} className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">Identifier</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Production API Router"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-white placeholder:text-zinc-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">Endpoint URL</label>
                  <input 
                    required
                    type="url"
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    placeholder="https://api.example.com/health"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-sm text-white placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">Polling Frequency</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[30, 60].map(int => (
                      <button
                        type="button"
                        key={int}
                        onClick={() => setFormData({...formData, interval_seconds: int})}
                        className={`py-3.5 rounded-xl border text-sm font-bold transition-all ${formData.interval_seconds === int ? 'bg-emerald-500 text-emerald-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                      >
                        {int} Seconds
                      </button>
                    ))}
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-bold mt-4 hover:bg-zinc-200 transition-colors shadow-xl">
                  Deploy Monitor
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;

