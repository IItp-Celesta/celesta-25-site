"use client";
import { useState } from "react";
import { Bed, Users, LayoutList } from "lucide-react";

export default function AdminDashboard() {
  const [exporting, setExporting] = useState(null); 

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const response = await fetch(`/api/admin/export?type=${type}`);
      if (!response.ok) throw new Error("Failed to export data.");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `celesta_${type}_data_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert(error.message);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center gap-8 max-w-md w-full text-center">
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-wide">Data Terminal</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Download isolated datasets for operational teams.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 w-full">
          {/* Hostel Team Button */}
          <button
            onClick={() => handleExport("accom")}
            disabled={exporting !== null}
            className="w-full flex items-center justify-start gap-4 px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 disabled:opacity-50"
          >
            <Bed size={20} className={exporting === "accom" ? "animate-pulse" : ""} />
            {exporting === "accom" ? "Generating..." : "Hostel Sheet (Accom Only)"}
          </button>

          {/* Event Team Button */}
          <button
            onClick={() => handleExport("reg")}
            disabled={exporting !== null}
            className="w-full flex items-center justify-start gap-4 px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            <Users size={20} className={exporting === "reg" ? "animate-pulse" : ""} />
            {exporting === "reg" ? "Generating..." : "Event Sheet (Reg Only)"}
          </button>

          <hr className="border-t border-slate-800 my-2" />

          {/* Master Sheet Button */}
          <button
            onClick={() => handleExport("all")}
            disabled={exporting !== null}
            className="w-full flex items-center justify-start gap-4 px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <LayoutList size={20} className={exporting === "all" ? "animate-pulse" : ""} />
            {exporting === "all" ? "Generating..." : "Master Sheet (Combined)"}
          </button>
        </div>

      </div>
    </div>
  );
}