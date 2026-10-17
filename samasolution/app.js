'use strict';

/**
 * cPanel / Passenger entry point.
 *
 * Use this file as the "Application startup file" in cPanel's
 * "Setup Node.js App" screen. It checks the Node version, then starts
 * the Express app on the port Passenger provides.
 */

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 5)) {
  console.error('');
  console.error('  Sama Solutions needs Node.js 22.5 or newer.');
  console.error(`  This server is running Node.js ${process.versions.node}.`);
  console.error('');
  console.error('  In cPanel: Setup Node.js App → change the Node.js version to 22.x');
  console.error('  and restart the application. If 22.x is not offered, ask your host');
  console.error('  to enable it, or deploy the same folder on Render/Railway/VPS.');
  console.error('');
  process.exit(1);
}

const app = require('./server');

const port = process.env.PORT || 3000;

// Passenger normally passes a numeric port. Some setups pass a socket path.
const target = /^\d+$/.test(String(port)) ? { port: Number(port), host: '0.0.0.0' } : port;

const server = app.listen(target, () => {
  const where = typeof target === 'string' ? target : `http://0.0.0.0:${target.port}`;
  console.log(`Sama Solutions running on ${where}`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

module.exports = app;
