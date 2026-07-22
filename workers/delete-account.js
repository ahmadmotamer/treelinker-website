import bcrypt from 'bcryptjs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== 'POST') {
      return reply({ success: false, reason: 'Method not allowed' }, 405);
    }

    let email, password;
    try {
      const body = await request.json();
      email = (body.email ?? '').trim().toLowerCase();
      password = body.password ?? '';
    } catch {
      return reply({ success: false, reason: 'Invalid request body' }, 400);
    }

    if (!email || !password) {
      return reply({ success: false, reason: 'Email and password are required' }, 400);
    }

    // Fetch user by email
    let userId, storedHash;
    try {
      const rows = await neo4j(env,
        'MATCH (u:User {email: $email}) RETURN u.id AS id, u.password AS hash',
        { email },
      );
      if (!rows.length) {
        return reply({ success: false, reason: 'Invalid email or password' }, 401);
      }
      userId = rows[0].id;
      storedHash = rows[0].hash;
    } catch {
      return reply({ success: false, reason: 'Service unavailable. Please try again.' }, 503);
    }

    // Verify password against stored bcrypt hash
    const isValid = await bcrypt.compare(password, storedHash);
    if (!isValid) {
      return reply({ success: false, reason: 'Invalid email or password' }, 401);
    }

    // Delete all user data
    try {
      await neo4j(env,
        `MATCH (u:User {id: $id})
         OPTIONAL MATCH (u)-[:HAS_DEVICE]->(t:DeviceToken)
         DETACH DELETE u, t`,
        { id: userId },
      );
      await neo4j(env,
        'MATCH (r:PasswordResetRequest {userId: $id}) DELETE r',
        { id: userId },
      );
    } catch {
      return reply({ success: false, reason: 'Failed to delete account. Please try again.' }, 500);
    }

    return reply({ success: true });
  },
};

async function neo4j(env, statement, parameters = {}) {
  const auth = btoa(`${env.NEO4J_USER}:${env.NEO4J_PASSWORD}`);
  const res = await fetch(`${env.NEO4J_URI}/db/neo4j/tx/commit`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ statements: [{ statement, parameters }] }),
  });

  if (!res.ok) throw new Error(`Neo4j HTTP ${res.status}`);

  const data = await res.json();
  if (data.errors?.length) throw new Error(data.errors[0].message);

  const result = data.results?.[0];
  if (!result) return [];

  return result.data.map(({ row }) => {
    const obj = {};
    result.columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function reply(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
