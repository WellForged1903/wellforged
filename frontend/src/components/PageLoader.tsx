import AnimatedLogo from "./AnimatedLogo";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center">
        {/* Subtle background glow */}
        <div className="absolute inset-0 -m-4 animate-pulse rounded-full bg-primary/5 blur-2xl" />
        
        {/* Centered Logo with custom animation */}
        <AnimatedLogo size="medium" className="relative z-10 animate-pulse-premium transition-all duration-700" />
        
        {/* Elegant loading indicator */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="h-0.5 w-32 overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-full origin-left animate-shimmer-sweep bg-primary/60" />
          </div>
          
          <div className="flex flex-col items-center gap-1">
             <span className="font-display text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-primary/80">
               WellForged
             </span>
             <span className="font-body text-[8px] uppercase tracking-[0.25em] text-muted-foreground/50 transition-opacity duration-300">
               No Nonsense Supplements
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
