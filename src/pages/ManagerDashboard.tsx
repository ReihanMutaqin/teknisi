import { useState, useEffect, useMemo } from "react";
import { getAllTasks } from "../lib/db";
import type { TaskData } from "../lib/db";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2 } from "lucide-react";
import { DataTable } from "../components/DataTable";

const COLORS = {
  'Completed': '#10b981', // green
  'On Progress': '#3b82f6', // blue
  'Kendala': '#f59e0b', // amber
  'Cancel': '#ef4444', // red
  'Pending': '#94a3b8' // slate
};

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWitel, setSelectedWitel] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("ALL");
  const [activityFilterSto, setActivityFilterSto] = useState<string>("ALL");
  const [activityFilterStatus, setActivityFilterStatus] = useState<string>("ALL");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'On Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Kendala': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Cancel': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  useEffect(() => {
    async function fetchTasks() {
      const all = await getAllTasks();
      setTasks(all);
      setLoading(false);
    }
    fetchTasks();
  }, []);

  const witels = useMemo(() => {
    return ["JAKSEL", "JAKTIM", "JAKPUS"];
  }, []);

  const dates = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.orderDate))).filter(Boolean).sort().reverse();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (selectedWitel !== "ALL") {
      result = result.filter(t => t.witel === selectedWitel);
    }
    if (selectedDate !== "ALL") {
      result = result.filter(t => t.orderDate === selectedDate);
    }
    return result;
  }, [tasks, selectedWitel, selectedDate]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      'Pending': 0, 'On Progress': 0, 'Completed': 0, 'Kendala': 0, 'Cancel': 0
    };
    filteredTasks.forEach(t => {
      counts[t.trackerStatus] = (counts[t.trackerStatus] || 0) + 1;
    });
    return counts;
  }, [filteredTasks]);

  const pieData = Object.entries(stats).map(([name, value]) => ({ name, value }));

  const witelData = useMemo(() => {
    if (selectedWitel !== "ALL") return [];
    const grouped: Record<string, any> = {};
    tasks.forEach(t => {
      if (!grouped[t.witel]) {
        grouped[t.witel] = { witel: t.witel, Completed: 0, 'On Progress': 0, Kendala: 0, Cancel: 0, Pending: 0 };
      }
      grouped[t.witel][t.trackerStatus] += 1;
    });
    return Object.values(grouped);
  }, [tasks, selectedWitel]);

  const stoData = useMemo(() => {
    if (selectedWitel === "ALL") return [];
    const grouped: Record<string, any> = {};
    filteredTasks.forEach(t => {
      const stoName = t.sto || 'UNKNOWN';
      if (!grouped[stoName]) {
        grouped[stoName] = { sto: stoName, Completed: 0, 'On Progress': 0, Kendala: 0, Cancel: 0, Pending: 0 };
      }
      grouped[stoName][t.trackerStatus] += 1;
    });
    return Object.values(grouped);
  }, [filteredTasks, selectedWitel]);

  const activeTasks = useMemo(() => {
    return filteredTasks.filter(t => t.technicianName && t.trackerStatus !== 'Pending');
  }, [filteredTasks]);

  const uniqueActivityStos = useMemo(() => {
    return Array.from(new Set(activeTasks.map(t => t.sto))).filter(Boolean).sort();
  }, [activeTasks]);
  
  const uniqueActivityStatuses = useMemo(() => {
    return Array.from(new Set(activeTasks.map(t => t.trackerStatus))).filter(Boolean).sort();
  }, [activeTasks]);

  const displayedActiveTasks = useMemo(() => {
    let result = activeTasks;
    if (activityFilterSto !== "ALL") {
      result = result.filter(t => t.sto === activityFilterSto);
    }
    if (activityFilterStatus !== "ALL") {
      result = result.filter(t => t.trackerStatus === activityFilterStatus);
    }
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [activeTasks, activityFilterSto, activityFilterStatus]);

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Tanggal:</span>
            <select 
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-semibold"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="ALL">Semua Tanggal</option>
              {dates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Area:</span>
            <select 
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-semibold"
              value={selectedWitel}
              onChange={(e) => setSelectedWitel(e.target.value)}
            >
              <option value="ALL">Semua WITEL</option>
              {witels.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">{status}</h3>
            <p className="text-3xl font-black mt-2" style={{ color: COLORS[status as keyof typeof COLORS] }}>{count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
          <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">Distribusi Status Pekerjaan</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {selectedWitel === "ALL" && witelData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">Performa Tiap WITEL</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={witelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="witel" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Completed" stackId="a" fill={COLORS['Completed']} />
                <Bar dataKey="On Progress" stackId="a" fill={COLORS['On Progress']} />
                <Bar dataKey="Kendala" stackId="a" fill={COLORS['Kendala']} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {selectedWitel !== "ALL" && stoData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">Performa Tiap STO ({selectedWitel})</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stoData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="sto" tick={{fontSize: 10}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Completed" stackId="a" fill={COLORS['Completed']} />
                <Bar dataKey="On Progress" stackId="a" fill={COLORS['On Progress']} />
                <Bar dataKey="Kendala" stackId="a" fill={COLORS['Kendala']} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 flex flex-col overflow-y-auto max-h-[400px]">
           <h2 className="text-lg font-bold text-red-700 mb-4 sticky top-0 bg-white pb-2 border-b border-red-100 flex items-center gap-2">
             🚨 Catatan Kendala Terbaru
           </h2>
           <div className="space-y-4">
              {filteredTasks
                .filter(t => t.trackerStatus === 'Kendala' && t.notes)
                .slice(0, 15)
                .map(t => (
                <div key={t.id} className="border-b border-slate-100 pb-3 last:border-0 bg-red-50 p-3 rounded-lg border border-red-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-sm">{t.order}</span>
                    <span className="text-xs font-bold text-slate-500">{t.witel} - {t.sto}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mb-1">Teknisi: {t.technicianName}</p>
                  <p className="text-sm text-red-800 font-medium">"{t.notes}"</p>
                </div>
              ))}
              {filteredTasks.filter(t => t.trackerStatus === 'Kendala' && t.notes).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">Tidak ada laporan kendala saat ini.</p>
              )}
           </div>
        </div>
        
        {/* Aktivitas Teknisi Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 flex flex-col overflow-y-auto max-h-[400px]">
           <div className="sticky top-0 bg-white pb-3 border-b border-blue-100 mb-4 z-10">
             <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-3">
               👨‍🔧 Aktivitas Teknisi Lapangan
             </h2>
             <div className="flex gap-2">
               <select 
                 className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs font-semibold"
                 value={activityFilterSto}
                 onChange={(e) => setActivityFilterSto(e.target.value)}
               >
                 <option value="ALL">Semua STO</option>
                 {uniqueActivityStos.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <select 
                 className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs font-semibold"
                 value={activityFilterStatus}
                 onChange={(e) => setActivityFilterStatus(e.target.value)}
               >
                 <option value="ALL">Semua Status</option>
                 {uniqueActivityStatuses.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
           </div>
           
           <div className="space-y-4">
              {displayedActiveTasks
                .slice(0, 15)
                .map(t => (
                <div key={t.id} className="border-b border-slate-100 pb-3 last:border-0 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-sm">{t.order}</span>
                    <span className="text-xs font-bold text-slate-500">{t.witel} - {t.sto}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-slate-700 font-bold">Teknisi: <span className="text-blue-700">{t.technicianName}</span></p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(t.trackerStatus)}`}>
                      {t.trackerStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{t.customerName}</p>
                </div>
              ))}
              {displayedActiveTasks.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">Belum ada pekerjaan yang sesuai filter.</p>
              )}
           </div>
        </div>
      </div>

      <DataTable data={filteredTasks} />
    </div>
  );
}
