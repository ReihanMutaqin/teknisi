import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { LayoutDashboard, Users, Upload, Home, Menu, X } from "lucide-react";
import { useState } from "react";
import HomePage from "./pages/HomePage";
import TechnicianView from "./pages/TechnicianView";
import ManagerDashboard from "./pages/ManagerDashboard";
import ImportPage from "./pages/ImportPage";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                  <span className="font-bold text-xl text-slate-800">EBIS Tracker</span>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300">
                    <Home className="w-4 h-4 mr-2" /> Home
                  </Link>
                  <Link to="/technician" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300">
                    <Users className="w-4 h-4 mr-2" /> Teknisi
                  </Link>
                  <Link to="/manager" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </Link>
                  <Link to="/import" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300">
                    <Upload className="w-4 h-4 mr-2" /> Import
                  </Link>
                </div>
              </div>
              <div className="flex items-center sm:hidden">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-slate-200 bg-white">
              <div className="pt-2 pb-3 space-y-1">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                  <div className="flex items-center"><Home className="w-5 h-5 mr-3 text-slate-400" /> Home</div>
                </Link>
                <Link to="/technician" onClick={() => setMobileMenuOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                  <div className="flex items-center"><Users className="w-5 h-5 mr-3 text-slate-400" /> Teknisi</div>
                </Link>
                <Link to="/manager" onClick={() => setMobileMenuOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                  <div className="flex items-center"><LayoutDashboard className="w-5 h-5 mr-3 text-slate-400" /> Dashboard</div>
                </Link>
                <Link to="/import" onClick={() => setMobileMenuOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                  <div className="flex items-center"><Upload className="w-5 h-5 mr-3 text-slate-400" /> Import</div>
                </Link>
              </div>
            </div>
          )}
        </header>
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/technician" element={<TechnicianView />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/import" element={<ImportPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
