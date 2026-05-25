import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  RefreshCcw, 
  FileText, 
  ExternalLink, 
  ChevronRight, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "./AdminTypes";
import { Button } from "@/components/ui/button";

interface Ticket {
  id: string;
  ticket_id: string;
  customer_name: string;
  email: string;
  phone: string;
  order_number?: string;
  category: string;
  description: string;
  attachment_url?: string;
  status: string;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

const GrievancesTab = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Resolution Form States
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/admin/grievances");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        
        // Update selected ticket details if it is currently open
        if (selectedTicket) {
          const updated = data.find((t: Ticket) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      } else {
        toast.error("Failed to load grievance tickets.");
      }
    } catch (err) {
      toast.error("Network error loading grievances.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!resolutionNotes.trim()) {
      toast.error("Please enter official resolution notes.");
      return;
    }

    setIsResolving(true);
    try {
      const res = await apiFetch(`/api/admin/grievances/${selectedTicket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          resolution_notes: resolutionNotes.trim(),
        }),
      });

      if (res.ok) {
        toast.success(`Ticket ${selectedTicket.ticket_id} resolved!`);
        setResolutionNotes("");
        await fetchTickets(); // Refresh list and details
      } else {
        toast.error("Failed to submit ticket resolution.");
      }
    } catch (err) {
      toast.error("Network error resolving ticket.");
    } finally {
      setIsResolving(false);
    }
  };

  // Filter Logic
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "resolved" && t.status === "resolved") || 
      (statusFilter === "pending" && t.status !== "resolved");

    const matchesCategory = 
      categoryFilter === "all" || 
      t.category === categoryFilter;

    return matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(tickets.map(t => t.category)));

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white mb-1">Grievance Resolution Center</h2>
          <p className="text-sm text-neutral-500">Legal SLA Tracker: Settle customer disputes, log investigation notes, and trigger resolution emails.</p>
        </div>
        <button 
          onClick={fetchTickets} 
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Quick metrics panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141414] border border-neutral-800 p-4 rounded-2xl flex items-center justify-between shadow-inner">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Total Complaints</span>
            <h3 className="text-2xl font-bold font-display text-white">{tickets.length}</h3>
          </div>
          <ShieldAlert className="h-5 w-5 text-neutral-600" />
        </div>
        <div className="bg-[#141414] border border-neutral-800 p-4 rounded-2xl flex items-center justify-between shadow-inner">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Pending SLA Review</span>
            <h3 className="text-2xl font-bold font-display text-amber-400">
              {tickets.filter(t => t.status !== 'resolved').length}
            </h3>
          </div>
          <Clock className="h-5 w-5 text-amber-500/80" />
        </div>
        <div className="bg-[#141414] border border-neutral-800 p-4 rounded-2xl flex items-center justify-between shadow-inner">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-green-500 tracking-wider">Resolved Tickets</span>
            <h3 className="text-2xl font-bold font-display text-green-400">
              {tickets.filter(t => t.status === 'resolved').length}
            </h3>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-500/80" />
        </div>
      </div>

      {/* Grid Layout: Left sidebar ticket list, Right details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Filters & Tickets list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#141414] border border-neutral-800 p-4 rounded-2xl space-y-3">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active Filters</h4>
            <div className="space-y-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full h-9 bg-black border border-neutral-800 rounded-lg px-3 text-xs text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Audit</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full h-9 bg-black border border-neutral-800 rounded-lg px-3 text-xs text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Ticket Listing */}
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
            {isLoading ? (
              <div className="text-center py-10 text-neutral-500 text-xs uppercase tracking-wider animate-pulse">Syncing Ticket Logs...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12 bg-[#141414]/30 border border-dashed border-neutral-800 rounded-2xl text-neutral-500 text-xs italic">No matching grievances.</div>
            ) : (
              filteredTickets.map(t => {
                const isSelected = selectedTicket?.id === t.id;
                const isPending = t.status !== 'resolved';
                
                return (
                  <div
                    key={t.id}
                    onClick={() => { setSelectedTicket(t); setResolutionNotes(""); }}
                    className={`border p-4 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-neutral-900 border-amber-500/40 shadow-md' 
                        : 'bg-[#141414] border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-amber-500">{t.ticket_id}</span>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        !isPending ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {!isPending ? 'resolved' : 'pending'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1 truncate">{t.customer_name}</h4>
                    <p className="text-[10px] text-neutral-500 font-medium mb-2">{t.category}</p>
                    <p className="text-[10px] text-neutral-400 line-clamp-2 italic">"{t.description}"</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/30">
                      <span className="text-[9px] text-neutral-500">{new Date(t.created_at).toLocaleDateString('en-IN')}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket Audit / Detailed Viewer */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              
              {/* Detailed Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800/60 pb-4 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-amber-500">{selectedTicket.ticket_id}</span>
                    <span className="text-[10px] bg-neutral-800 border border-neutral-700/50 px-2 py-0.5 rounded text-neutral-400 font-semibold">{selectedTicket.category}</span>
                  </div>
                  <p className="text-xs text-neutral-500">Lodge Date: {new Date(selectedTicket.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                    selectedTicket.status === 'resolved' 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Customer Core Profile Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 border border-neutral-900 p-4 rounded-xl text-xs text-neutral-300">
                <div className="space-y-2">
                  <p><span className="text-neutral-500 uppercase font-bold tracking-wider mr-2">Client Name:</span> <span className="text-white font-medium">{selectedTicket.customer_name}</span></p>
                  <p><span className="text-neutral-500 uppercase font-bold tracking-wider mr-2">Email ID:</span> <a href={`mailto:${selectedTicket.email}`} className="text-amber-500/80 hover:text-amber-400 underline font-mono">{selectedTicket.email}</a></p>
                  <p><span className="text-neutral-500 uppercase font-bold tracking-wider mr-2">Mobile No:</span> <span className="font-mono">{selectedTicket.phone}</span></p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="text-neutral-500 uppercase font-bold tracking-wider mr-2">Order Ref:</span> 
                    {selectedTicket.order_number ? (
                      <span className="font-mono text-white font-medium bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        {selectedTicket.order_number}
                      </span>
                    ) : (
                      <span className="text-neutral-500 italic">None Provided</span>
                    )}
                  </p>
                  {selectedTicket.attachment_url && (
                    <p>
                      <span className="text-neutral-500 uppercase font-bold tracking-wider mr-2">Evidence:</span>
                      <a 
                        href={selectedTicket.attachment_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-amber-500 hover:text-amber-400 font-bold underline inline-flex items-center gap-1 uppercase tracking-wider font-mono text-[10px]"
                      >
                        <FileText className="h-3 w-3" /> View Attachment <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Customer Complaint Statement */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Customer Grievance Statement</label>
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 italic text-sm text-neutral-300 leading-relaxed font-body">
                  "{selectedTicket.description}"
                </div>
              </div>

              {/* Resolution Modals / Notes display */}
              {selectedTicket.status === 'resolved' ? (
                /* Display resolution summary once resolved */
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 space-y-3 shadow-[0_0_12px_rgba(16,185,129,0.02)]">
                  <div className="flex items-center justify-between border-b border-green-500/20 pb-2">
                    <h5 className="text-xs uppercase font-bold text-green-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Official Resolution Declared
                    </h5>
                    <span className="text-[10px] text-neutral-500 font-mono">{selectedTicket.resolved_at ? new Date(selectedTicket.resolved_at).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                  <p className="text-sm text-neutral-200 leading-relaxed font-body italic">
                    "{selectedTicket.resolution_notes}"
                  </p>
                </div>
              ) : (
                /* Render resolution lodging form for pending cases */
                <form onSubmit={handleResolveSubmit} className="space-y-4 pt-4 border-t border-neutral-800/50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Declare Grievance Mitigation / Resolution Notes</label>
                    <p className="text-[10px] text-neutral-500 italic mt-0.5">Logging notes will automatically mark this ticket as 'Resolved' and email the official resolution statements directly to **{selectedTicket.email}**.</p>
                    <textarea
                      required
                      rows={4}
                      value={resolutionNotes}
                      onChange={e => setResolutionNotes(e.target.value)}
                      placeholder="Write the official action taken to resolve this customer grievance (e.g. tracking links, refund txn reference, NABL check confirmation)."
                      className="w-full bg-[#0d0d0d] border border-neutral-700 rounded-xl p-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isResolving}
                    className="w-full h-11 bg-green-500 hover:bg-green-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="h-4 w-4" /> {isResolving ? "Filing Resolution..." : "Mark Grievance as Resolved"}
                  </Button>
                </form>
              )}

            </div>
          ) : (
            <div className="h-[60vh] rounded-2xl border border-dashed border-neutral-800 flex flex-col items-center justify-center text-center p-6 bg-neutral-900/5">
              <MessageSquare className="h-10 w-10 text-neutral-700 mb-4" />
              <p className="font-display font-medium text-neutral-400 text-sm">Grievance Ticket Auditor</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">Select any lodged grievance ticket from the side-list to inspect full details, NABL/evidence files, and issue official resolution updates.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default GrievancesTab;
