import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: (process.env.RAZORPAY_KEY_ID || '').trim(),
  key_secret: (process.env.RAZORPAY_KEY_SECRET || '').trim(),
});

class RazorpayService {
  /**
   * Creates a new order in Razorpay
   * @param amount Amount in smallest currency unit (paisa for INR)
   * @param receipt Order reference ID from our database
   */
  async createOrder(amount: number, receipt: string) {
    const cleanAmount = Math.floor(Number(amount));
    const options = {
      amount: Math.round(cleanAmount * 100), // Convert to paisa
      currency: "INR",
      receipt: String(receipt),
    };

    try {
      console.log("DEBUG: Razorpay Order Options:", options);
      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error("Razorpay Order Creation Failed:", error);
      throw error;
    }
  }

  /**
   * Verifies the Razorpay payment signature
   */
  verifySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest("hex");

    return expectedSignature === signature;
  }

  isConfigured(): boolean {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }
}

export default new RazorpayService();
