const http = require('http');
const https = require('https');
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node server.js <remote-server-url> <server-port>');
  process.exit(1);
}

const remoteServerUrl = args[0];
const serverPort = parseInt(args[1]);

const forbiddenFiles = [
  '/ntdll.pdb', '/kernelbase.pdb', '/gdi32full.pdb', '/shell32.pdb', '/Windows.Storage.pdb',
  '/urlmon.pdb', '/iertutil.pdb', '/iphlpapi.pdb', '/wintrust.pdb', '/UIAutomationCore.pdb',
  '/wevtapi.pdb', '/TextInputFramework.pdb', '/CoreMessaging.pdb', '/D3DCompiler_47.pdb',
  '/nvcuvid64.pdb', '/nvcuda_loader.pdb', '/nvcuda.pdb', '/nvapi64.pdb', '/TextShaping.pdb',
];

const server = http.createServer((req, res) => {
  const fileUrl = `${remoteServerUrl}${req.url}`;

  console.log(`Requested URL: ${fileUrl}`);

  // Check if the request is for one of the forbidden files
  if (forbiddenFiles.includes(req.url)) {
    console.log(`Response status code: 403 (Forbidden)`);
    res.statusCode = 403;
    res.end();
    return;
  }

  // Download the file from the remote server
  const download = https.get(fileUrl, (downloadRes) => {
    // Check if the response is successful
    if (downloadRes.statusCode === 200) {
      // Set the appropriate headers for the file
      res.setHeader('Content-Disposition', `attachment; filename="${req.url}"`);

      // Log the response headers
      console.log(`Response headers: ${JSON.stringify(downloadRes.headers, null, 2)}`);

      // Pipe the downloaded file to the response
      downloadRes.pipe(res);
    } else if (downloadRes.statusCode === 403) {
      console.log(`Response status code: ${downloadRes.statusCode}`);
      res.statusCode = 404;
      res.end();
    } else {
      console.log(`Response status code: ${downloadRes.statusCode}`);
      res.statusCode = downloadRes.statusCode;
      res.end();
    }
  });

  download.on('error', (error) => {
    console.error(`Error downloading file: ${error.message}`);
    res.statusCode = 500;
    res.end();
  });
});

server.listen(serverPort, () => {
  console.log(`Server started on port ${serverPort}`);
});
