const STATE_ID = "main";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

async function readState(env) {
  const row = await env.DB.prepare("SELECT data FROM app_state WHERE id = ?").bind(STATE_ID).first();
  if (!row || !row.data) return json({});
  return new Response(row.data, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

async function writeState(request, env) {
  const configuredSecret = env.ADMIN_SECRET || "";
  const providedSecret = request.headers.get("x-admin-secret") || "";
  if (!configuredSecret || providedSecret !== configuredSecret) {
    return json({ ok: false, error: "Forbidden" }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  if (!body || !Array.isArray(body.orders) || !body.stats || !body.copy) {
    return json({ ok: false, error: "Invalid queue state" }, 400);
  }

  await env.DB.prepare(`
    INSERT INTO app_state (id, data, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).bind(STATE_ID, JSON.stringify(body), new Date().toISOString()).run();

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/state") {
      if (!env.DB) return json({ ok: false, error: "Missing D1 binding DB" }, 500);
      if (request.method === "GET") return readState(env);
      if (request.method === "POST") return writeState(request, env);
      return json({ ok: false, error: "Method not allowed" }, 405);
    }

    return env.ASSETS.fetch(request);
  }
};