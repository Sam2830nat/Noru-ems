import React, { useState } from 'react';
import { X, FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any[]; // Expecting array of { department: string, present: number, absent: number, late: number, total: number, rate: string }
  startDate: string;
  endDate: string;
}

export default function ExportReportModal({ isOpen, onClose, reportData, startDate, endDate }: ExportReportModalProps) {
  const [filename, setFilename] = useState('Noru_Attendance_Report');
  const [format, setFormat] = useState<'csv' | 'pdf'>('pdf');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalFilename = `${filename.trim() || 'Report'}_${startDate}_to_${endDate}`;
      
      if (format === 'csv') {
        const headers = ['Department', 'Total Employees', 'Present', 'Absent', 'Late', 'Attendance Rate'];
        const csvContent = [
          headers.join(','),
          ...reportData.map(row => 
            `"${row.department}","${row.total}","${row.present}","${row.absent}","${row.late}","${row.rate}"`
          )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${finalFilename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Noru EMS - Attendance Report', 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);

        const tableColumn = ['Department', 'Total Employees', 'Present', 'Absent', 'Late', 'Attendance Rate'];
        const tableRows = reportData.map(row => [
          row.department, 
          row.total.toString(), 
          row.present.toString(), 
          row.absent.toString(), 
          row.late.toString(), 
          row.rate
        ]);

        autoTable(doc, {
          startY: 40,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
          alternateRowStyles: { fillColor: [248, 250, 252] } // Slate-50
        });

        doc.save(`${finalFilename}.pdf`);
      }
      
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileDown size={20} className="text-indigo-400" /> Export Report
          </h3>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleExport} className="space-y-5">
          <div>
            <label className="label">File Name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. Q3_Attendance"
              value={filename}
              onChange={e => setFilename(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Export Format</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button 
                type="button"
                onClick={() => setFormat('pdf')}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  format === 'pdf' 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                PDF Document
              </button>
              <button 
                type="button"
                onClick={() => setFormat('csv')}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  format === 'csv' 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                CSV Excel
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button 
              type="button"
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 transition-all min-w-[100px] flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FileDown size={16} /> Download</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
