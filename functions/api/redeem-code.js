export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    if (!/^[A-F0-9]{10}$/.test(code)) {
      return Response.json({ error: "Invalid access code." }, { status: 400 });
    }

    const result = await env.DB.prepare(
      "UPDATE requests SET redeemed_at=? WHERE access_code=? AND status='approved' AND redeemed_at IS NULL RETURNING request_id"
    ).bind(new Date().toISOString(), code).first();

    if (!result) {
      return Response.json({ error: "Code is invalid, expired, or already used." }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: "Could not verify code. Try again." }, { status: 500 });
  }
}
