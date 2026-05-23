import LegalPageLayout from "@/components/LegalPageLayout";

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
        <li><strong>Phone:</strong> +91 98765 43210 (Mon-Fri, 10:00 AM - 6:00 PM IST)</li>
      </ul>

      <h2>Registered Address</h2>
      <p>
        <strong>WellForged Health and Wellness</strong><br />
        123 Corporate Avenue, Block C<br />
        New Delhi, 110001<br />
        India
      </p>
      <p><em>Please note: We do not process returns or exchanges at our corporate office address. Please refer to our Refund Policy for return instructions.</em></p>

      <h2>Connect With Us</h2>
      <p>
        Stay updated with our latest releases and wellness insights by following us on social media:
      </p>
      <ul>
        <li><strong>Instagram:</strong> @wellforged.in</li>
        <li><strong>Twitter/X:</strong> @wellforged</li>
      </ul>
    </LegalPageLayout>
  );
};

export default ContactUs;
