import { Link } from "react-router-dom";
import {Instagram, Twitter, Shield, CheckCircle} from "lucide-react";
import logoSrc from "@/assets/WellForged_Shield_Logo.png";

const Footer = () => {
  const quickLinks = [
    { name: "About", href: "/about" },
    { name: "Products", href: "/product" },
    { name: "Transparency", href: "/transparency" },
    { name: "Journal (Blog)", href: "/blog" },
    { name: "Contact Us", href: "/contact-us" },
  ];
  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  return (
    <footer className="border-t border-border bg-secondary/30 pb-32 sm:pb-0">
      <div className="mx-auto max-w-7xl px-[var(--space-sm)] py-[var(--space-md)] lg:px-[var(--space-md)] lg:py-[var(--space-lg)]">
        <div className="grid grid-cols-2 gap-6 text-left sm:gap-8 lg:grid-cols-4 lg:gap-12">
          <div className="col-span-2 flex flex-col items-center text-center lg:col-span-1 lg:items-start lg:text-left">
            <img src={logoSrc} alt="WellForged Logo" className="mb-3 h-8 w-8 object-contain sm:h-10 sm:w-10" />
            <p className="font-display text-sm font-medium text-foreground sm:text-base">WellForged</p>
            <p className="mt-1 max-w-[18rem] font-body text-[11px] italic text-muted-foreground sm:text-xs">Wellness, Forged With Integrity</p>
            <div className="mt-4 flex items-center gap-[var(--space-xs)]">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-[var(--space-xl)] w-[var(--space-xl)] items-center justify-center rounded-full bg-muted transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-1/2 w-1/2" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h4 className="mb-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground sm:mb-2 sm:text-xs">Company</h4>
            <ul className="space-y-[var(--space-2xs)] text-center lg:text-left">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={() => window.scrollTo(0, 0)}
                    className="inline-block py-1 font-body text-muted-foreground transition-colors hover:text-foreground"
                    style={{ fontSize: "var(--text-sm)" }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h4 className="mb-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground sm:mb-2 sm:text-xs">Legal</h4>
            <ul className="space-y-4">
                <li><Link to="/privacy-policy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/terms-conditions" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms & Conditions</Link></li>
                <li><Link to="/refund-policy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Refund & Cancellation</Link></li>
                <li><Link to="/shipping-policy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Shipping Policy</Link></li>
                <li><Link to="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>

          <div className="hidden lg:block text-right">
             <p className="font-body text-[11px] text-muted-foreground mb-1">Support: hello@wellforged.in</p>
             <p className="font-body text-[10px] text-muted-foreground">Mon - Fri, 10am - 6pm IST</p>
          </div>
        </div>

        <div className="mt-3 border-t border-border pt-3 sm:mt-6 sm:pt-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              <p className="font-body text-[9px] text-muted-foreground sm:text-[10px]">© {new Date().getFullYear()} WellForged. All rights reserved.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Link to="/transparency" className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 transition-colors hover:bg-gold/20">
                <Shield className="h-3.5 w-3.5 text-gold" />
                <span className="font-body text-[10px] font-bold text-gold uppercase tracking-wider">NABL Certified Reports</span>
              </Link>
              <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2 py-1">
                <Shield className="h-3 w-3 text-primary" />
                <CheckCircle className="h-2.5 w-2.5 text-primary" />
                <span className="font-body text-[9px] font-medium text-primary">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
