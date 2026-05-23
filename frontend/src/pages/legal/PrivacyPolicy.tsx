import LegalPageLayout from "@/components/LegalPageLayout";

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="October 2026">
      <p>
        At WellForged, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit our website (wellforged.in) or make a purchase from us.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We may collect the following types of personal information:</p>
      <ul>
        <li><strong>Contact Information:</strong> Name, email address, phone number, shipping and billing address.</li>
        <li><strong>Payment Information:</strong> Credit/debit card details, UPI IDs, or other payment specifics (processed securely via Razorpay).</li>
        <li><strong>Usage Data:</strong> IP address, browser type, device identifiers, and browsing behavior on our website.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the collected information for the following purposes:</p>
      <ul>
        <li>To process and fulfill your orders, including sending order confirmations and shipping updates.</li>
        <li>To communicate with you regarding customer support inquiries.</li>
        <li>To improve our website functionality, product offerings, and user experience.</li>
        <li>To send promotional emails or newsletters (only if you have opted in).</li>
      </ul>

      <h2>3. Data Sharing and Disclosure</h2>
      <p>
        We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted third-party service providers (e.g., Razorpay for payments, Brevo for transactional emails, and logistics partners for shipping) solely for the purpose of operating our business and serving you.
      </p>

      <h2>4. Data Security</h2>
      <p>
        We implement industry-standard security measures, including SSL encryption, to protect your personal information during transmission and storage. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        You have the right to access, update, or request the deletion of your personal information. If you wish to exercise these rights, please contact us at hello@wellforged.in.
      </p>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
