import RazorpayService from './src/services/razorpay.service.js';

async function test() {
    try {
        console.log("Testing Razorpay Config...");
        console.log("Key ID:", process.env.RAZORPAY_KEY_ID);
        const order = await RazorpayService.createOrder(100, "test_receipt");
        console.log("Order created successfully:", order.id);
    } catch (err) {
        console.error("Razorpay Test Failed:", err);
    } finally {
        process.exit();
    }
}

test();
