import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/config";
import { ArrowRight, BookOpen, Clock, Tag, Calendar, Sparkles } from "lucide-react";

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

const CATEGORIES = ["All", "Science", "Sourcing", "Nutrition"];

const BlogIndex = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // Build url based on category
        const url = selectedCategory === "All" 
          ? `${API_BASE_URL}/api/blog` 
          : `${API_BASE_URL}/api/blog?category=${encodeURIComponent(selectedCategory)}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch blog posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory]);

  const filteredPosts = posts
    .filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Category Color Map
  const getCategoryStyles = (category: string) => {
    switch (category.toLowerCase()) {
      case "science":
        return "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";
      case "sourcing":
        return "bg-amber-500/10 text-amber-800 border-amber-500/20";
      case "nutrition":
        return "bg-sky-500/10 text-sky-800 border-sky-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <SEO 
        title="Wellness Journal & Insights | WellForged"
        description="Learn about supplement transparency, third-party lab reports, and clean nutrition."
        canonical="/blog"
      />
      <main className="min-h-screen bg-background flex flex-col font-body">
        <Navbar />
        
        {/* Above the Fold Hero & Featured Article Section */}
        <section className="relative px-6 max-w-7xl mx-auto w-full flex flex-col justify-center pt-24 lg:pt-32 pb-8 min-h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full my-auto">
            {/* Left Column: Hero Text, Search, and Category Pills */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6 text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/10 bg-primary/5 text-primary text-2xs font-medium tracking-wide uppercase mb-2 animate-fade-in w-fit">
                  <Sparkles className="w-3 h-3" />
                  <span>WellForged Editorial</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  The Journal of <span className="italic font-normal text-primary">Clean Wellness</span>
                </h1>
                <p className="font-body text-muted-foreground text-sm lg:text-base leading-relaxed max-w-lg">
                  No hype. No marketing jargon. Just independent research, chemistry guides, and authentic supplement transparency.
                </p>
              </div>

              {/* Search input and category tags combined above the fold */}
              <div className="space-y-4 pt-2">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="Search articles by keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm shadow-soft transition-all duration-300"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-3xs sm:text-2xs font-medium border transition-all duration-300 ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground border-primary shadow-soft"
                          : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: First Tile (Featured Post) */}
            <div className="lg:col-span-7 flex items-center justify-center w-full">
              {loading ? (
                /* Luxury Shimmer Loader for Above the Fold Tile */
                <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-soft animate-pulse w-full h-[360px] lg:h-[420px]">
                  <div className="h-1/2 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 bg-muted w-1/4 rounded" />
                    <div className="h-5 bg-muted w-3/4 rounded" />
                    <div className="h-3 bg-muted w-full rounded" />
                    <div className="h-3 bg-muted w-2/3 rounded" />
                  </div>
                </div>
              ) : filteredPosts.length === 0 ? (
                /* Empty state if search yields no results */
                <div className="w-full h-[360px] lg:h-[420px] bg-card/40 border border-border border-dashed rounded-[2rem] flex flex-col items-center justify-center p-8 text-center shadow-soft">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="font-display text-base font-semibold text-foreground">No matches found</h3>
                  <p className="text-muted-foreground text-xs mt-2 max-w-xs mx-auto">Try refining your keyword search or select another category filter to find articles.</p>
                </div>
              ) : (
                /* Compact, Elegant Featured Post */
                <div className="group bg-card border border-border rounded-[2rem] overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-500 flex flex-col h-[360px] lg:h-[420px] w-full">
                  {/* Image container with standard 16:9 aspect ratio */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0 border-b border-border/40">
                    {filteredPosts[0].image_url ? (
                      <img 
                        src={filteredPosts[0].image_url} 
                        alt={filteredPosts[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 flex items-center justify-center p-8 group-hover:scale-105 transition-transform duration-700 ease-out">
                        <BookOpen className="w-16 h-16 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-3xs font-semibold border shadow-soft ${getCategoryStyles(filteredPosts[0].category)}`}>
                        {filteredPosts[0].category}
                      </span>
                    </div>
                  </div>

                  {/* Content container */}
                  <div className="p-6 lg:p-7 flex flex-col justify-between flex-1 min-h-0 bg-card">
                    <div className="space-y-1.5 lg:space-y-2.5">
                      <div className="flex items-center gap-4 text-3xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(filteredPosts[0].created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {filteredPosts[0].read_time}
                        </span>
                      </div>
                      <h2 className="font-display text-base lg:text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        <Link to={`/blog/${filteredPosts[0].slug}`}>
                          {filteredPosts[0].title}
                        </Link>
                      </h2>
                      <p className="text-muted-foreground text-2xs lg:text-xs leading-relaxed line-clamp-2 lg:line-clamp-3">
                        {filteredPosts[0].excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/60 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-3xs font-semibold">
                          {filteredPosts[0].author[0]}
                        </div>
                        <span className="text-3xs font-medium text-foreground">{filteredPosts[0].author}</span>
                      </div>
                      <Link 
                        to={`/blog/${filteredPosts[0].slug}`}
                        className="inline-flex items-center gap-1 text-primary font-semibold text-2xs lg:text-xs hover:gap-2 transition-all duration-300"
                      >
                        <span>Read Featured Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Below the Fold 1X3 Matrix Grid Section */}
        {filteredPosts.length > 1 && (
          <section className="max-w-7xl mx-auto w-full px-6 pb-32 pt-16 border-t border-border/60">
            <div className="space-y-1 mb-10 text-left">
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest block font-mono">Journal Entries</span>
              <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground">More Journal & Sourcing Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post) => (
                <article 
                  key={post.id} 
                  className="group bg-card border border-border rounded-3xl overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Image container with standard 16:9 aspect ratio */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0 border-b border-border/40">
                    {post.image_url ? (
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 flex items-center justify-center p-8 group-hover:scale-105 transition-transform duration-700 ease-out">
                        <BookOpen className="w-12 h-12 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-3xs font-semibold border shadow-soft ${getCategoryStyles(post.category)}`}>
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 lg:p-7 flex flex-col flex-1 space-y-3.5">
                    <div className="flex items-center gap-4 text-3xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time}
                      </span>
                    </div>
                    
                    <h3 className="font-display text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-muted-foreground text-2xs sm:text-xs leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-3.5 border-t border-border mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-3xs font-semibold">
                          {post.author[0]}
                        </div>
                        <span className="text-3xs font-medium text-foreground">{post.author}</span>
                      </div>
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-primary font-semibold text-2xs hover:gap-2 transition-all duration-300"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        <Footer />
      </main>
    </>
  );
};

export default BlogIndex;
