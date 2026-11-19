
export async function onRequestGet({ request, env }) {
  const expected = env.SIMP_X_ADMIN_SECRET;
  if (!expected || request.headers.get("x-admin-secret") !== expected) {
    return Response.json({ error: "Admin authentication failed." }, { status: 401 });
  }

  try {
    const result = await env.DB.prepare(
      "SELECT request_id AS requestId, name, phone, status, created_at AS createdAt, access_code AS accessCode, approved_at AS approvedAt, redeemed_at AS redeemedAt FROM requests ORDER BY created_at DESC"
    ).all();
    return Response.json({ requests: result.results || [] });
  } catch (error) {
    return Response.json({ error: "Could not load requests. Check the D1 database binding." }, { status: 500 });
  }
}
