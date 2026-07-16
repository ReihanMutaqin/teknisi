import { useState, useMemo, useRef, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { TaskData } from "../lib/db";
import { Filter, X, Download } from "lucide-react";

interface DataTableProps {
  data: TaskData[];
}

type ColumnKey = 'witel' | 'sto' | 'orderDate' | 'unit' | 'paket' | 'order' | 'internet' | 'customerName' | 'address' | 'trackerStatus' | 'statusMessage';

const COLUMNS: { key: ColumnKey, label: string }[] = [
  { key: 'witel', label: 'WITEL' },
  { key: 'sto', label: 'STO' },
  { key: 'orderDate', label: 'LAST UPDATE STATUS' },
  { key: 'unit', label: 'UNIT' },
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
  if (key === 'orderDate') {
    return val.split(' ')[0];
  }
  if (key === 'statusMessage') {
    // Aggressive truncation: split by common delimiters to get the core message
    let clean = val.split(',')[0].split('.')[0].split('-')[0].trim();
    if (clean.length > 25) {
      clean = clean.substring(0, 25).trim() + '...';
    }
    return clean;
  }
  return val;
};

export function DataTable({ data }: DataTableProps) {
  const [filters, setFilters] = useState<Record<ColumnKey, Set<string>>>({} as Record<ColumnKey, Set<string>>);
  const [openFilter, setOpenFilter] = useState<ColumnKey | null>(null);
  const [selectedRow, setSelectedRow] = useState<TaskData | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const [exportStatus, setExportStatus] = useState<string>("ALL");

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

  const handleExport = async () => {
    let toExport = data;
    
    // First, apply current table filters so it respects WITEL, Date, etc. if selected
    toExport = toExport.filter(row => {
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

    // Then apply the specific export status dropdown filter
    if (exportStatus !== "ALL") {
      toExport = toExport.filter(d => d.trackerStatus === exportStatus);
    }
    
    if (toExport.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    const exportCols = [...COLUMNS, { key: 'notes', label: 'CATATAN TEKNISI' }, { key: 'technicianName', label: 'NAMA TEKNISI' }];
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data EBIS');

    // Add Header Row
    const headerRow = worksheet.addRow(exportCols.map(c => c.label));
    
    // Style the header row
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' } // Tailwind blue-800
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add Data Rows
    toExport.forEach(row => {
      const rowData = exportCols.map(col => {
        let val = String((row as any)[col.key] || '');
        if (col.key === 'orderDate') {
          val = val.split(' ')[0];
        }
        return val;
      });
      
      const dataRow = worksheet.addRow(rowData);
      dataRow.eachCell(cell => {
         cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
         };
         cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });

    // Adjust column widths
    worksheet.columns.forEach(column => {
      column.width = 28;
    });

    // Download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `export_${exportStatus === 'ALL' ? 'semua' : exportStatus}_${new Date().getTime()}.xlsx`);
  };

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
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col mt-6 transition-all duration-300">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/80 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Full Detail Order</h2>
          <div className="text-sm text-slate-500 font-medium mt-1">
            Menampilkan {filteredData.length} dari {data.length} data
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="bg-white border border-slate-300 text-slate-700 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
            value={exportStatus}
            onChange={(e) => setExportStatus(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="Completed">Completed</option>
            <option value="Kendala">Kendala</option>
            <option value="On Progress">On Progress</option>
            <option value="Pending">Pending</option>
            <option value="Cancel">Cancel</option>
          </select>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[600px] relative rounded-b-2xl">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-600 bg-slate-100 uppercase sticky top-0 z-20 shadow-sm ring-1 ring-slate-200">
            <tr>
              {COLUMNS.map(col => {
                const uniqueVals = Array.from(new Set(data.map(d => getFilterValue(col.key, String(d[col.key] || ''))))).sort();
                const isActive = filters[col.key] && filters[col.key].size > 0;
                const isOpen = openFilter === col.key;
                
                return (
                  <th key={col.key} className="px-5 py-4 border-b border-slate-200 font-extrabold whitespace-nowrap bg-slate-100/95 backdrop-blur-sm relative">
                    <div 
                      className="flex items-center justify-between gap-3 cursor-pointer hover:text-blue-600 select-none group transition-colors duration-200"
                      onClick={() => setOpenFilter(isOpen ? null : col.key)}
                    >
                      {col.label}
                      <Filter className={`w-4 h-4 transition-transform ${isOpen ? 'text-blue-500 rotate-180' : isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'}`} />
                    </div>
                    
                    {isOpen && (
                      <div ref={filterRef} className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-xl shadow-xl w-64 z-50 normal-case font-normal text-slate-700 ring-1 ring-black/5">
                        <div className="p-2 border-b border-slate-100 flex justify-between gap-2">
                          <button onClick={() => selectAll(col.key, uniqueVals)} className="text-xs text-blue-600 hover:underline">Semua</button>
                          <button onClick={() => clearFilter(col.key)} className="text-xs text-red-600 hover:underline">Clear</button>
                        </div>
                        <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                          {uniqueVals.map(val => {
                            const checked = filters[col.key]?.has(val);
                            const displayVal = val;
                            return (
                              <label key={val} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  checked={checked || false}
                                  onChange={() => toggleFilter(col.key, val)}
                                />
                                <span className="text-xs truncate" title={displayVal}>{displayVal || '(Kosong)'}</span>
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
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredData.length > 0 ? (
              filteredData.map((row, i) => (
                <tr 
                  key={row.id || i} 
                  className="hover:bg-blue-50/60 transition-colors duration-200 cursor-pointer group"
                  onClick={() => setSelectedRow(row)}
                >
                  {COLUMNS.map(col => {
                    let displayVal = String(row[col.key] || '');
                    if (col.key === 'orderDate') {
                      displayVal = displayVal.split(' ')[0]; // Only show YYYY-MM-DD, hide time
                    } else {
                      displayVal = getFilterValue(col.key, displayVal);
                    }
                    return (
                      <td key={col.key} className="px-5 py-4 text-slate-700 font-medium truncate max-w-[220px] group-hover:text-slate-900" title={String(row[col.key] || '')}>
                        {displayVal || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-12 text-center">
                  <div className="text-slate-400 font-medium text-lg">Tidak ada data yang sesuai filter.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Detail Order: {selectedRow.order}</h2>
              <button 
                onClick={() => setSelectedRow(null)}
                className="p-2 bg-white hover:bg-red-500 hover:text-white text-slate-400 rounded-full transition-colors shadow-sm ring-1 ring-slate-200 hover:ring-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/30">
              {COLUMNS.map(col => {
                let val = String(selectedRow[col.key] || '');
                if (col.key === 'orderDate') {
                  val = val.split(' ')[0];
                }
                return (
                  <div key={col.key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{col.label}</span>
                    <span className="block text-sm font-semibold text-slate-800 break-words">
                      {val || '-'}
                    </span>
                  </div>
                );
              })}
              
              <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 shadow-sm md:col-span-2">
                <span className="block text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1">CATATAN TEKNISI</span>
                <span className="block text-sm font-semibold text-red-900 break-words">
                  {selectedRow.notes || 'Tidak ada catatan.'}
                </span>
              </div>
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm md:col-span-2">
                <span className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1">NAMA TEKNISI</span>
                <span className="block text-sm font-semibold text-blue-900 break-words">
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
