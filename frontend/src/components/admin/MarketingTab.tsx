import { useState, useEffect, useRef } from "react";
import { 
  Star, RefreshCcw, CheckCircle2, XCircle, BookOpen, 
  Trash2, Plus, Upload, FileText, Sparkles, User, Clock, 
  Tag, Calendar, Link as LinkIcon 
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "./AdminTypes";
import { API_BASE_URL } from "@/config";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  read_time: string;
  author: string;
  image_url: string | null;
  created_at: string;
}

const MarketingTab = () => {
  // Tab states
  const [subTab, setSubTab] = useState<'reviews' | 'editorial'>('reviews');

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Blog states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Nutrition");
  const [formReadTime, setFormReadTime] = useState("5 min read");
  const [formAuthor, setFormAuthor] = useState("WellForged Editorial");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSlugTouched = useRef(false);

  // ---------------- REVIEW HANDLERS ----------------

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const res = await apiFetch('/api/admin/reviews');
      if (res.ok) {
        setReviews(await res.json());
      } else {
        toast.error('Failed to load reviews');
      }
    } catch (err) {
      toast.error('Network error loading reviews');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const updateReview = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`/api/admin/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Review successfully ${status === 'published' ? 'approved' : 'rejected'}`);
        setReviews(prev => prev.map(r => r.id === id ? {...r, status: status === 'published' ? 'published' : 'rejected'} : r));
      } else {
        toast.error('Failed to update review status');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      const res = await apiFetch(`/api/admin/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified_purchase: !currentStatus })
      });
      if (res.ok) {
        toast.success(`Verification status updated`);
        setReviews(prev => prev.map(r => r.id === id ? {...r, is_verified_purchase: !currentStatus} : r));
      } else {
        toast.error('Failed to update verification status');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  // ---------------- BLOG HANDLERS ----------------

  const fetchBlogPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog`);
      if (res.ok) {
        setPosts(await res.json());
      } else {
        toast.error('Failed to load blog posts');
      }
    } catch (err) {
      toast.error('Network error loading blog posts');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (titleVal: string) => {
    setFormTitle(titleVal);
    if (!isSlugTouched.current) {
      const generated = titleVal
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormSlug(generated);
    }
  };

  // Image Upload using the public grievance uploader which routes directly to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('attachment', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/grievances/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormImageUrl(data.url);
        toast.success('Cover image uploaded successfully to Supabase!');
      } else {
        toast.error('Image upload failed');
      }
    } catch (err) {
      toast.error('Network error uploading cover image');
    } finally {
      setIsUploading(false);
    }
  };

  // Create/Publish Blog Post
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formExcerpt.trim() || !formContent.trim()) {
      return toast.error('Please fill out all mandatory fields: Title, Excerpt, and Article Content.');
    }

    setIsPublishing(true);
    try {
      const res = await apiFetch('/api/blog/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          slug: formSlug.trim() || undefined,
          excerpt: formExcerpt.trim(),
          content: formContent.trim(),
          category: formCategory,
          read_time: formReadTime.trim(),
          author: formAuthor.trim(),
          image_url: formImageUrl.trim() || null
        })
      });

      if (res.ok) {
        toast.success('Editorial article published successfully!');
        // Reset form
        setFormTitle("");
        setFormSlug("");
        setFormExcerpt("");
        setFormContent("");
        setFormImageUrl("");
        setFormReadTime("5 min read");
        setFormAuthor("WellForged Editorial");
        isSlugTouched.current = false;
        
        // Reload articles
        fetchBlogPosts();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to publish article');
      }
    } catch (err) {
      toast.error('Network error during publishing');
    } finally {
      setIsPublishing(false);
    }
  };

  // Delete Blog Post
  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this article? This action is permanent.')) return;

    try {
      const res = await apiFetch(`/api/blog/admin/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Article deleted successfully');
        setPosts(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error('Failed to delete article');
      }
    } catch (err) {
      toast.error('Network error deleting article');
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchBlogPosts();
  }, []);

  const inputCls = "w-full bg-[#0d0d0d] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all";
  const labelCls = "text-2xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5";

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header */}
      <div className="flex border-b border-neutral-800 pb-px">
        <button
          onClick={() => setSubTab('reviews')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all uppercase tracking-wider ${
            subTab === 'reviews'
              ? 'border-emerald-500 text-white font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Reviews Moderation
        </button>
        <button
          onClick={() => setSubTab('editorial')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all uppercase tracking-wider ${
            subTab === 'editorial'
              ? 'border-emerald-500 text-white font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Editorial Journal
        </button>
      </div>

      {subTab === 'reviews' ? (
        /* ---------------- REVIEWS TAB ---------------- */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-white mb-1">Review Moderation</h2>
              <p className="text-xs text-neutral-500">Approve or reject customer reviews. Approved reviews will display instantly on the product details page.</p>
            </div>
            <button 
              onClick={fetchReviews} 
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${isLoadingReviews ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {isLoadingReviews ? (
            <div className="py-20 text-center text-neutral-500">
              <RefreshCcw className="mx-auto mb-4 h-6 w-6 animate-spin" />
              Syncing Reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 py-24 text-center">
              <Star className="mx-auto mb-4 h-10 w-10 text-neutral-600/30" />
              <p className="font-display font-medium text-neutral-500">No reviews found.</p>
              <p className="text-[11px] text-neutral-600 mt-1 uppercase tracking-widest">Customer feedback will appear here once submitted.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => {
                const isPublished = r.status === 'published' || r.status === 'approved';
                const statusLabel = isPublished ? 'Approved' : r.status;

                return (
                  <div key={r.id} className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 shadow-sm hover:border-neutral-700/50 transition-all duration-200">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-sm">
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </span>
                          {r.is_verified_purchase ? (
                            <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Verified Purchase
                            </span>
                          ) : (
                            <span className="text-[9px] bg-neutral-800 text-neutral-400 border border-neutral-700/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Unverified
                            </span>
                          )}
                          <button
                            onClick={() => toggleVerification(r.id, r.is_verified_purchase)}
                            className="text-[9px] text-amber-500/80 hover:text-amber-400 underline uppercase tracking-wider font-bold transition-colors ml-1"
                          >
                            {r.is_verified_purchase ? "Mark Unverified" : "Mark Verified"}
                          </button>
                        </div>
                        <p className="text-sm text-neutral-200 font-medium italic">"{r.comment}"</p>
                        <div className="flex items-center gap-3 mt-3 text-[10px] text-neutral-500 flex-wrap">
                          <p className="font-bold text-neutral-400">{r.customer_name}</p>
                          <span>•</span>
                          <p className="uppercase tracking-wider">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                          <span>•</span>
                          <p className="font-mono bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">Product ID: {r.product_id?.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 min-w-[140px] justify-between md:justify-start items-center md:items-stretch w-full md:w-auto mt-2 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800/50">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border text-center uppercase tracking-widest ${
                          isPublished
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : r.status === 'rejected' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {statusLabel}
                        </span>
                        <div className="flex gap-1.5 mt-1">
                          <button 
                            onClick={() => updateReview(r.id, 'published')} 
                            disabled={isPublished}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-bold rounded-lg border border-green-500/20 transition-all uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Approve
                          </button>
                          <button 
                            onClick={() => updateReview(r.id, 'rejected')} 
                            disabled={r.status === 'rejected'}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/20 transition-all uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <XCircle className="h-3 w-3" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ---------------- EDITORIAL TAB ---------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Listings */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Published Articles</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Total: {posts.length}</p>
              </div>
              <button 
                onClick={fetchBlogPosts}
                className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white"
              >
                <RefreshCcw className={`h-4 w-4 ${isLoadingPosts ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoadingPosts ? (
              <div className="py-12 text-center text-neutral-500">
                <RefreshCcw className="mx-auto mb-2 h-5 w-5 animate-spin" />
                Loading Articles...
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-800 py-16 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-neutral-700" />
                <p className="text-xs text-neutral-500 font-medium">No published articles.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {posts.map((post) => (
                  <div key={post.id} className="bg-[#141414] border border-neutral-800 rounded-xl p-3 flex gap-3 items-center group hover:border-neutral-700/50 transition-all duration-200">
                    <div className="w-12 h-12 rounded bg-neutral-900 overflow-hidden shrink-0 border border-neutral-800 flex items-center justify-center">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="h-5 w-5 text-neutral-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{post.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500">
                        <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-[9px] text-emerald-400 border border-neutral-700">{post.category}</span>
                        <span>•</span>
                        <span>{post.read_time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Article"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Publishing Form */}
          <div className="lg:col-span-7 bg-[#141414] border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Publish Editorial Article</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Write dynamic, high-intent SEO content directly to the WellForged Journal</p>
              </div>
            </div>

            <form onSubmit={handlePublish} className="space-y-4">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="blog-title" className={labelCls}>Article Title <span className="text-red-500">*</span></label>
                  <input
                    id="blog-title"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. How to Read Lab Reports"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="blog-slug" className={labelCls}>Unique URL Slug <span className="text-neutral-500">(Auto-generated)</span></label>
                  <input
                    id="blog-slug"
                    type="text"
                    value={formSlug}
                    onChange={(e) => {
                      setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      isSlugTouched.current = true;
                    }}
                    placeholder="e.g. how-to-read-lab-reports"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Category, Read Time, Author */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="blog-category" className={labelCls}>Category</label>
                  <select
                    id="blog-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Nutrition">Nutrition</option>
                    <option value="Science">Science</option>
                    <option value="Sourcing">Sourcing</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="blog-read-time" className={labelCls}>Reading Time</label>
                  <input
                    id="blog-read-time"
                    type="text"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                    placeholder="e.g. 5 min read"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="blog-author" className={labelCls}>Author Name</label>
                  <input
                    id="blog-author"
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. WellForged Editorial"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Cover Image URL & Uploader */}
              <div>
                <label className={labelCls}>Cover Image File Uploader</label>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                  <div className="md:col-span-8">
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://example.com/image.png (or use file upload below)"
                      className={inputCls}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl border border-neutral-700 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      <span>Upload File</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
                
                <p className="text-[10px] text-neutral-500 mt-1.5">
                  💡 Recommended: <strong>1200 × 675 pixels (16:9 aspect ratio)</strong>. This guarantees perfect alignment and prevents cropping in the journal layout.
                </p>
                
                {formImageUrl && (
                  <div className="mt-3 relative h-20 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 flex items-center justify-center">
                    <img src={formImageUrl} alt="Uploaded Cover preview" className="w-full h-full object-cover opacity-60" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-mono bg-black/40">Uploaded Cover Preview</span>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="blog-excerpt" className={labelCls}>Short Excerpt / Meta Description <span className="text-red-500">*</span></label>
                <textarea
                  id="blog-excerpt"
                  required
                  rows={2}
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="Enter a brief, punchy summary of the article (displays on index cards and meta descriptions)..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Rich Content (HTML / Markdown) */}
              <div>
                <label htmlFor="blog-content" className={labelCls}>Article Content (HTML/Rich-Text supported) <span className="text-red-500">*</span></label>
                <textarea
                  id="blog-content"
                  required
                  rows={10}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write full article here. Supports tags like <h2>, <p>, <ul>, <li>, <strong>, <blockquote>. Use custom styled box wrappers if needed."
                  className={`${inputCls} font-mono text-xs`}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      <span>Publishing to Database...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 stroke-[3px]" />
                      <span>Publish Article</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default MarketingTab;
