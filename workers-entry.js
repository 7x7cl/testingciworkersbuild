addEventListener('fetch', evt => {
  evt.respondWith(handleIncomingRequest(evt.request))
})

async function handleIncomingRequest(req) {
  const reqUrl = new URL(req.url);
  const pagePath = reqUrl.pathname;
  
  if (pagePath === '/' || pagePath === '/index.html') {
    return new Response(buildHtmlPage(), {
      headers: { 'content-type': 'text/html;charset=UTF-8' }
    })
  }
  
  return new Response('Resource not available', { status: 404 })
}

function buildHtmlPage() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>CF Workers Vite App</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wrapper {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 600px;
    }
    h1 {
      color: #667eea;
      margin-bottom: 1.5rem;
      font-size: 2rem;
    }
    .success-badge {
      background: #10b981;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 1.5rem;
      font-weight: 600;
    }
    p {
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <h1>🎉 Cloudflare Workers Deployment</h1>
    <div class="success-badge">✓ Active and Running</div>
    <p>This Vite application was successfully built and deployed to Cloudflare Workers.</p>
    <p>During the build process, all CI environment variables were logged to the console for debugging purposes.</p>
  </div>
</body>
</html>`
}
