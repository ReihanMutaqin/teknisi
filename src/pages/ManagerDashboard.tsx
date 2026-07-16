import { useState, useEffect, useMemo } from "react";
import { getAllTasks } from "../lib/db";
import type { TaskData } from "../lib/db";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2 } from "lucide-react";

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

  const filteredTasks = useMemo(() => {
    if (selectedWitel === "ALL") return tasks;
    return tasks.filter(t => t.witel === selectedWitel);
  }, [tasks, selectedWitel]);

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

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Filter Area:</span>
          <select 
            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm font-semibold"
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
      </div>
    </div>
  );
}
