import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutUs = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground">Our Story</h1>
          <p className="font-body text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Wellforged was born from a simple belief: supplements should be completely transparent, free of fillers, and built on uncompromising integrity.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutUs;
