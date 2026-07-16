/**
 * Vercel serverless function — API proxy for VirtuStaff backend.
 * Handles /api/v1/* requests by forwarding to the Hono backend.
 */

import type { IncomingMessage, ServerResponse } from 'http';

const BACKEND_URL = process.env.VITE_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Build the target URL
  const path = req.url || '/';
  const targetUrl = `${BACKEND_URL}${path}`;

  // Forward the request to the backend
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
    }

    // Remove host header to avoid conflicts
    headers.delete('host');

    const body = req.method === 'GET' || req.method === 'HEAD'
      ? undefined
      : await new Promise<string>((resolve) => {
          let data = '';
          req.on('data', (chunk) => (data += chunk));
          req.on('end', () => resolve(data));
        });

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Forward the response back
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      // Don't forward transfer-encoding or content-encoding
      if (key !== 'transfer-encoding' && key !== 'content-encoding') {
        responseHeaders[key] = value;
      }
    });

    res.writeHead(response.status, responseHeaders);
    const text = await response.text();
    res.end(text);
  } catch (err) {
    console.error('[API Proxy] Error:', err);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: { code: 'proxy_error', message: 'Backend unreachable' },
    }));
  }
}