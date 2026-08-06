function sseHeaders() {
  return {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no'
  };
}

export async function onRequestGet() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const connected = {
        ok: true,
        service: 'serarah-events-pages',
        ts: new Date().toISOString()
      };
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify(connected)}\n\n`));

      let ticks = 0;
      const timer = setInterval(() => {
        ticks += 1;
        controller.enqueue(encoder.encode(`: ping ${ticks}\n\n`));
      }, 15000);

      // Keep stream healthy for a while; the browser will reconnect if closed.
      setTimeout(() => {
        clearInterval(timer);
        controller.close();
      }, 10 * 60 * 1000);
    }
  });

  return new Response(stream, {
    status: 200,
    headers: sseHeaders()
  });
}
