import LegalPageLayout from "@/components/LegalPageLayout";

const ShippingPolicy = () => {
  return (
    <LegalPageLayout title="Shipping and Delivery Policy" lastUpdated="October 2026">
      <p>
        At WellForged, we are committed to delivering your supplements safely and promptly. This policy outlines our shipping procedures, timelines, and costs.
      </p>

      <h2>1. Processing Time</h2>
      <p>
        All orders are processed and dispatched from our fulfillment center within 1-2 business days (excluding weekends and public holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped, which will include your tracking information.
      </p>

      <h2>2. Delivery Timelines</h2>
      <p>
        We currently ship across India. Estimated delivery times are as follows:
      </p>
      <ul>
        <li><strong>Metropolitan Cities:</strong> 2-4 business days</li>
        <li><strong>Rest of India:</strong> 4-7 business days</li>
      </ul>
      <p>
        <em>Please note that these are estimates. Unforeseen delays with our courier partners due to weather, regional restrictions, or high parcel volumes may occasionally occur.</em>
      </p>

      <h2>3. Shipping Charges</h2>
      <p>
        We offer <strong>Free Standard Shipping</strong> on all orders within India. There are no hidden fees at checkout.
      </p>

      <h2>4. Order Tracking</h2>
      <p>
        Once your order has been dispatched, you will receive a tracking link via email and/or SMS. You can use this link to monitor the progress of your delivery in real-time.
      </p>

      <h2>5. Delivery Issues</h2>
      <p>
        If you are unavailable to receive the package, our courier partner will typically make up to 3 delivery attempts. If the package is returned to us due to non-availability or an incorrect address, a re-shipping fee may apply.
      </p>
      <p>
        If you have not received your order within the estimated timeframe, please contact us at hello@wellforged.in with your Order ID, and we will investigate the matter with our logistics partners.
      </p>
    </LegalPageLayout>
  );
};

export default ShippingPolicy;
