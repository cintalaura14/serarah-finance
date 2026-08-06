function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export async function onRequestGet(context) {
  const env = context.env || {};
  return json({
    ok: true,
    service: 'serarah-ai-pages',
    gemini: {
      model: env.GEMINI_MODEL || 'gemini-2.0-flash',
      configured: !!env.GEMINI_API_KEY
    },
    openrouter: {
      model: env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      configured: !!env.OPENROUTER_API_KEY
    }
  });
}
