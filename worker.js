// ============================================================
// Budget Barber — Cloudflare Worker
//
// SETUP:
// 1. Go to https://workers.cloudflare.com and create a new Worker
// 2. Paste this entire file as the Worker code
// 3. Go to Worker → Settings → Variables and Secrets
// 4. Add a secret variable:  GEMINI_API_KEY = AIza...your key
// 5. Save and Deploy
// 6. Copy the Worker URL (e.g. https://budget-barber.yourname.workers.dev)
// 7. Paste that URL into dashboard.html where it says YOUR_CLOUDFLARE_WORKER_URL
// ============================================================

export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // API key lives on the server — never exposed to the browser
    const GEMINI_API_KEY = env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({
        error: 'GEMINI_API_KEY not set. Go to Worker → Settings → Variables and Secrets and add it.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    try {
      const body = await request.json();
      const { payload } = body;

      // ✅ Updated to gemini-2.5-flash-image (current working model)
      const geminiUrl =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await geminiRes.json();

      return new Response(JSON.stringify(data), {
        status: geminiRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
