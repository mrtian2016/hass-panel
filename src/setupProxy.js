const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5125', // 后端服务地址
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // 不重写路径
      },
      // 自定义错误处理
      onError: (err, req, res) => {
        console.error('代理请求错误:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ message: '代理请求失败' }));
      },
      // 添加请求日志
      onProxyReq: (proxyReq, req, res) => {
        console.log('代理请求:', req.method, req.path);
      },
      // 添加响应日志
      onProxyRes: (proxyRes, req, res) => {
        console.log('代理响应:', proxyRes.statusCode, req.path);
      },
    })
  );
}; 