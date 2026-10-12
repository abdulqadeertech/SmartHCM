"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const index_js_1 = require("./config/index.js");
const server = app_js_1.app.listen(index_js_1.config.port, () => {
    console.log(`🚀 NovaHCM Enterprise API is running on http://localhost:${index_js_1.config.port}`);
    console.log(`📊 Health check available at http://localhost:${index_js_1.config.port}/health`);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
