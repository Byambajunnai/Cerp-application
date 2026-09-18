const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://192.168.119.21:8981',
    changeOrigin: true,

    pathRewrite: function (path) {
      const newPath = '/CERP/rest' + path;
      console.log('PROXY PATH:', path, '->', newPath);
      return newPath;
    },

    on: {
      proxyReq: (proxyReq, req) => {
        console.log('REQUEST:', req.method, req.originalUrl);
      },
    },
  })
);

app.listen(3001, () => {
  console.log('CERP Proxy running: http://localhost:3001');
});