import LegalPageLayout from "@/components/LegalPageLayout";

const RefundPolicy = () => {
  return (
    <LegalPageLayout title="Refund and Cancellation Policy" lastUpdated="October 2026">
      <p>
        At WellForged, we stand behind the uncompromising quality of our products. Due to the consumable nature of our supplements, we have specific guidelines regarding refunds and cancellations to ensure health and safety standards are maintained.
      </p>

      <h2>1. Cancellations</h2>
      <p>
        You may cancel your order at any time before it has been dispatched from our facility. To request a cancellation, please email us immediately at hello@wellforged.in with your Order ID. If the order has not yet been shipped, we will cancel it and process a full refund to your original payment method within 5-7 business days.
      </p>
      <p>
        Once an order has been dispatched and handed over to our logistics partners, it cannot be cancelled.
      </p>

      <h2>2. Returns and Replacements</h2>
      <p>
        Because our products are dietary supplements, we cannot accept returns of opened or unsealed products due to health and hygiene regulations. We will only issue replacements or refunds under the following circumstances:
      </p>
      <ul>
        <li>The product received is damaged or tampered with during transit.</li>
        <li>The product delivered is past its expiry date.</li>
        <li>You received an incorrect item.</li>
      </ul>
      <p>
        If you experience any of these issues, please contact us at hello@wellforged.in within 48 hours of receiving your delivery. Please include your Order ID and clear photographs of the damaged or incorrect product.
      </p>

      <h2>3. Refund Processing</h2>
      <p>
        If your refund request is approved, the refund will be processed back to the original method of payment used during checkout. Please note that it may take 5-7 business days for the refunded amount to reflect in your bank account, depending on your financial institution.
      </p>

      <h2>4. Non-Refundable Items</h2>
      <p>
        Products that have been opened, partially used, or are reported damaged after 48 hours of delivery are strictly non-refundable and non-returnable.
      </p>
    </LegalPageLayout>
  );
};

export default RefundPolicy;
