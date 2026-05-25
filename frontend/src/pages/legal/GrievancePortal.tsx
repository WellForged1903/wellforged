import React, { useState } from "react";
import LegalPageLayout from "@/components/LegalPageLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UploadCloud, 
  FileCheck2, 
  FileText 
} from "lucide-react";

interface TicketDetails {
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

const GrievancePortal = () => {
  const [activeTab, setActiveTab] = useState<"lodge" | "track">("lodge");
  
  // Lodge Form States
  const [lodgeForm, setLodgeForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    order_number: "",
    category: "Product Quality",
    description: "",
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLodging, setIsLodging] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<TicketDetails | null>(null);

  // Track Form States
  const [trackForm, setTrackForm] = useState({
    ticket_id: "",
    email: "",
  });
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [trackedTicket, setTrackedTicket] = useState<TicketDetails | null>(null);

  const inputCls = "w-full h-11 bg-background border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all";
  const selectCls = "w-full h-11 bg-background border border-border rounded-xl px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all";
  const textareaCls = "w-full bg-background border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setAttachment(file);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("attachment", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/grievances/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAttachmentUrl(data.url);
        toast.success("Attachment uploaded successfully!");
      } else {
        const err = await res.json();
        throw new Error(err.message || "Failed to upload");
      }
    } catch (err: any) {
      toast.error(err.message || "Error uploading file.");
      setAttachment(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLodgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      toast.warning("Please wait for the attachment to finish uploading.");
      return;
    }

    setIsLodging(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/grievances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lodgeForm,
          attachment_url: attachmentUrl || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedTicket(data.ticket);
        toast.success("Grievance registered officially!");
        setLodgeForm({
          customer_name: "",
          email: "",
          phone: "",
          order_number: "",
          category: "Product Quality",
          description: "",
        });
        setAttachment(null);
        setAttachmentUrl("");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to lodge grievance.");
      }
    } catch (err) {
      toast.error("Network error lodging grievance.");
    } finally {
      setIsLodging(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackForm.ticket_id.trim() || !trackForm.email.trim()) {
      toast.error("Please enter both Ticket ID and Email.");
      return;
    }

    setIsTrackLoading(true);
    setTrackedTicket(null);

    try {
      const url = `${API_BASE_URL}/api/grievances/track?ticket_id=${encodeURIComponent(trackForm.ticket_id.trim())}&email=${encodeURIComponent(trackForm.email.trim())}`;
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        setTrackedTicket(data);
        toast.success("Ticket details found!");
      } else {
        const err = await res.json();
        toast.error(err.message || "Invalid ticket credentials.");
      }
    } catch (err) {
      toast.error("Network error tracking grievance.");
    } finally {
      setIsTrackLoading(false);
    }
  };

  return (
    <LegalPageLayout title="Grievance Redressal Mechanism" lastUpdated="May 2026">
      <p className="text-base text-muted-foreground leading-relaxed">
        At WellForged, we stand by complete transparency and product integrity. Under the Consumer Protection (E-Commerce) Rules, 2020, we provide a formal mechanism to address all customer grievances. If you experience issues with product quality, testing disparities, payment failures, delivery delays, or cancellations, please lodge an official ticket below.
      </p>

      {/* SLA legal disclosure panel */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 my-8 flex items-start gap-4">
        <ShieldAlert className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Our Legal Resolution Promise</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every grievance is routed directly to our designated Grievance Officer, **Dr. Aravind Swamy (Head of Customer Integrity)**. We officially acknowledge every ticket within **48 hours** and provide a final resolution statement within **30 days**.
          </p>
          <p className="text-[10px] text-muted-foreground/80 font-mono pt-1">Officer Email: grievance@wellforged.in | Address: 123 Corporate Avenue, New Delhi, India</p>
        </div>
      </div>

      {/* Tab Segment Controls */}
      <div className="flex bg-secondary border border-border p-1.5 rounded-xl max-w-sm mb-10">
        <button
          onClick={() => { setActiveTab("lodge"); setCreatedTicket(null); }}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "lodge" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
        >
          Lodge Ticket
        </button>
        <button
          onClick={() => { setActiveTab("track"); setTrackedTicket(null); }}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "track" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
        >
          Track Status
        </button>
      </div>

      {/* Tab CONTENT 1: Lodge Form */}
      {activeTab === "lodge" && (
        <div className="space-y-6">
          {createdTicket ? (
            /* Success confirmation card */
            <div className="bg-card border border-emerald-500/30 rounded-2xl p-8 shadow-card space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Grievance Registered Successfully</h3>
                  <p className="text-xs text-muted-foreground">Your complaint has been queued for investigation.</p>
                </div>
              </div>

              <div className="bg-secondary/50 border border-border p-5 rounded-xl space-y-3 font-body text-sm text-foreground">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-xs text-muted-foreground uppercase font-bold">Ticket ID</span>
                  <span className="font-mono text-primary font-bold">{createdTicket.ticket_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground uppercase">Customer Name</span>
                  <span className="text-foreground font-medium">{createdTicket.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground uppercase">Category</span>
                  <span className="text-foreground">{createdTicket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground uppercase">Registered Date</span>
                  <span>{new Date(createdTicket.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed italic">
                * An email acknowledgement containing these details has been sent to **{createdTicket.email}**. Our Grievance Officer will review your concern and provide updates shortly. Please keep your Ticket ID safe for tracking.
              </p>

              <Button variant="outline" onClick={() => setCreatedTicket(null)} className="rounded-xl border-border hover:bg-secondary text-foreground w-full sm:w-auto">
                Lodge Another Grievance
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLodgeSubmit} className="space-y-6 bg-card border border-border/80 shadow-soft p-6 sm:p-8 rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Full Name</label>
                  <input
                    required
                    type="text"
                    value={lodgeForm.customer_name}
                    onChange={e => setLodgeForm({...lodgeForm, customer_name: e.target.value})}
                    placeholder="Enter your name"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Email Address</label>
                  <input
                    required
                    type="email"
                    value={lodgeForm.email}
                    onChange={e => setLodgeForm({...lodgeForm, email: e.target.value})}
                    placeholder="name@example.com"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Mobile Number</label>
                  <input
                    required
                    type="tel"
                    value={lodgeForm.phone}
                    onChange={e => setLodgeForm({...lodgeForm, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Order Number</label>
                  <input
                    required
                    type="text"
                    value={lodgeForm.order_number}
                    onChange={e => setLodgeForm({...lodgeForm, order_number: e.target.value})}
                    placeholder="e.g. WF-170284"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Grievance Category</label>
                <select
                  value={lodgeForm.category}
                  onChange={e => setLodgeForm({...lodgeForm, category: e.target.value})}
                  className={selectCls}
                >
                  <option value="Product Quality">Product Quality (Discrepancy, Packaging, Sourcing)</option>
                  <option value="Sourcing & Lab Reports">Lab Reports / Transparency Inquiries</option>
                  <option value="Delivery Delays">Delivery Delays or Logistics</option>
                  <option value="Payment Failures">Payment Charges or Card Failures</option>
                  <option value="Refunds & Cancellations">Refund or Cancellation Processing</option>
                  <option value="Other Queries">Other Customer Grievances</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Detailed Description</label>
                <textarea
                  required
                  rows={5}
                  value={lodgeForm.description}
                  onChange={e => setLodgeForm({...lodgeForm, description: e.target.value})}
                  placeholder="Provide complete details about your grievance. If referencing a lab batch report or physical defect, please describe it clearly."
                  className={textareaCls}
                />
              </div>

              {/* Upload cloud section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Attach Evidence / Proof <span className="text-[10px] text-muted-foreground/60 font-normal italic">(Optional, Max 5MB)</span></label>
                <div className="relative group bg-background border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <>
                      <Clock className="h-8 w-8 text-amber-500 animate-spin" />
                      <span className="text-xs text-muted-foreground">Uploading proof to Supabase...</span>
                    </>
                  ) : attachment ? (
                    <>
                      <FileCheck2 className="h-8 w-8 text-emerald-600" />
                      <span className="text-xs text-foreground font-medium">{attachment.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold bg-secondary border border-border px-2.5 py-0.5 rounded">Uploaded</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-xs text-muted-foreground">Drag or click to attach screenshots, receipts, or batch reports</span>
                      <span className="text-[10px] text-muted-foreground/75 font-medium">PNG, JPEG, WebP, PDF</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                disabled={isLodging || isUploading}
                className="w-full h-12 text-sm font-bold uppercase tracking-wider shadow-lg rounded-xl flex items-center justify-center gap-2"
              >
                {isLodging ? "Filing Grievance..." : "File Official Ticket"}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Tab CONTENT 2: Track Form */}
      {activeTab === "track" && (
        <div className="space-y-6">
          <form onSubmit={handleTrackSubmit} className="space-y-4 bg-card border border-border/80 shadow-soft p-6 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Ticket ID</label>
                <input
                  required
                  type="text"
                  value={trackForm.ticket_id}
                  onChange={e => setTrackForm({...trackForm, ticket_id: e.target.value})}
                  placeholder="e.g. WF-TKT-382904"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">Lodge Email</label>
                <input
                  required
                  type="email"
                  value={trackForm.email}
                  onChange={e => setTrackForm({...trackForm, email: e.target.value})}
                  placeholder="name@example.com"
                  className={inputCls}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              disabled={isTrackLoading}
              className="w-full h-11 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Search className="h-4 w-4" /> {isTrackLoading ? "Checking Status..." : "Track Grievance"}
            </Button>
          </form>

          {/* RENDER TRACKED TICKET TIMELINE */}
          {trackedTicket && (
            <div className="bg-card border border-border shadow-soft rounded-2xl p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Ticket Status Analysis</h3>
                  <p className="text-xs text-muted-foreground font-mono">ID: {trackedTicket.ticket_id} | Category: {trackedTicket.category}</p>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border text-center uppercase tracking-wider self-start sm:self-center ${
                  trackedTicket.status === 'resolved' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : trackedTicket.status === 'in_progress' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {trackedTicket.status === 'resolved' ? 'Resolved' : trackedTicket.status === 'in_progress' ? 'In Progress' : 'Pending Investigation'}
                </span>
              </div>

              {/* Graphical Vertical Timeline */}
              <div className="relative border-l-2 border-border pl-6 ml-3 space-y-8">
                {/* Step 1: Lodged */}
                <div className="relative">
                  <div className="absolute -left-[35px] top-0 h-6 w-6 rounded-full bg-emerald-50 border border-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Grievance Ticket Registered</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Ticket was officially created and queued for Dr. Swamy (Grievance Officer).</p>
                    <p className="text-[10px] text-muted-foreground/80 font-mono mt-1">{new Date(trackedTicket.created_at).toLocaleDateString('en-IN')} | Category: {trackedTicket.category}</p>
                  </div>
                </div>

                {/* Step 2: Under Review */}
                <div className="relative">
                  <div className={`absolute -left-[35px] top-0 h-6 w-6 rounded-full flex items-center justify-center ${
                    trackedTicket.status !== 'pending' 
                      ? 'bg-emerald-50 border border-emerald-500' 
                      : 'bg-amber-50 border border-amber-500 animate-pulse'
                  }`}>
                    {trackedTicket.status !== 'pending' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Officer SLA Investigation</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {trackedTicket.status !== 'pending' 
                        ? "Case was audited and processed under consumer grievance code." 
                        : "Grievance details are being investigated and cross-referenced."}
                    </p>
                    {trackedTicket.status !== 'pending' ? (
                      <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-1">SLA Investigation Completed</p>
                    ) : (
                      <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-1 animate-pulse">Review In Progress</p>
                    )}
                  </div>
                </div>

                {/* Step 3: Resolved */}
                <div className="relative">
                  <div className={`absolute -left-[35px] top-0 h-6 w-6 rounded-full flex items-center justify-center ${
                    trackedTicket.status === 'resolved' 
                      ? 'bg-emerald-50 border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
                      : 'bg-secondary border border-border'
                  }`}>
                    {trackedTicket.status === 'resolved' ? (
                      <FileCheck2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${trackedTicket.status === 'resolved' ? 'text-foreground' : 'text-muted-foreground'}`}>Official Resolution Declared</h4>
                    {trackedTicket.status === 'resolved' ? (
                      <div className="mt-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-emerald-700">
                          <span>Verified Officer Resolution</span>
                          <span>{trackedTicket.resolved_at ? new Date(trackedTicket.resolved_at).toLocaleDateString('en-IN') : ''}</span>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed font-medium italic">
                          "{trackedTicket.resolution_notes || 'Grievance resolved successfully.'}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">Once our officer posts the official resolution and mitigation updates, it will display here.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Attachment summary if available */}
              {trackedTicket.attachment_url && (
                <div className="border-t border-border pt-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-4 w-4 text-muted-foreground/80" /> Attached Proof Reference
                  </div>
                  <a 
                    href={trackedTicket.attachment_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-gold hover:text-gold/80 font-bold uppercase tracking-wider font-mono"
                  >
                    View File
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </LegalPageLayout>
  );
};

export default GrievancePortal;
