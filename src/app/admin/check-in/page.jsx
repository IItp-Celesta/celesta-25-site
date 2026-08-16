"use client";
import { useState } from "react";
import { Search, Image as ImageIcon, X, AlertCircle } from "lucide-react";

export default function AdminCheckIn() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal State for Image Viewing
  const [selectedImage, setSelectedImage] = useState(null);

  // Routes the click based on the URL type
  const handleViewDocument = (url) => {
    if (url.includes("drive.google.com")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      setSelectedImage(url);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/registrations", {
        headers: { Authorization: `Bearer ${password}` },
      });

      if (res.ok) {
        const json = await res.json();
        setAttendees(json.data);
        setIsAuthenticated(true);
      } else {
        alert("Invalid Admin Password");
      }
    } catch (error) {
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  // Filter attendees based on search
  const filteredAttendees = attendees.filter((a) => {
    const query = searchQuery.toLowerCase();
    return (
      a.name?.toLowerCase().includes(query) ||
      a.registrationId?.toLowerCase().includes(query) ||
      a.rollNumber?.toLowerCase().includes(query)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 pt-24">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Desk Check-In Portal</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none mb-4 focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all"
          >
            {loading ? "Verifying..." : "Access Portal"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 pt-28 md:p-8 md:pt-32">
      <div className="max-w-6xl mx-auto">

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Live Event Check-In</h1>
            <p className="text-slate-400 font-medium">Total Registrations: <span className="text-cyan-400">{attendees.length}</span></p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search Name, Reg ID, or Roll No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-white focus:border-cyan-500 outline-none shadow-sm"
            />
          </div>
        </div>

        {/* LIST VIEW */}
        <div className="flex flex-col gap-3">
          {filteredAttendees.map((user) => {
            // Add fallbacks to support older test data in Firebase
            const feeUrl = user.workshopScreenshotUrl || user.screenshotUrl;
            const bedUrl = user.accommodationScreenshotUrl;
            const idUrl = user.aadhaarUrl;

            return (
              <div 
                key={user.registrationId} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-cyan-800/60 transition-colors flex flex-col md:flex-row md:items-center gap-4 shadow-sm"
              >
                {/* Column 1: Identity */}
                <div className="flex-[1.5] min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-white truncate">{user.name}</h3>
                    {user.isIITP ? (
                      <span className="bg-blue-900/40 text-blue-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-blue-800 shrink-0">
                        IITP: {user.rollNumber}
                      </span>
                    ) : (
                      <span className="bg-purple-900/40 text-purple-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-purple-800 shrink-0">
                        External
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-mono text-cyan-500">{user.registrationId}</span>
                </div>

                {/* Column 2: Details */}
                <div className="flex-[2] flex flex-row flex-wrap md:flex-nowrap gap-4 md:gap-8 text-sm border-t border-slate-800 md:border-none pt-3 md:pt-0">
                  <div className="min-w-[120px]">
                    <span className="block text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">Track</span>
                    <span className="text-slate-200 font-medium">{user.workshop}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">Housing</span>
                    <span className={`font-medium ${user.requireAccommodation ? "text-amber-400" : "text-slate-300"}`}>
                      {user.requireAccommodation ? "Requested" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">Paid</span>
                    <span className="text-emerald-400 font-bold">₹ {user.amountPaid || 0}</span>
                  </div>
                </div>

                {/* Column 3: Secure Document Viewers */}
                <div className="flex-1 flex flex-wrap md:justify-end gap-2 pt-2 md:pt-0">
                  {feeUrl && feeUrl !== "NOT_REQUIRED" && (
                    <button onClick={() => handleViewDocument(feeUrl)} className="text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg text-slate-200 transition-colors">
                      <ImageIcon size={14} className="text-cyan-400" /> Fee
                    </button>
                  )}
                  {bedUrl && bedUrl !== "NOT_REQUIRED" && (
                    <button onClick={() => handleViewDocument(bedUrl)} className="text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg text-amber-100 transition-colors">
                      <ImageIcon size={14} className="text-amber-400" /> Bed
                    </button>
                  )}
                  {idUrl && idUrl !== "NOT_REQUIRED" && (
                    <button onClick={() => handleViewDocument(idUrl)} className="text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg text-pink-100 transition-colors">
                      <ImageIcon size={14} className="text-pink-400" /> ID
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAttendees.length === 0 && !loading && (
          <div className="text-center py-24 bg-slate-900/50 rounded-2xl border border-slate-800/50 mt-4 flex flex-col items-center">
            <AlertCircle size={48} className="mb-4 text-slate-600" />
            <p className="text-slate-400 text-lg">No attendees found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Secure Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white hover:text-red-400 transition-colors p-3 bg-slate-800/80 hover:bg-slate-800 rounded-full border border-slate-700 shadow-xl"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Secure Document" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-slate-800"
          />
        </div>
      )}
    </div>
  );
}