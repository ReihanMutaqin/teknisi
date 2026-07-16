import { useState, useMemo, useRef, useEffect } from "react";
import type { TaskData } from "../lib/db";
import { Filter, X } from "lucide-react";

interface DataTableProps {
  data: TaskData[];
}

type ColumnKey = 'witel' | 'sto' | 'orderDate' | 'segmen' | 'paket' | 'order' | 'internet' | 'customerName' | 'address' | 'trackerStatus' | 'statusMessage';

const COLUMNS: { key: ColumnKey, label: string }[] = [
  { key: 'witel', label: 'WITEL' },
  { key: 'sto', label: 'STO' },
  { key: 'orderDate', label: 'LAST UPDATE STATUS' },
  { key: 'segmen', label: 'SEGMEN' },
  { key: 'paket', label: 'PAKET' },
  { key: 'order', label: 'NO ORDER' },
  { key: 'internet', label: 'NO INTERNET / TELP' },
  { key: 'customerName', label: 'NAMA PELANGGAN' },
  { key: 'address', label: 'ALAMAT' },
  { key: 'trackerStatus', label: 'STATUS' },
  { key: 'statusMessage', label: 'STATUS MESSAGE' },
];

const getFilterValue = (key: ColumnKey, rawVal: string) => {
  if (!rawVal) return '';
  const val = String(rawVal);
  if (key === 'orderDate') return val.split(' ')[0];
  if (key === 'statusMessage') {
    if (val.length > 35) {
      return val.substring(0, 35).trim() + '...';
    }
  }
  return val;
};

export function DataTable({ data }: DataTableProps) {
  const [filters, setFilters] = useState<Record<ColumnKey, Set<string>>>({} as Record<ColumnKey, Set<string>>);
  const [openFilter, setOpenFilter] = useState<ColumnKey | null>(null);
  const [selectedRow, setSelectedRow] = useState<TaskData | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      for (const key of Object.keys(filters) as ColumnKey[]) {
        const activeFilters = filters[key];
        if (activeFilters && activeFilters.size > 0) {
          const val = getFilterValue(key, String(row[key] || ''));
          if (!activeFilters.has(val)) {
            return false;
          }
        }
      }
      return true;
    });
  }, [data, filters]);

  const toggleFilter = (col: ColumnKey, val: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (!newFilters[col]) newFilters[col] = new Set();
      
      const newSet = new Set(newFilters[col]);
      if (newSet.has(val)) {
        newSet.delete(val);
      } else {
        newSet.add(val);
      }
      newFilters[col] = newSet;
      return newFilters;
    });
  };

  const clearFilter = (col: ColumnKey) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      newFilters[col] = new Set();
      return newFilters;
    });
  };

  const selectAll = (col: ColumnKey, uniqueVals: string[]) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      newFilters[col] = new Set(uniqueVals);
      return newFilters;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mt-6">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800">Full Detail Order</h2>
        <div className="text-sm text-slate-500 font-medium">
          Menampilkan {filteredData.length} dari {data.length} data
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[600px] relative">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-600 bg-slate-100 uppercase sticky top-0 z-20 shadow-sm">
            <tr>
              {COLUMNS.map(col => {
                const uniqueVals = Array.from(new Set(data.map(d => getFilterValue(col.key, String(d[col.key] || ''))))).sort();
                const isActive = filters[col.key] && filters[col.key].size > 0;
                const isOpen = openFilter === col.key;
                
                return (
                  <th key={col.key} className="px-4 py-3 border-b border-slate-200 font-bold whitespace-nowrap bg-slate-100 relative">
                    <div 
                      className="flex items-center justify-between gap-2 cursor-pointer hover:text-blue-600 select-none group"
                      onClick={() => setOpenFilter(isOpen ? null : col.key)}
                    >
                      {col.label}
                      <Filter className={`w-3.5 h-3.5 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'}`} />
                    </div>
                    
                    {isOpen && (
                      <div ref={filterRef} className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-xl w-56 z-50 normal-case font-normal text-slate-700">
                        <div className="p-2 border-b border-slate-100 flex justify-between gap-2">
                          <button onClick={() => selectAll(col.key, uniqueVals)} className="text-xs text-blue-600 hover:underline">Semua</button>
                          <button onClick={() => clearFilter(col.key)} className="text-xs text-red-600 hover:underline">Clear</button>
                        </div>
                        <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                          {uniqueVals.map(val => {
                            const checked = filters[col.key]?.has(val);
                            return (
                              <label key={val} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  checked={checked || false}
                                  onChange={() => toggleFilter(col.key, val)}
                                />
                                <span className="text-xs truncate" title={val}>{val || '(Kosong)'}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, i) => (
                <tr 
                  key={row.id || i} 
                  className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRow(row)}
                >
                  {COLUMNS.map(col => {
                    const val = getFilterValue(col.key, String(row[col.key] || ''));
                    return (
                      <td key={col.key} className="px-4 py-3 text-slate-700 truncate max-w-[200px]" title={String(row[col.key] || '')}>
                        {val || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-slate-500">
                  Tidak ada data yang sesuai filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h2 className="text-lg font-bold text-slate-800">Detail Order: {selectedRow.order}</h2>
              <button 
                onClick={() => setSelectedRow(null)}
                className="p-1.5 bg-slate-200 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {COLUMNS.map(col => {
                let val = String(selectedRow[col.key] || '');
                if (col.key === 'orderDate') {
                  val = val.split(' ')[0];
                }
                return (
                  <div key={col.key} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs font-bold text-slate-400 mb-1">{col.label}</span>
                    <span className="block text-sm font-semibold text-slate-800 break-words">
                      {val || '-'}
                    </span>
                  </div>
                );
              })}
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 md:col-span-2">
                <span className="block text-xs font-bold text-slate-400 mb-1">CATATAN TEKNISI</span>
                <span className="block text-sm font-semibold text-slate-800 break-words">
                  {selectedRow.notes || 'Tidak ada catatan.'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 md:col-span-2">
                <span className="block text-xs font-bold text-slate-400 mb-1">NAMA TEKNISI</span>
                <span className="block text-sm font-semibold text-slate-800 break-words">
                  {selectedRow.technicianName || 'Belum diambil.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
