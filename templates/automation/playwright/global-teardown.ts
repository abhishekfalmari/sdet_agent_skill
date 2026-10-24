import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  // Stop test database
  try {
    execSync('docker-compose -f docker-compose.test.yml down -v', { stdio: 'inherit' });
    console.log('✅ Test database stopped');
  } catch (e) {
    console.warn('⚠️ Could not stop test database:', e.message);
  }

  console.log('✅ Global teardown complete');
}

export default globalTeardown;
