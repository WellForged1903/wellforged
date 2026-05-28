import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/config";
import { ArrowLeft, Clock, Calendar, BookOpen, ShieldCheck, Search } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  author: string;
  image_url: string | null;
  created_at: string;
}

const BlogArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/api/blog/${slug}`);
        if (res.status === 404) {
          setError("Article not found");
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch article");
        }
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Error fetching article details:", err);
        setError("Unable to load the article at this time");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  };

  // Get Category Tag Styles
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

  return (
    <>
      {post && (
        <SEO 
          title={post.title}
          description={post.excerpt}
          canonical={`/blog/${post.slug}`}
          ogImage={post.image_url || "/Packaging_Updated.png"}
        />
      )}
      <main className="min-h-screen bg-background flex flex-col font-body">
        <Navbar />

        <div className="flex-1 max-w-4xl mx-auto w-full px-6 pt-32 pb-32">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Journal</span>
            </Link>
          </div>

          {loading ? (
            /* Shimmer loader for Article */
            <div className="space-y-6 animate-pulse">
              <div className="h-4 bg-muted w-16 rounded" />
              <div className="h-10 bg-muted w-3/4 rounded" />
              <div className="h-4 bg-muted w-48 rounded" />
              <div className="h-96 bg-muted w-full rounded-3xl" />
              <div className="space-y-4 pt-6">
                <div className="h-4 bg-muted w-full rounded" />
                <div className="h-4 bg-muted w-full rounded" />
                <div className="h-4 bg-muted w-5/6 rounded" />
              </div>
            </div>
          ) : error || !post ? (
            /* Error display */
            <div className="text-center py-20 bg-card border border-border rounded-3xl p-12 shadow-soft max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-destructive/80 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">{error || "Article not found"}</h3>
              <p className="text-muted-foreground text-sm mb-6">
                The article may have been moved or unpublished. Browse our latest updates in the journal.
              </p>
              <Link 
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <span>Journal Home</span>
              </Link>
            </div>
          ) : (
            /* Premium Typographic Article Page */
            <article className="space-y-8">
              {/* Header Info */}
              <div className="space-y-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border shadow-soft ${getCategoryStyles(post.category)}`}>
                  {post.category}
                </span>
                
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2 border-b border-border/60 pb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-semibold">
                      {post.author[0]}
                    </div>
                    <span className="font-medium text-foreground">{post.author}</span>
                  </div>
                  
                  <span className="flex items-center gap-1.5 font-mono text-xs">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.created_at)}
                  </span>
                  
                  <span className="flex items-center gap-1.5 font-mono text-xs">
                    <Clock className="w-4 h-4" />
                    {post.read_time}
                  </span>
                </div>
              </div>

              {/* Cover Image */}
              <div className="relative h-64 sm:h-96 lg:h-[450px] rounded-3xl overflow-hidden shadow-soft border border-border">
                {post.image_url ? (
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15 flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-primary/15" />
                  </div>
                )}
              </div>

              {/* Article Content / Rich Text Prose */}
              <div 
                className="prose prose-forest lg:prose-lg max-w-none 
                  prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
                  prose-p:font-body prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                  prose-blockquote:font-display prose-blockquote:italic prose-blockquote:text-primary prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:px-8 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:my-8
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:my-6
                  prose-li:text-muted-foreground prose-li:mb-2
                  [&>p:first-of-type]:first-letter:text-5xl [&>p:first-of-type]:first-letter:font-display [&>p:first-of-type]:first-letter:font-bold [&>p:first-of-type]:first-letter:text-primary [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:leading-none [&>p:first-of-type]:first-letter:pt-1.5"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Sourcing Callout Banner */}
              <div className="bg-card border border-border rounded-[2rem] p-8 sm:p-10 shadow-soft hover:shadow-card transition-all duration-300 relative overflow-hidden mt-16">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-12 -translate-y-12 -z-10 pointer-events-none" />
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="space-y-4 text-center md:text-left flex-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>The WellForged Standard</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight">
                      Moringa Sourcing Integrity
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      Every batch of WellForged Moringa powder has its own public story. Have a package in hand? Enter your batch number on our Transparency Page to inspect the exact heavy metal certifications and purity test for your jar.
                    </p>
                  </div>
                  <div className="w-full md:w-auto flex justify-center shrink-0">
                    <Link 
                      to="/transparency"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-soft"
                    >
                      <Search className="w-4 h-4" />
                      <span>Verify Your Batch</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>

        <Footer />
      </main>
    </>
  );
};

export default BlogArticlePage;
