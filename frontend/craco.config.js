module.exports = {
  webpack: {
    configure: {
      ignoreWarnings: [
        {
          module: /node_modules\/@antv/,
        },
      ],
      
    },
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://10.0.0.89:5125',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
    // ...
  }
}; 