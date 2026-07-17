import { useState, useEffect, useMemo } from "react";
import { getAllTasks } from "../lib/db";
import type { TaskData } from "../lib/db";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';
import { Loader2, Download, Briefcase, Users, AlertTriangle, CheckCircle, Clock, Activity, Calendar as CalendarIcon, MapPin, X } from "lucide-react";
import { DataTable } from "../components/DataTable";
import * as XLSX from 'xlsx';
import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

const COLORS = {
  'Completed': '#10b981', // green
  'On Progress': '#3b82f6', // blue
  'Kendala': '#f59e0b', // amber
  'Cancel': '#ef4444', // red
  'Pending': '#94a3b8' // slate
};

const SERVICE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#14b8a6', '#0ea5e9'];

const formatMonth = (yyyyMm: string) => {
  const [year, month] = yyyyMm.split('-');
  if (!year || !month) return yyyyMm;
  const mNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const mIdx = parseInt(month, 10) - 1;
  return mIdx >= 0 && mIdx < 12 ? `${mNames[mIdx]} ${year}` : yyyyMm;
};

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWitel, setSelectedWitel] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("ALL");
  
  // Operational Insights filters
  const [activityFilterSto, setActivityFilterSto] = useState<string>("ALL");
  const [activityFilterStatus, setActivityFilterStatus] = useState<string>("ALL");

  // Modal State
  const [modalData, setModalData] = useState<TaskData[] | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");

  useEffect(() => {
    async function fetchTasks() {
      const all = await getAllTasks();
      setTasks(all);
      setLoading(false);
    }
    fetchTasks();
  }, []);

  const witels = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.witel))).filter(Boolean).sort();
  }, [tasks]);

  const dates = useMemo(() => {
    return Array.from(new Set(tasks.map(t => {
      const parts = (t.orderDate || '').split(' ')[0].split('-');
      if (parts.length >= 2) return `${parts[0]}-${parts[1]}`;
      return '';
    }))).filter(Boolean).sort().reverse();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (selectedWitel !== "ALL") {
      result = result.filter(t => t.witel === selectedWitel);
    }
    if (selectedDate !== "ALL") {
      result = result.filter(t => {
        const parts = (t.orderDate || '').split(' ')[0].split('-');
        const m = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : '';
        return m === selectedDate;
      });
    }
    return result;
  }, [tasks, selectedWitel, selectedDate]);

  // KPIs
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.trackerStatus === 'Completed').length;
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0.0';
  const totalKendala = filteredTasks.filter(t => t.trackerStatus === 'Kendala').length;
  const activeTechnicians = useMemo(() => {
    const active = filteredTasks.filter(t => t.technicianName && ['On Progress', 'Kendala'].includes(t.trackerStatus));
    return new Set(active.map(t => t.technicianName)).size;
  }, [filteredTasks]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      'Completed': 0, 'On Progress': 0, 'Kendala': 0, 'Pending': 0, 'Cancel': 0
    };
    filteredTasks.forEach(t => {
      counts[t.trackerStatus] = (counts[t.trackerStatus] || 0) + 1;
    });
    return counts;
  }, [filteredTasks]);

  const pieData = Object.entries(stats)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const serviceTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTasks.forEach(t => {
      const st = t.serviceType || 'Unknown';
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTasks]);

  const trendData = useMemo(() => {
    const countsByDate: Record<string, { date: string, Total: number, Completed: number }> = {};
    filteredTasks.forEach(t => {
      const dateStr = (t.orderDate || '').split(' ')[0];
      if (!dateStr) return;
      if (!countsByDate[dateStr]) {
        countsByDate[dateStr] = { date: dateStr, Total: 0, Completed: 0 };
      }
      countsByDate[dateStr].Total += 1;
      if (t.trackerStatus === 'Completed') {
        countsByDate[dateStr].Completed += 1;
      }
    });
    return Object.values(countsByDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTasks]);

  const witelData = useMemo(() => {
    if (selectedWitel !== "ALL") return [];
    const grouped: Record<string, any> = {};
    tasks.forEach(t => {
      if (!grouped[t.witel]) {
        grouped[t.witel] = { witel: t.witel, Completed: 0, 'On Progress': 0, Kendala: 0, Cancel: 0, Pending: 0, total: 0 };
      }
      grouped[t.witel][t.trackerStatus] += 1;
      grouped[t.witel].total += 1;
    });
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [tasks, selectedWitel]);

  const stoData = useMemo(() => {
    if (selectedWitel === "ALL") return [];
    const grouped: Record<string, any> = {};
    filteredTasks.forEach(t => {
      const stoName = t.sto || 'UNKNOWN';
      if (!grouped[stoName]) {
        grouped[stoName] = { sto: stoName, Completed: 0, 'On Progress': 0, Kendala: 0, Cancel: 0, Pending: 0, total: 0 };
      }
      grouped[stoName][t.trackerStatus] += 1;
      grouped[stoName].total += 1;
    });
    return Object.values(grouped).sort((a, b) => b.total - a.total).slice(0, 15); // limit top 15
  }, [filteredTasks, selectedWitel]);

  // Operational Insights
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

  const exportToExcel = () => {
    if (filteredTasks.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    
    const exportData = filteredTasks.map(t => ({
      'Order ID': t.order,
      'Witel': t.witel,
      'STO': t.sto,
      'Customer Name': t.customerName,
      'Address': t.address,
      'Service Type': t.serviceType,
      'Internet': t.internet,
      'Order Date': t.orderDate,
      'Technician': t.technicianName || '-',
      'Status': t.trackerStatus,
      'Status Message': t.statusMessage || '-',
      'Notes': t.notes || '-',
      'Last Update': format(new Date(t.updatedAt), "dd MMM yyyy HH:mm", { locale: id })
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    
    const fileName = `EBIS_Tasks_${selectedWitel}_${selectedDate}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'On Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Kendala': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Cancel': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const openModal = (title: string, data: TaskData[]) => {
    setModalTitle(title);
    setModalData(data);
  };

  const closeModal = () => {
    setModalData(null);
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium animate-pulse">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header & Global Filters */}
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sticky top-16 z-30 transition-all hover:shadow-md">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
            Manager Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Ringkasan performa dan aktivitas teknisi</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center bg-slate-50 rounded-xl p-1.5 border border-slate-200 flex-1 lg:flex-none">
            <CalendarIcon className="w-4 h-4 text-slate-400 ml-2 mr-1" />
            <select 
              className="bg-transparent text-slate-700 rounded-lg p-1.5 focus:ring-0 outline-none text-sm font-semibold w-full cursor-pointer"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="ALL">Semua Periode</option>
              {dates.map(d => (
                <option key={d} value={d}>{formatMonth(d)}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center bg-slate-50 rounded-xl p-1.5 border border-slate-200 flex-1 lg:flex-none">
            <MapPin className="w-4 h-4 text-slate-400 ml-2 mr-1" />
            <select 
              className="bg-transparent text-slate-700 rounded-lg p-1.5 focus:ring-0 outline-none text-sm font-semibold w-full cursor-pointer"
              value={selectedWitel}
              onChange={(e) => setSelectedWitel(e.target.value)}
            >
              <option value="ALL">Semua WITEL</option>
              {witels.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 w-full lg:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => openModal('Total Pekerjaan', filteredTasks)}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all group overflow-hidden relative cursor-pointer"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Pekerjaan</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{totalTasks}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => openModal('Pekerjaan Selesai', filteredTasks.filter(t => t.trackerStatus === 'Completed'))}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-emerald-300 transition-all group overflow-hidden relative cursor-pointer"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completion Rate</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-black text-emerald-600">{completionRate}%</h3>
                <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {completedTasks} done
                </span>
              </div>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => openModal('Total Kendala', filteredTasks.filter(t => t.trackerStatus === 'Kendala'))}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-amber-300 transition-all group overflow-hidden relative cursor-pointer"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Kendala</p>
              <h3 className="text-3xl font-black text-amber-600 mt-2">{totalKendala}</h3>
            </div>
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => {
            const active = filteredTasks.filter(t => t.technicianName && ['On Progress', 'Kendala'].includes(t.trackerStatus));
            openModal('Aktivitas Teknisi', active);
          }}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition-all group overflow-hidden relative cursor-pointer"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Teknisi Aktif</p>
              <h3 className="text-3xl font-black text-indigo-600 mt-2">{activeTechnicians}</h3>
            </div>
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all h-[420px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Tren Pekerjaan
          </h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  tickFormatter={(val) => {
                    const d = parseISO(val);
                    return isValid(d) ? format(d, 'dd MMM') : val;
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(val) => {
                    const d = parseISO(val as string);
                    return isValid(d) ? format(d, 'dd MMMM yyyy', { locale: id }) : val;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Total" stroke="#94a3b8" strokeWidth={3} dot={{ cursor: 'pointer', r: 4 }} activeDot={{ r: 6, cursor: 'pointer' }} onClick={(data: any) => {
                  if (data && data.payload && data.payload.date) {
                    openModal(`Total Pekerjaan Tanggal ${data.payload.date}`, filteredTasks.filter(t => (t.orderDate || '').startsWith(data.payload.date)));
                  }
                }} />
                <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={3} dot={{ cursor: 'pointer', r: 4 }} activeDot={{ r: 6, cursor: 'pointer' }} onClick={(data: any) => {
                  if (data && data.payload && data.payload.date) {
                    openModal(`Pekerjaan Selesai Tanggal ${data.payload.date}`, filteredTasks.filter(t => (t.orderDate || '').startsWith(data.payload.date) && t.trackerStatus === 'Completed'));
                  }
                }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all h-[420px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-500" /> Distribusi Status
          </h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={(props: any) => {
                    const { name, percent } = props;
                    return (percent && percent > 0) ? `${name} ${(percent * 100).toFixed(0)}%` : '';
                  }}
                  labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  onClick={(data: any) => {
                    if (data && data.name) {
                      openModal(`Pekerjaan Status: ${data.name}`, filteredTasks.filter(t => t.trackerStatus === data.name));
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {selectedWitel === "ALL" && witelData.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all h-[420px] lg:col-span-2 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" /> Performa Tiap WITEL
            </h2>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={witelData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="witel" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar 
                    dataKey="Completed" stackId="a" fill={COLORS['Completed']} radius={[0, 0, 4, 4]} maxBarSize={60} 
                    style={{ cursor: 'pointer' }}
                    onClick={(data: any) => openModal(`WITEL ${data.witel} - Selesai`, filteredTasks.filter(t => t.witel === data.witel && t.trackerStatus === 'Completed'))}
                  />
                  <Bar 
                    dataKey="On Progress" stackId="a" fill={COLORS['On Progress']} maxBarSize={60} 
                    style={{ cursor: 'pointer' }}
                    onClick={(data: any) => openModal(`WITEL ${data.witel} - On Progress`, filteredTasks.filter(t => t.witel === data.witel && t.trackerStatus === 'On Progress'))}
                  />
                  <Bar 
                    dataKey="Kendala" stackId="a" fill={COLORS['Kendala']} radius={[4, 4, 0, 0]} maxBarSize={60} 
                    style={{ cursor: 'pointer' }}
                    onClick={(data: any) => openModal(`WITEL ${data.witel} - Kendala`, filteredTasks.filter(t => t.witel === data.witel && t.trackerStatus === 'Kendala'))}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {selectedWitel !== "ALL" && stoData.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all h-[420px] lg:col-span-2 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" /> Performa STO Tertinggi ({selectedWitel})
            </h2>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stoData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="sto" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar 
                    dataKey="Completed" stackId="a" fill={COLORS['Completed']} radius={[0, 0, 4, 4]} maxBarSize={50} 
                    style={{ cursor: 'pointer' }}
                    onClick={(data: any) => openModal(`STO ${data.sto} - Selesai`, filteredTasks.filter(t => t.sto === data.sto && t.trackerStatus === 'Completed'))}
                  />
                  <Bar 
                    dataKey="On Progress" stackId="a" fill={COLORS['On Progress']} maxBarSize={50} 
                    style={{ cursor: 'pointer' }}
                    onClick={(data: any) => openModal(`STO ${data.sto} - On Progress`, filteredTasks.filter(t => t.sto === data.sto && t.trackerStatus === 'On Progress'))}
                  />
                  <Bar 
                    dataKey="Kendala" stackId="a" fill={COLORS['Kendala']} radius={[4, 4, 0, 0]} maxBarSize={50} 
                    style={{ cursor: 'pointer' }}
                    onClick={(data: any) => openModal(`STO ${data.sto} - Kendala`, filteredTasks.filter(t => t.sto === data.sto && t.trackerStatus === 'Kendala'))}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all h-[420px] lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-pink-500" /> Distribusi Jenis Layanan
          </h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceTypeData.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{fontSize: 11, fill: '#475569'}} axisLine={false} tickLine={false} width={150} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar 
                  dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}
                  onClick={(data: any) => {
                    if (data && data.name) {
                      openModal(`Layanan: ${data.name}`, filteredTasks.filter(t => t.serviceType === data.name || (!t.serviceType && data.name === 'Unknown')));
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {serviceTypeData.slice(0, 10).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Operational Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 flex flex-col h-[500px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
          <div className="p-5 border-b border-amber-100 bg-amber-50/30">
            <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Catatan Kendala Terbaru
            </h2>
          </div>
          <div className="p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
            {filteredTasks
              .filter(t => t.trackerStatus === 'Kendala' && t.notes)
              .slice(0, 15)
              .map(t => (
              <div key={t.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer" onClick={() => openModal(`Detail Kendala: ${t.order}`, [t])}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">{t.order}</span>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {t.witel} - {t.sto}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {format(new Date(t.updatedAt), 'dd/MM HH:mm')}
                  </span>
                </div>
                <div className="pl-2">
                  <p className="text-xs text-slate-600 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> {t.technicianName}
                  </p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed italic">
                    "{t.notes}"
                  </p>
                </div>
              </div>
            ))}
            {filteredTasks.filter(t => t.trackerStatus === 'Kendala' && t.notes).length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <CheckCircle className="w-12 h-12 mb-3 text-emerald-200" />
                <p className="text-sm font-medium">Bagus! Tidak ada laporan kendala saat ini.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-blue-200 flex flex-col h-[500px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
          <div className="p-5 border-b border-blue-100 bg-blue-50/30">
            <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" /> Aktivitas Teknisi Lapangan
            </h2>
            <div className="flex gap-3">
              <div className="flex-1 bg-white rounded-xl border border-slate-200 px-3 py-2 flex items-center shadow-sm">
                <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                <select 
                  className="bg-transparent text-slate-700 w-full outline-none text-sm font-semibold cursor-pointer"
                  value={activityFilterSto}
                  onChange={(e) => setActivityFilterSto(e.target.value)}
                >
                  <option value="ALL">Semua STO</option>
                  {uniqueActivityStos.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1 bg-white rounded-xl border border-slate-200 px-3 py-2 flex items-center shadow-sm">
                <Activity className="w-4 h-4 text-slate-400 mr-2" />
                <select 
                  className="bg-transparent text-slate-700 w-full outline-none text-sm font-semibold cursor-pointer"
                  value={activityFilterStatus}
                  onChange={(e) => setActivityFilterStatus(e.target.value)}
                >
                  <option value="ALL">Semua Status</option>
                  {uniqueActivityStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
            {displayedActiveTasks
              .slice(0, 15)
              .map(t => (
              <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group hover:border-blue-200 cursor-pointer" onClick={() => openModal(`Detail Pekerjaan: ${t.order}`, [t])}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-sm">{t.order}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(t.trackerStatus)}`}>
                    {t.trackerStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                    {t.technicianName ? t.technicianName.substring(0, 2).toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800 font-semibold truncate">{t.technicianName}</p>
                    <p className="text-xs text-slate-500 truncate">{t.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    {t.witel} - {t.sto}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                    <Clock className="w-3 h-3" /> {format(new Date(t.updatedAt), 'HH:mm')}
                  </span>
                </div>
              </div>
            ))}
            {displayedActiveTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <Activity className="w-12 h-12 mb-3 text-slate-200" />
                <p className="text-sm font-medium">Belum ada pekerjaan yang sesuai filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Data Table */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
           <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <Briefcase className="w-5 h-5 text-indigo-500" /> Detail Data Keseluruhan
           </h2>
        </div>
        <DataTable data={filteredTasks} />
      </div>

      {/* Pop-up Modal Detail */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col h-[85vh] transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white rounded-t-2xl z-10 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{modalTitle}</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Menampilkan {modalData.length} baris data
                </p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors self-start"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-50 rounded-b-2xl flex flex-col p-2">
              <div className="overflow-auto custom-scrollbar flex-1 bg-white rounded-xl shadow-sm border border-slate-100">
                <DataTable data={modalData} />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
