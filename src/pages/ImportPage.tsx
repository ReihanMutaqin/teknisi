import { useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
import { importDataToFirestore } from "../lib/db";

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // Reset input to allow re-selecting the same file

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoading(true);
        setStatus('idle');

        // Verify with ReCAPTCHA
        if (typeof window !== 'undefined' && (window as any).grecaptcha) {
          await new Promise<void>((resolve, reject) => {
            (window as any).grecaptcha.enterprise.ready(async () => {
              try {
                const token = await (window as any).grecaptcha.enterprise.execute('6LdEbFYtAAAAAIFtE1kERXJu-U3tYAZEv2l2Qmwf', {action: 'upload_json'});
                console.log("ReCAPTCHA Token:", token);
                // Here you would normally send the token to your backend (which uses the Secret Key) to get the assessment score.
                resolve();
              } catch (e) {
                console.error("ReCAPTCHA Error:", e);
                reject(new Error("Gagal memverifikasi reCAPTCHA. Coba lagi."));
              }
            });
          });
        }

        const content = event.target?.result as string;
        const dataList = JSON.parse(content);
        
        if (!Array.isArray(dataList)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const result = await importDataToFirestore(dataList);
        setStatus('success');
        setMessage(`Berhasil! Database telah diperbarui. (${result.added} data baru ditambahkan, ${result.duplicates} data lama diperbarui).`);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || "Gagal memproses file.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 mt-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Import Data dari Web EBIS</h2>
        
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          <div className="flex flex-col items-center">
            <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-lg font-medium text-slate-700">Klik atau drag file JSON ke sini</p>
            <p className="text-sm text-slate-500 mt-2">Gunakan file export (.json) dari aplikasi EBIS Web</p>
          </div>
        </div>

        {loading && (
          <div className="mt-6 flex items-center gap-3 text-blue-600 bg-blue-50 p-4 rounded-lg">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Sedang memproses dan menyimpan ke database...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium">{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
