import { Link } from "react-router-dom";
import { Users, LayoutDashboard, Upload } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Selamat Datang di EBIS Tracker</h1>
        <p className="text-xl text-slate-500">Pilih peran Anda untuk melanjutkan ke dashboard yang sesuai.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Link to="/technician" className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Teknisi</h2>
          <p className="text-slate-500 text-center text-sm">Ambil tugas, update progress, dan beri catatan untuk setiap order.</p>
        </Link>

        <Link to="/manager" className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-purple-200 transition-all">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Dashboard</h2>
          <p className="text-slate-500 text-center text-sm">Pantau dashboard progress, cek status tugas, dan performa harian.</p>
        </Link>
        
        <Link to="/import" className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-green-200 transition-all">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Import Data</h2>
          <p className="text-slate-500 text-center text-sm">Upload file JSON dari EBIS Web utama untuk disinkronisasi.</p>
        </Link>
      </div>
    </div>
  );
}
