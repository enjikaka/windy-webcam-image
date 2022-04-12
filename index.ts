import { serve } from 'https://deno.land/std@0.134.0/http/server.ts';

async function respond (webcamId: string | undefined) {
  if (!webcamId) {
    throw new TypeError('webcamId can not be undefined');
  }

  const windyUrl = new URL(`https://api.windy.com/api/webcams/v2/list/webcam=${webcamId}`);

  windyUrl.searchParams.append('show', 'webcams:location,image');
  windyUrl.searchParams.append('key', Deno.env.get('API_KEY'));

  const response = await fetch(windyUrl.toString());

  if (!response.ok) {
    throw new Error(String(response.status));
  }

  const json = await response.json();

  return new Response(null, {
    status: 302,
    headers: new Headers({
      'Location': json.result.webcams[0].image.daylight.preview
    })
  });
}

function handler(req: Request): Promise<Response> | Response {
  const [, webcamId] = new URL(req.url).pathname;

  try {
    return respond(webcamId);
  } catch (e) {
    return new Response('message' in e ? e.message : null, {
      status: 400
    });
  }
}

console.log("Listening on http://localhost:8000");
await serve(handler);