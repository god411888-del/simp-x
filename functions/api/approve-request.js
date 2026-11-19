export async function onRequestPost({ request, env }) {
  const expected = env.SIMP_X_ADMIN_SECRET;
  if (!expected || request.headers.get("x-admin-secret") !== expected) {
    return Response.json({ error: "Admin authentication failed." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const requestId = String(body.requestId || "").trim();
    if (!requestId) return Response.json({ error: "Request ID is required." }, { status: 400 });

    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    const code = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const approvedAt = new Date().toISOString();

    const result = await env.DB.prepare(
      "UPDATE requests SET status='approved', access_code=?, approved_at=? WHERE request_id=? AND status='pending' RETURNING name, phone"
    ).bind(code, approvedAt, requestId).first();

    if (!result) {
      const existing = await env.DB.prepare(
        "SELECT status FROM requests WHERE request_id=?"
      ).bind(requestId).first();
      if (!existing) return Response.json({ error: "Request not found." }, { status: 404 });
      return Response.json({ error: "This request is already approved." }, { status: 409 });
    }

    return Response.json({ ok: true, code, name: result.name, phone: result.phone });
  } catch (error) {
    return Response.json({ error: "Could not approve request." }, { status: 500 });
  }
}
