import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from Backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../Backend/.env') });

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432),
});

const API_BASE = `http://localhost:${process.env.PORT || 5001}/api`;

async function runTests() {
    console.log("==================================================");
    console.log("🛡️ STARTING DATABASE & API RESILIENCE TESTS 🛡️");
    console.log("==================================================");

    let passed = 0;
    let failed = 0;

    // Helper to log test outcomes
    const logOutcome = (name: string, ok: boolean, msg = "") => {
        if (ok) {
            console.log(`✅ [PASS] ${name} ${msg ? `- ${msg}` : ""}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name} ${msg ? `- ${msg}` : ""}`);
            failed++;
        }
    };

    try {
        // --- 1. PREPARATION: Fetch an active SKU to use for E2E API tests ---
        const skusQuery = await pool.query(`
            SELECT s.id as sku_id, s.price, s.stock, p.id as product_id
            FROM skus s 
            JOIN products p ON s.product_id = p.id 
            WHERE s.stock > 5 
            LIMIT 1
        `);

        if (skusQuery.rows.length === 0) {
            throw new Error("No active SKUs in database to run tests against. Ensure you have seeded the database.");
        }
        
        const testSku = skusQuery.rows[0];
        console.log(`ℹ️ Using test SKU: ${testSku.sku_id} (Stock: ${testSku.stock}, Price: ${testSku.price})`);

        // --- TEST CASE 1: Admin Privilege Bypass Protection ---
        try {
            console.log("\n🏃 Running Test: Admin Privilege Bypass Protection...");
            const res = await fetch(`${API_BASE}/admin/products/all`, { method: 'GET' });
            
            // Should be 401 Unauthorized because we didn't pass admin_token
            if (res.status === 401) {
                logOutcome("Admin Privilege Bypass Protection", true, "Unauthorized request successfully blocked (401)");
            } else {
                logOutcome("Admin Privilege Bypass Protection", false, `Bypass failed. Received status code ${res.status}`);
            }
        } catch (err: any) {
            logOutcome("Admin Privilege Bypass Protection", false, err.message);
        }

        // --- TEST CASE 2: Checkout Order Idempotency Guard ---
        try {
            console.log("\n🏃 Running Test: Checkout Order Idempotency Guard...");
            const idempotencyKey = crypto.randomUUID();
            
            const checkoutPayload = {
                idempotency_key: idempotencyKey,
                guest_details: {
                    full_name: "Idempotence Tester",
                    email: "idempotence@test.com",
                    mobile_number: "9999999999",
                    address_line1: "123 Safe St",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001",
                },
                items: [{ sku_id: testSku.sku_id, quantity: 1 }]
            };

            // Fire 3 simultaneous checkout requests
            const reqs = Array.from({ length: 3 }).map(() => 
                fetch(`${API_BASE}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(checkoutPayload)
                }).then(async r => ({ status: r.status, data: await r.json() }))
            );

            const results = await Promise.all(reqs);
            
            const firstResult = results[0];
            const allSuccess = results.every(r => r.status === 201 || r.status === 200);
            
            // Verify that all returned order IDs are the same
            const uniqueOrderIds = new Set(results.map(r => r.data.id));
            
            // Verify in DB that only 1 order with this idempotency key was written
            const dbCheck = await pool.query("SELECT COUNT(*) FROM orders WHERE idempotency_key = $1", [idempotencyKey]);
            const dbCount = parseInt(dbCheck.rows[0].count);

            if (allSuccess && uniqueOrderIds.size === 1 && dbCount === 1) {
                logOutcome("Checkout Order Idempotency Guard", true, `Exactly 1 order registered, duplicates returned matching payload. Order ID: ${firstResult.data.id}`);
            } else {
                logOutcome("Checkout Order Idempotency Guard", false, `Failed. Unique Order IDs size: ${uniqueOrderIds.size}, DB Entries count: ${dbCount}, Statuses: ${results.map(r => r.status)}`);
            }
        } catch (err: any) {
            logOutcome("Checkout Order Idempotency Guard", false, err.message);
        }

        // --- TEST CASE 3: Concurrent Checkout Inventory Stock Locking (FOR UPDATE) ---
        try {
            console.log("\n🏃 Running Test: Concurrent Checkout Inventory Stock Locking...");
            
            // 3.1 Create a temporary mockup product and SKU with stock = 1
            const tempProductResult = await pool.query(
                `INSERT INTO products (name, slug, base_description, category_id) 
                 VALUES ($1, $2, $3, NULL) RETURNING id`,
                ['Temp Race Product', `temp-race-${Date.now()}`, 'Used for inventory locks check']
            );
            const tempProductId = tempProductResult.rows[0].id;

            const tempSkuResult = await pool.query(
                `INSERT INTO skus (product_id, sku_code, label, price, stock) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [tempProductId, `WF-RACE-${Date.now()}`, '100g Pouch', 100, 1]
            );
            const tempSkuId = tempSkuResult.rows[0].id;

            // 3.2 Place two orders for this SKU, converting them to pending_payment order state
            const orderPayload1 = {
                idempotency_key: crypto.randomUUID(),
                guest_details: {
                    full_name: "Racer One",
                    email: "race1@test.com",
                    mobile_number: "9876543210",
                    address_line1: "42 Integrity St",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001"
                },
                items: [{ sku_id: tempSkuId, quantity: 1 }]
            };

            const orderPayload2 = {
                idempotency_key: crypto.randomUUID(),
                guest_details: {
                    full_name: "Racer Two",
                    email: "race2@test.com",
                    mobile_number: "9876543211",
                    address_line1: "42 Integrity St",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001"
                },
                items: [{ sku_id: tempSkuId, quantity: 1 }]
            };

            // Create both orders on the backend
            const o1Res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload1)
            }).then(r => r.json());

            const o2Res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload2)
            }).then(r => r.json());

            const orderId1 = o1Res.id;
            const orderId2 = o2Res.id;

            // Generate genuine Razorpay mock payment signature details
            const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
            const payId1 = `pay_${crypto.randomBytes(8).toString('hex')}`;
            const rzpOrderId1 = o1Res.razorpay?.id || `order_rzp_${crypto.randomBytes(8).toString('hex')}`;
            const rzpSig1 = crypto.createHmac('sha256', secret).update(`${rzpOrderId1}|${payId1}`).digest('hex');

            const payId2 = `pay_${crypto.randomBytes(8).toString('hex')}`;
            const rzpOrderId2 = o2Res.razorpay?.id || `order_rzp_${crypto.randomBytes(8).toString('hex')}`;
            const rzpSig2 = crypto.createHmac('sha256', secret).update(`${rzpOrderId2}|${payId2}`).digest('hex');

            // Send concurrent payment verification requests simultaneously
            const verifyPayload1 = {
                razorpay_order_id: rzpOrderId1,
                razorpay_payment_id: payId1,
                razorpay_signature: rzpSig1,
                order_id: orderId1
            };

            const verifyPayload2 = {
                razorpay_order_id: rzpOrderId2,
                razorpay_payment_id: payId2,
                razorpay_signature: rzpSig2,
                order_id: orderId2
            };

            const verifyReqs = [verifyPayload1, verifyPayload2].map(payload => 
                fetch(`${API_BASE}/payments/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).then(async r => ({ status: r.status, data: await r.json() }))
            );

            const verifyResults = await Promise.all(verifyReqs);

            const successes = verifyResults.filter(r => r.status === 200);
            const failures = verifyResults.filter(r => r.status !== 200);

            // Audit the remaining stock of the temporary SKU
            const finalStockCheck = await pool.query('SELECT stock FROM skus WHERE id = $1', [tempSkuId]);
            const finalStock = finalStockCheck.rows[0].stock;

            // Clean up temporary SKU & Product
            await pool.query('DELETE FROM order_items WHERE sku_id = $1', [tempSkuId]);
            await pool.query('DELETE FROM skus WHERE id = $1', [tempSkuId]);
            await pool.query('DELETE FROM orders WHERE id IN ($1, $2)', [orderId1, orderId2]);
            await pool.query('DELETE FROM products WHERE id = $1', [tempProductId]);

            if (successes.length === 1 && failures.length === 1 && finalStock === 0) {
                logOutcome("Concurrent Checkout Inventory Stock Locking", true, `Row locking validated. Exactly 1 checkout succeeded, other failed. Final SKU stock: ${finalStock}`);
            } else {
                logOutcome("Concurrent Checkout Inventory Stock Locking", false, `Locking failed. Successes: ${successes.length}, Failures: ${failures.length}, Final Stock: ${finalStock}`);
            }
        } catch (err: any) {
            logOutcome("Concurrent Checkout Inventory Stock Locking", false, err.message);
        }

        // --- TEST CASE 4: Payment Integration Edge Conditions ---
        try {
            console.log("\n🏃 Running Test: Payment Integration Edge Conditions...");
            
            // 4.1 Case A: Success Flow
            const successOrderPayload = {
                idempotency_key: crypto.randomUUID(),
                guest_details: {
                    full_name: "Success Tester",
                    email: "success@test.com",
                    mobile_number: "9876543212",
                    address_line1: "123 Clean Way",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001"
                },
                items: [{ sku_id: testSku.sku_id, quantity: 1 }]
            };

            const successOrderRes = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(successOrderPayload)
            }).then(r => r.json());

            const successOrderId = successOrderRes.id;
            const successRzpOrderId = successOrderRes.razorpay?.id || `rzp_${crypto.randomBytes(8).toString('hex')}`;
            const successPayId = `pay_${crypto.randomBytes(8).toString('hex')}`;
            const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
            const successSig = crypto.createHmac('sha256', secret).update(`${successRzpOrderId}|${successPayId}`).digest('hex');

            // Hit verify endpoint with valid signature
            const resA = await fetch(`${API_BASE}/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: successRzpOrderId,
                    razorpay_payment_id: successPayId,
                    razorpay_signature: successSig,
                    order_id: successOrderId
                })
            });
            const resAStatus = resA.status;
            
            // Assert payment record is logged in database
            const paymentDbCheck = await pool.query("SELECT * FROM payments WHERE order_id = $1", [successOrderId]);
            const hasPaymentRecord = paymentDbCheck.rows.length > 0;

            const caseAOk = resAStatus === 200 && hasPaymentRecord;
            logOutcome("Payment Integration - Successful Verification", caseAOk, `Callback returned ${resAStatus}. Payment log written: ${hasPaymentRecord}`);

            // 4.2 Case B: Invalid Signature Mismatch
            const invalidSig = crypto.createHmac('sha256', secret).update("tampered_body_data").digest('hex');
            const resB = await fetch(`${API_BASE}/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: successRzpOrderId,
                    razorpay_payment_id: successPayId,
                    razorpay_signature: invalidSig,
                    order_id: successOrderId
                })
            });
            logOutcome("Payment Integration - Invalid Signature Reject", resB.status === 400, `Rejected tampered signature with status ${resB.status}`);

            // 4.3 Case C: Missing Parameters
            const resC = await fetch(`${API_BASE}/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: successRzpOrderId,
                    order_id: successOrderId
                })
            });
            logOutcome("Payment Integration - Missing Parameters Reject", resC.status === 400, `Rejected missing params with status ${resC.status}`);

            // Cleanup success order
            await pool.query('DELETE FROM payments WHERE order_id = $1', [successOrderId]);
            await pool.query('DELETE FROM order_items WHERE order_id = $1', [successOrderId]);
            await pool.query('DELETE FROM orders WHERE id = $1', [successOrderId]);

        } catch (err: any) {
            logOutcome("Payment Integration Edge Conditions", false, err.message);
        }

        // --- TEST CASE 5: Negative/Zero Quantity Input Vulnerability Audit ---
        try {
            console.log("\n🏃 Running Test: Negative/Zero Quantity Input Vulnerability Audit...");
            const badPayload1 = {
                idempotency_key: crypto.randomUUID(),
                guest_details: {
                    full_name: "Exploit Tester",
                    email: "exploit@test.com",
                    mobile_number: "9999999999",
                    address_line1: "123 Exploit St",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001"
                },
                items: [{ sku_id: testSku.sku_id, quantity: -5 }]
            };

            const badPayload2 = {
                idempotency_key: crypto.randomUUID(),
                guest_details: {
                    full_name: "Exploit Tester",
                    email: "exploit@test.com",
                    mobile_number: "9999999999",
                    address_line1: "123 Exploit St",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001"
                },
                items: [{ sku_id: testSku.sku_id, quantity: 0 }]
            };

            const res1 = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(badPayload1)
            });

            const res2 = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(badPayload2)
            });

            const block1 = res1.status >= 400;
            const block2 = res2.status >= 400;

            if (block1 && block2) {
                logOutcome("Negative/Zero Quantity Input Vulnerability Audit", true, "Successfully blocked negative/zero quantities at checkout!");
            } else {
                logOutcome("Negative/Zero Quantity Input Vulnerability Audit", false, `Failed. Negative quantity status: ${res1.status}, Zero quantity status: ${res2.status}`);
            }
        } catch (err: any) {
            logOutcome("Negative/Zero Quantity Input Vulnerability Audit", false, err.message);
        }

        // --- TEST CASE 6: Deactivated Coupon Exploitation Block ---
        try {
            console.log("\n🏃 Running Test: Deactivated Coupon Exploitation Block...");
            const tempCouponResult = await pool.query(
                `INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, used_count, is_active, expires_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [`TEMP_OFF_${Date.now()}`, 'fixed', 50, 100, 100, 0, false, new Date(Date.now() + 86400000)]
            );
            const tempCouponId = tempCouponResult.rows[0].id;

            const badPayload = {
                idempotency_key: crypto.randomUUID(),
                guest_details: {
                    full_name: "Coupon Tester",
                    email: "coupon@test.com",
                    mobile_number: "9999999999",
                    address_line1: "123 Coupon St",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001"
                },
                coupon_id: tempCouponId,
                items: [{ sku_id: testSku.sku_id, quantity: 1 }]
            };

            const res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(badPayload)
            });

            await pool.query('DELETE FROM coupons WHERE id = $1', [tempCouponId]);

            if (res.status >= 400) {
                logOutcome("Deactivated Coupon Exploitation Block", true, `Successfully blocked deactivated coupon at checkout with status: ${res.status}`);
            } else {
                logOutcome("Deactivated Coupon Exploitation Block", false, `Failed. Order was successfully created (status: ${res.status}) applying a deactivated coupon!`);
                const resData = await res.json();
                if (resData.id) {
                    await pool.query('DELETE FROM order_items WHERE order_id = $1', [resData.id]);
                    await pool.query('DELETE FROM orders WHERE id = $1', [resData.id]);
                }
            }
        } catch (err: any) {
            logOutcome("Deactivated Coupon Exploitation Block", false, err.message);
        }

        // --- TEST CASE 7: Evergreen Coupon Null-Expiry Checkout Validation ---
        try {
            console.log("\n🏃 Running Test: Evergreen Coupon Null-Expiry Checkout Validation...");
            const tempCouponResult = await pool.query(
                `INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, used_count, is_active, expires_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [`EVERGREEN_${Date.now()}`, 'fixed', 50, 100, 100, 0, true, null]
            );
            const tempCouponId = tempCouponResult.rows[0].id;

            const checkoutPayload = {
                idempotency_key: crypto.randomUUID(),
                guest_details: {
                    full_name: "Evergreen Tester",
                    email: "evergreen@test.com",
                    mobile_number: "9999999999",
                    address_line1: "123 Evergreen St",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001"
                },
                coupon_id: tempCouponId,
                items: [{ sku_id: testSku.sku_id, quantity: 1 }]
            };

            const res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(checkoutPayload)
            });

            const status = res.status;
            let success = status === 201 || status === 200;
            let orderId = null;

            if (success) {
                const resData = await res.json();
                orderId = resData.id;
                success = Number(resData.discount_amount) === 50;
            }

            if (orderId) {
                await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
                await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
            }
            await pool.query('DELETE FROM coupons WHERE id = $1', [tempCouponId]);

            if (success) {
                logOutcome("Evergreen Coupon Null-Expiry Checkout Validation", true, "Evergreen coupon successfully applied at checkout!");
            } else {
                logOutcome("Evergreen Coupon Null-Expiry Checkout Validation", false, `Failed to apply evergreen coupon. Status: ${status}`);
            }
        } catch (err: any) {
            logOutcome("Evergreen Coupon Null-Expiry Checkout Validation", false, err.message);
        }

        // --- TEST CASE 8: Coupon Maximum Usage Limit Exhaustion under High Concurrency ---
        try {
            console.log("\n🏃 Running Test: Coupon Maximum Usage Limit Exhaustion under High Concurrency...");
            const tempCouponResult = await pool.query(
                `INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, used_count, is_active, expires_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [`ONETIME_${Date.now()}`, 'fixed', 50, 100, 1, 0, true, new Date(Date.now() + 86400000)]
            );
            const tempCouponId = tempCouponResult.rows[0].id;

            const orderPayload1 = {
                idempotency_key: crypto.randomUUID(),
                guest_details: {
                    full_name: "Onetime One",
                    email: "one@test.com",
                    mobile_number: "9876543210",
                    address_line1: "123 Limit St",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001"
                },
                coupon_id: tempCouponId,
                items: [{ sku_id: testSku.sku_id, quantity: 1 }]
            };

            const orderPayload2 = {
                idempotency_key: crypto.randomUUID(),
                guest_details: {
                    full_name: "Onetime Two",
                    email: "two@test.com",
                    mobile_number: "9876543211",
                    address_line1: "123 Limit St",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001"
                },
                coupon_id: tempCouponId,
                items: [{ sku_id: testSku.sku_id, quantity: 1 }]
            };

            const o1Res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload1)
            }).then(r => r.json());

            const o2Res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload2)
            }).then(r => r.json());

            const orderId1 = o1Res.id;
            const orderId2 = o2Res.id;

            const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
            const payId1 = `pay_${crypto.randomBytes(8).toString('hex')}`;
            const rzpOrderId1 = o1Res.razorpay?.id || `order_rzp_${crypto.randomBytes(8).toString('hex')}`;
            const rzpSig1 = crypto.createHmac('sha256', secret).update(`${rzpOrderId1}|${payId1}`).digest('hex');

            const payId2 = `pay_${crypto.randomBytes(8).toString('hex')}`;
            const rzpOrderId2 = o2Res.razorpay?.id || `order_rzp_${crypto.randomBytes(8).toString('hex')}`;
            const rzpSig2 = crypto.createHmac('sha256', secret).update(`${rzpOrderId2}|${payId2}`).digest('hex');

            const verifyPayload1 = {
                razorpay_order_id: rzpOrderId1,
                razorpay_payment_id: payId1,
                razorpay_signature: rzpSig1,
                order_id: orderId1
            };

            const verifyPayload2 = {
                razorpay_order_id: rzpOrderId2,
                razorpay_payment_id: payId2,
                razorpay_signature: rzpSig2,
                order_id: orderId2
            };

            const verifyReqs = [verifyPayload1, verifyPayload2].map(payload => 
                fetch(`${API_BASE}/payments/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).then(async r => ({ status: r.status, data: await r.json() }))
            );

            const verifyResults = await Promise.all(verifyReqs);

            const successes = verifyResults.filter(r => r.status === 200);
            const failures = verifyResults.filter(r => r.status !== 200);

            const couponDbCheck = await pool.query('SELECT used_count FROM coupons WHERE id = $1', [tempCouponId]);
            const dbUsedCount = couponDbCheck.rows[0].used_count;

            await pool.query('DELETE FROM payments WHERE order_id IN ($1, $2)', [orderId1, orderId2]);
            await pool.query('DELETE FROM order_items WHERE order_id IN ($1, $2)', [orderId1, orderId2]);
            await pool.query('DELETE FROM orders WHERE id IN ($1, $2)', [orderId1, orderId2]);
            await pool.query('DELETE FROM coupons WHERE id = $1', [tempCouponId]);

            if (successes.length === 1 && failures.length === 1 && dbUsedCount === 1) {
                logOutcome("Coupon Maximum Usage Limit Exhaustion under High Concurrency", true, "Exhaustion concurrency validated. Exactly one checkout using the coupon succeeded, second rejected.");
            } else {
                logOutcome("Coupon Maximum Usage Limit Exhaustion under High Concurrency", false, `Exhaustion failed. Successes: ${successes.length}, Failures: ${failures.length}, used_count in DB: ${dbUsedCount}`);
            }
        } catch (err: any) {
            logOutcome("Coupon Maximum Usage Limit Exhaustion under High Concurrency", false, err.message);
        }

    } catch (err: any) {
        console.error("CRITICAL ERROR IN SUITE: ", err);
        failed++;
    } finally {
        await pool.end();
        console.log("\n==================================================");
        console.log(`📊 DB RESILIENCE REPORT: ${passed} Passed, ${failed} Failed`);
        console.log("==================================================");
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
