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
      '/go2rtc/api/onvif': {
        target: 'http://10.0.0.89:5123',
        changeOrigin: true
      },
      '/api': {
        target: 'http://10.0.0.89:5123',
        changeOrigin: true
      }
    }
    // ...
  }
}; 