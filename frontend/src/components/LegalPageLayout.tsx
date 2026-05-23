import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, lastUpdated, children }) => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-20 pt-24 sm:pt-32">
        <div className="mx-auto max-w-3xl px-[var(--space-md)]">
          <header className="mb-12 border-b border-border pb-8 text-center sm:mb-16 sm:pb-12">
            <h1 className="font-display text-4xl font-normal text-foreground sm:text-5xl">{title}</h1>
            <p className="mt-4 font-body text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Last Updated: {lastUpdated}
            </p>
          </header>
          
          <article className="prose prose-sm prose-stone mx-auto sm:prose-base prose-headings:font-display prose-headings:font-normal prose-headings:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-strong:text-foreground">
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LegalPageLayout;
