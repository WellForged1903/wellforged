#!/usr/bin/env bash

# stand-alone test runner script for WellForged

# Ensure we exit immediately if any subcommand fails
set -e

# Resolve directory paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Disable rate limiters and set test mode environments for the test runner session
export DISABLE_RATE_LIMITER=true
export NODE_ENV=test

echo "=================================================="
# Verify PostgreSQL database configuration is active
echo "🔍 AUDITING DATABASE SYSTEM CONNECTIVITY..."
echo "=================================================="
node -e "
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: '$ROOT_DIR/Backend/.env' });
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432),
});
pool.query('SELECT NOW()').then(res => {
    console.log('✅ DB Connection Successful. Time: ' + res.rows[0].now);
    process.exit(0);
}).catch(err => {
    console.error('❌ DB Connection Failed: ', err.message);
    process.exit(1);
});
" || { echo "DB Connection failed. Ensure PostgreSQL is running locally and credentials in Backend/.env are correct."; exit 1; }

echo ""
echo "=================================================="
echo "🌐 PROBING DEV SERVERS STATUS..."
echo "=================================================="

BACKEND_UP=false
FRONTEND_UP=false

if curl -sf http://localhost:5001/health > /dev/null; then
    BACKEND_UP=true
    echo "✅ Backend is active on port 5001."
fi

if curl -sf http://localhost:8082 > /dev/null; then
    FRONTEND_UP=true
    echo "✅ Frontend is active on port 8082."
fi

DEV_PID=""

# Cleanup hook on script termination
cleanup() {
    if [ -n "$DEV_PID" ]; then
        echo ""
        echo "=================================================="
        echo "🛑 SHUTTING DOWN AUTO-BOOTED DEV SERVERS..."
        echo "=================================================="
        # Kill the dev process tree gracefully
        pkill -P $DEV_PID || kill $DEV_PID || true
    fi
}
trap cleanup EXIT

# If servers are not active, boot them in background
if [ "$BACKEND_UP" = false ] || [ "$FRONTEND_UP" = false ]; then
    echo "ℹ️ Booting local dev servers concurrently in background..."
    
    # Start dev server from the project root
    cd "$ROOT_DIR"
    npm run dev-all &
    DEV_PID=$!
    
    echo "⏳ Waiting for servers to bind to ports 5001 and 8082..."
    SERVERS_READY=false
    for i in {1..30}; do
        if curl -sf http://localhost:5001/health > /dev/null && curl -sf http://localhost:8082 > /dev/null; then
            echo "✅ Backend and Frontend servers are online and ready!"
            SERVERS_READY=true
            break
        fi
        sleep 2
    done
    
    if [ "$SERVERS_READY" = false ]; then
        echo "❌ Error: Servers failed to start within 60 seconds."
        exit 1
    fi
fi

# Go back to testing directory
cd "$SCRIPT_DIR"

echo ""
echo "=================================================="
echo "⚙️ RUNNING DATABASE & API RESILIENCE SUITE..."
echo "=================================================="
# Run Database resilience suite
npm run test:resilience

echo ""
echo "=================================================="
echo "🎭 PREPARING PLAYWRIGHT BROWSERS..."
echo "=================================================="
# Silently download chromium dependencies inside our testing suite if missing
npx playwright install chromium

echo ""
echo "=================================================="
echo "🚀 EXECUTING PLAYWRIGHT BROWSER INTEGRATION SPECS..."
echo "=================================================="
# Run E2E test suite sequential execution
npx playwright test

echo ""
echo "=================================================="
echo "🎉 ALL AUTOMATED DIAGNOSTICS PASSED SUCCESSFULLY!"
echo "=================================================="
