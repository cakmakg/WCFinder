// Set test environment variables before anything loads
// This file is referenced by jest.config.js setupFiles
process.env.NODE_ENV = 'test';
process.env.ACCESS_KEY = 'test-access-key-secret';
process.env.REFRESH_KEY = 'test-refresh-key-secret';
process.env.SECRET_KEY = 'test-secret-key-for-password';
process.env.PORT = '0';
process.env.PAGE_SIZE = '20';
