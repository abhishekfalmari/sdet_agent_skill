import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Start test database
  try {
    execSync('docker-compose -f docker-compose.test.yml up -d db', { stdio: 'inherit' });
    console.log('✅ Test database started');
  } catch (e) {
    console.warn('⚠️ Could not start test database:', e.message);
  }

  // Run migrations
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations applied');
  } catch (e) {
    console.warn('⚠️ Could not run migrations:', e.message);
  }

  // Seed test data
  try {
    execSync('npm run seed:test', { stdio: 'inherit' });
    console.log('✅ Test data seeded');
  } catch (e) {
    console.warn('⚠️ Could not seed test data:', e.message);
  }

  // Warm up application
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  try {
    const fetch = (await import('node-fetch')).default;
    await fetch(baseURL);
    console.log('✅ Application warmed up');
  } catch (e) {
    console.warn('⚠️ Could not warm up application:', e.message);
  }

  console.log('✅ Global setup complete');
}

export default globalSetup;
