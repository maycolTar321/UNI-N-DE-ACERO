require('node-fetch');

// Polyfill fetch for node
global.fetch = require('node-fetch');

// We will import the actual lib/api.ts or just copy the file contents but transpile it
