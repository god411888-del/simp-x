export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 50);
    const phone = String(body.phone || "").trim().slice(0, 24);
    if (!name || !phone) {
      return Response.json({ error: "Name and WhatsApp number are required." }, { status: 400 });
    }

    const requestId = crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO requests (request_id, name, phone, status, created_at) VALUES (?, ?, ?, 'pending', ?)"
    ).bind(requestId, name, phone, createdAt).run();

    return Response.json({ ok: true, requestId });
  } catch (error) {
    return Response.json({ error: "Could not save request. Please try again." }, { status: 500 });
  }
}
