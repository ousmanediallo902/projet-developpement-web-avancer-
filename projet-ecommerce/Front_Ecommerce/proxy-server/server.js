// server.js
const fs = require('fs');
const https = require('https');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Chemin vers ton Angular dev server HTTP
const ANGULAR_DEV_SERVER = 'http://localhost:4200';

// SSL options
const sslOptions = {
  key: fs.readFileSync('../ssl/key.pem'),
  cert: fs.readFileSync('../ssl/cert.pem')
};

// Proxy toutes les requêtes vers Angular
app.use(
  '/',
  createProxyMiddleware({
    target: ANGULAR_DEV_SERVER,
    changeOrigin: true,
    ws: true
  })
);

// Lancer le serveur HTTPS
https.createServer(sslOptions, app).listen(4300, () => {
  console.log('Angular HTTPS accessible sur https://localhost:4300');
});
