import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BlogIndex = () => {
  return (
    <>
      <SEO 
        title="Wellness Journal & Insights | WellForged"
        description="Learn about supplement transparency, third-party lab reports, and clean nutrition."
        canonical="/blog"
      />
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <section className="flex-1 py-24 px-6 max-w-4xl mx-auto w-full text-center">
          <h1 className="font-display text-4xl font-bold text-foreground mb-6">WellForged Journal</h1>
          <p className="font-body text-muted-foreground text-lg mb-12">Insights on clean nutrition, batch verification, and supplement transparency.</p>
          <div className="p-12 border border-border rounded-2xl bg-secondary/10">
            <p className="font-mono text-primary text-sm uppercase tracking-widest">Coming Soon</p>
            <h2 className="font-display text-2xl font-semibold mt-4">High-Intent Articles in Progress</h2>
            <p className="text-muted-foreground mt-4 text-sm max-w-md mx-auto">We are preparing detailed guides on how to read lab reports and what makes export-grade moringa different. Stay tuned.</p>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default BlogIndex;
