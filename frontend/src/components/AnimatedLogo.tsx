import logoSrc from "../assets/WellForged_Shield_Logo.png";

interface AnimatedLogoProps {
  size?: "hero" | "medium" | "nav";
  className?: string;
}

const AnimatedLogo = ({ size = "hero", className = "" }: AnimatedLogoProps) => {
  const sizeClasses = {
    hero: "w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36",
    medium: "w-16 h-16 sm:w-20 sm:h-20",
    nav: "w-10 h-10 sm:w-12 sm:h-12",
  };

  return (
    <div className={`relative ${sizeClasses[size]} animate-subtle-float ${className}`}>
      <img
        src={logoSrc}
        alt="WellForged Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default AnimatedLogo;
