import LegalPageLayout from "@/components/LegalPageLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const ContactUs = () => {
  return (
    <LegalPageLayout title="Contact Us" lastUpdated="October 2026">
      <p>
        We're here to help. Whether you have a question about our products, need assistance with an order, or just want to learn more about WellForged, our dedicated team is ready to assist you.
      </p>

      <h2>Customer Support</h2>
      <p>
        The fastest way to reach us is via email. We aim to respond to all inquiries within 24 hours during business days.
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:hello@wellforged.in">hello@wellforged.in</a></li>
        <li><strong>Phone:</strong> 9870278977 (Mon-Fri, 10:00 AM - 6:00 PM IST)</li>
        <li><strong>Address:</strong> F - $7</li>
      </ul>

      <h2>Grievance Redressal Mechanism</h2>
      <p>
        Under the Consumer Protection (E-Commerce) Rules, 2020, we maintain a formal consumer grievance redressal channel to resolve product quality concerns, payment disputes, or delivery delays.
      </p>
      
      <div className="not-prose bg-primary/5 border border-primary/20 rounded-2xl p-6 my-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
            <ShieldAlert className="h-5 w-5 text-primary animate-pulse-premium" />
            Designated Grievance Desk
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Lodge an official ticket with our designated Grievance Officer, <strong>Dr. Aravind Swamy</strong> (Head of Customer Integrity). We officially acknowledge all submissions within 48 hours and provide a complete resolution within 30 days.
          </p>
        </div>
        <Link to="/support/grievance-redressal" className="w-full md:w-auto flex-shrink-0">
          <Button variant="hero" className="w-full md:w-auto rounded-xl shadow-md">
            Lodge Formal Ticket
          </Button>
        </Link>
      </div>

      <h2>Connect With Us</h2>
      <p>
        Stay updated with our latest releases and wellness insights by following us on social media:
      </p>
      <ul>
        <li><strong>Instagram:</strong> <a href="https://www.instagram.com/wellforged_/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@wellforged_</a></li>
        <li><strong>Twitter/X:</strong> @wellforged</li>
      </ul>
    </LegalPageLayout>
  );
};

export default ContactUs;
