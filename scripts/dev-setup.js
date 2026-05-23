import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const BACKEND_DIR = path.join(ROOT_DIR, 'Backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

console.log('🚀 Starting WellForged Monorepo Setup...');

// 1. Check for .env files
const checkEnv = (dir, name, requiredKeys) => {
    const envPath = path.join(dir, '.env');
    if (!fs.existsSync(envPath)) {
        console.warn(`⚠️  Missing .env in ${name}. Creating from example...`);
        const examplePath = path.join(dir, '.env.example');
        if (fs.existsSync(examplePath)) {
            fs.copyFileSync(examplePath, envPath);
            console.log(`✅ Created ${name}/.env`);
        } else {
            console.error(`❌ No .env.example found in ${name}! Please create it.`);
        }
    }

    // Basic validation
    const content = fs.readFileSync(envPath, 'utf8');
    requiredKeys.forEach(key => {
        if (!content.includes(key)) {
            console.error(`❌ ${name}/.env is missing required key: ${key}`);
        }
    });
};

console.log('\n--- Checking Environments ---');
checkEnv(BACKEND_DIR, 'Backend', ['DB_HOST', 'RAZORPAY_KEY_ID', 'JWT_SECRET']);
checkEnv(FRONTEND_DIR, 'frontend', ['VITE_API_URL', 'VITE_RAZORPAY_KEY_ID']);

// 2. Sync Dependencies
const installDeps = (dir, name) => {
    console.log(`\n--- Syncing ${name} Dependencies ---`);
    try {
        execSync('npm install', { cwd: dir, stdio: 'inherit' });
        console.log(`✅ ${name} ready.`);
    } catch (err) {
        console.error(`❌ Failed to install deps in ${name}`);
    }
};

installDeps(BACKEND_DIR, 'Backend');
installDeps(FRONTEND_DIR, 'frontend');

console.log('\n✨ Setup Complete! Use "npm run dev-all" to start everything.');
