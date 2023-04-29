const http = require('http');
const httpProxy = require('http-proxy');

const args = process.argv.slice(2);
if (args.length < 1) {  
  console.log('Usage: yarn start <symbols-server-url> [proxy-port-number]');
  process.exit(1);
}

const symbolsServer = args[0];
const proxyPortNumber = args[1] || 3000;

const proxy = httpProxy.createProxyServer({
  secure: false,
  changeOrigin: true,
  rejectUnauthorized: false
});

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: symbolsServer }, (err) => {
    console.error(err);
  });
  proxy.on('proxyRes', (proxyRes, req, res) => {
    console.log(`Requested URL: ${req.url}, Response status code: ${proxyRes.statusCode}`);
    if (proxyRes.statusCode === 403) {
      proxyRes.statusCode = 404;
    }
  });
});

proxy.on('proxyReq', (proxyReq, req, res) => {
  console.log(`Proxy request headers: ${JSON.stringify(proxyReq.getHeaders(), null, 2)}`);
});

proxy.on('proxyRes', (proxyRes, req, res) => {
  console.log(`Proxy response headers: ${JSON.stringify(proxyRes.headers, null, 2)}`);
});

server.listen(proxyPortNumber, () => {
  console.log('Server started on port ' + proxyPortNumber + ' to proxy ' + symbolsServer + ' ');
});