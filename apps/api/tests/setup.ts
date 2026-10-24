const url = process.env.TEST_DATABASE_URL ?? 'postgresql://autovault:test_only_password@localhost:5433/autovault_test';
const parsed = new URL(url);
if (parsed.pathname !== '/autovault_test' || !['localhost','127.0.0.1'].includes(parsed.hostname) || parsed.port !== '5433') throw new Error('Refusing unsafe test database: requires localhost:5433/autovault_test');
process.env.DATABASE_URL = url;
process.env.JWT_SECRET = 'test-only-secret-not-for-production-123456789';
process.env.NODE_ENV = 'test';
