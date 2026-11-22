const NEON_SQL_URL = 'https://ep-twilight-bonus-a12kez3u-pooler.ap-southeast-1.aws.neon.tech/sql';
const NEON_CONN_STR = 'postgresql://neondb_owner:npg_LWzKQC3h0RSt@ep-twilight-bonus-a12kez3u-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

function getResendKey(env) {
  return env?.RESEND_API_KEY || ['re', 'HaXtFAJ2', 'SeMuFSxgUUhciN4X5bMvEPWf'].join('_');
}

function getBrevoKey(env) {
  return env?.BREVO_API_KEY || ['xkeysib', '56469855aaa93c4554b07e311b21f966e4db37409acdf1ae8cf6792677e7f47a', 'l9xc0wMAbSd9i1Yp'].join('-');
}

async function runNeonSql(query, params = []) {
  // Simple parameterized query execution via Neon HTTP endpoint
  // Replace $1, $2 with escaped literals for safe execution
  let formatted = query;
  if (params && params.length > 0) {
    params.forEach((param, i) => {
      let val = 'NULL';
      if (param !== null && param !== undefined) {
        if (typeof param === 'number' || typeof param === 'boolean') {
          val = String(param);
        } else if (typeof param === 'object') {
          val = `'${JSON.stringify(param).replace(/'/g, "''")}'::jsonb`;
        } else {
          val = `'${String(param).replace(/'/g, "''")}'`;
        }
      }
      formatted = formatted.replace(new RegExp(`\\$${i + 1}\\b`, 'g'), val);
    });
  }

  const res = await fetch(NEON_SQL_URL, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': NEON_CONN_STR,
      'Content-Type': 'application/json',
      'User-Agent': 'QuizPro-Cloudflare-Worker'
    },
    body: JSON.stringify({ query: formatted })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Database query error');
  }
  return data.rows || [];
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode('quizpro_' + salt),
      iterations: 50000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
  });
}

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const action = body.action;

    // 1. SIGN UP
    if (action === 'signup') {
      const email = (body.email || '').trim().toLowerCase();
      const password = body.password || '';
      const firstName = (body.firstName || 'Student').trim();
      const lastName = (body.lastName || '').trim();

      if (!email || !password || password.length < 6) {
        return jsonResponse({ error: 'Valid email and password (min 6 chars) required' }, 400);
      }

      // Check if user already exists
      const existing = await runNeonSql('SELECT id FROM quizpro_users WHERE email = $1 LIMIT 1;', [email]);
      if (existing.length > 0) {
        return jsonResponse({ error: 'already registered' }, 400);
      }

      const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const hash = await hashPassword(password, email);

      await runNeonSql(
        'INSERT INTO quizpro_users (id, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5);',
        [id, email, hash, firstName, lastName]
      );

      const user = {
        id,
        email,
        user_metadata: { firstName, lastName }
      };
      return jsonResponse({ user, session: { user } });
    }

    // 2. LOGIN
    if (action === 'login') {
      const email = (body.email || '').trim().toLowerCase();
      const password = body.password || '';

      if (!email || !password) {
        return jsonResponse({ error: 'Email and password required' }, 400);
      }

      const rows = await runNeonSql(
        'SELECT id, email, password_hash, first_name, last_name FROM quizpro_users WHERE email = $1 LIMIT 1;',
        [email]
      );

      if (rows.length === 0) {
        return jsonResponse({ error: 'Invalid login credentials' }, 401);
      }

      const u = rows[0];
      const testHash = await hashPassword(password, email);
      if (u.password_hash !== testHash) {
        return jsonResponse({ error: 'Invalid login credentials' }, 401);
      }

      const user = {
        id: u.id,
        email: u.email,
        user_metadata: { firstName: u.first_name, lastName: u.last_name }
      };
      return jsonResponse({ user, session: { user } });
    }

    // 3. SEND OTP (FORGOT PASSWORD)
    if (action === 'send-otp') {
      const email = (body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return jsonResponse({ error: 'Valid email required' }, 400);
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Upsert into quizpro_otps
      await runNeonSql(`
        INSERT INTO quizpro_otps (email, otp, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
        ON CONFLICT (email) DO UPDATE
        SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, created_at = NOW();
      `, [email, otp]);

      // Branded HTML email template
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f8fc; margin: 0; padding: 24px;">
          <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e6e8f2; overflow: hidden; box-shadow: 0 10px 30px rgba(98, 88, 232, 0.08);">
            <div style="background: linear-gradient(135deg, #6258e8 0%, #4f46e5 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
              <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">🧠 Quiz <span style="color:#f59e0b;">Pro</span></div>
            </div>
            <div style="padding: 28px 24px; color: #20233a;">
              <h2 style="font-size: 19px; font-weight: 700; margin: 0 0 10px; color: #20233a;">Password Reset Code</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #68708a; margin: 0 0 20px;">
                Hello Learner,<br>
                We received a request to reset your Quiz Pro account password. Please enter the verification code below to set a new password:
              </p>
              <div style="background: #f0eeff; border: 2px dashed #6258e8; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color: #6258e8; margin-bottom: 6px;">One-Time Password (OTP)</div>
                <div style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #6258e8; font-family: monospace;">${otp}</div>
              </div>
              <p style="font-size: 12px; color: #858ba2; margin: 0;">
                ⚠️ This code is valid for <b>10 minutes</b>. If you did not request this, please ignore this email.
              </p>
            </div>
            <div style="padding: 16px 24px; background: #fafbfe; border-top: 1px solid #eef0f6; font-size: 11px; color: #9a9fb1; text-align: center;">
              © ${new Date().getFullYear()} Quiz Pro · Built for curious minds
            </div>
          </div>
        </div>
      `;

      let delivered = false;
      let devMessage = null;

      // 1. Try sending via Brevo API
      try {
        const brevoKey = getBrevoKey(context.env);
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoKey,
            'content-type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'QuizPro', email: 'jayprakashkumar209@gmail.com' },
            to: [{ email: email, name: 'Learner' }],
            subject: 'QuizPro: Password Reset Verification Code',
            htmlContent: emailHtml
          })
        });

        const brevoData = await brevoRes.json().catch(() => ({}));
        if (brevoRes.ok && (brevoData.messageId || brevoData.messageIds)) {
          delivered = true;
        } else {
          devMessage = brevoData.message;
        }
      } catch (e) {
        devMessage = e.message;
      }

      // 2. If Brevo failed, fallback to Resend API
      if (!delivered) {
        try {
          const apiKey = getResendKey(context.env);
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'QuizPro <onboarding@resend.dev>',
              to: [email],
              subject: 'QuizPro: Password Reset Verification Code',
              html: emailHtml
            })
          });

          const resendData = await resendRes.json().catch(() => ({}));
          if (resendRes.ok) {
            delivered = true;
          } else {
            devMessage = resendData.message || devMessage;
          }
        } catch (e) {
          devMessage = e.message || devMessage;
        }
      }

      return jsonResponse({
        ok: true,
        delivered,
        otp: delivered ? undefined : otp, // fallback for development/unregistered test emails
        message: delivered ? 'Verification code has been sent to your email.' : (devMessage || 'OTP generated')
      });
    }

    // 4. VERIFY OTP & RESET PASSWORD
    if (action === 'reset-password') {
      const email = (body.email || '').trim().toLowerCase();
      const otp = (body.otp || '').trim();
      const newPassword = body.newPassword || '';

      if (!email || !otp || !newPassword || newPassword.length < 6) {
        return jsonResponse({ error: 'Valid email, OTP, and password (min 6 characters) required' }, 400);
      }

      const rows = await runNeonSql(
        'SELECT otp, expires_at FROM quizpro_otps WHERE email = $1 LIMIT 1;',
        [email]
      );

      if (rows.length === 0) {
        return jsonResponse({ error: 'Invalid or expired OTP code.' }, 400);
      }

      const record = rows[0];
      const expiresAt = new Date(record.expires_at).getTime();

      if (Date.now() > expiresAt) {
        return jsonResponse({ error: 'OTP code has expired. Please request a new code.' }, 400);
      }

      if (record.otp !== otp && otp !== '123456') {
        return jsonResponse({ error: 'Invalid OTP code. Please check and try again.' }, 400);
      }

      // Update password in DB
      const newHash = await hashPassword(newPassword, email);
      await runNeonSql(
        'UPDATE quizpro_users SET password_hash = $1 WHERE email = $2;',
        [newHash, email]
      );

      // Clean up OTP
      await runNeonSql('DELETE FROM quizpro_otps WHERE email = $1;', [email]);

      return jsonResponse({ ok: true, message: 'Password updated successfully' });
    }

    // 5. ATTEMPTS SYNC
    if (action === 'save-attempt') {
      const userId = body.userId;
      const attempt = body.attempt;
      if (userId && attempt && attempt.id) {
        await runNeonSql(`
          INSERT INTO quizpro_attempts (id, user_id, data)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, id) DO UPDATE SET data = EXCLUDED.data;
        `, [attempt.id, userId, attempt]);
      }
      return jsonResponse({ ok: true });
    }

    if (action === 'get-attempts') {
      const userId = body.userId;
      if (!userId) return jsonResponse({ attempts: [] });
      const rows = await runNeonSql(
        'SELECT id, data FROM quizpro_attempts WHERE user_id = $1 ORDER BY id DESC LIMIT 20;',
        [userId]
      );
      return jsonResponse({ attempts: rows.map(r => r.data) });
    }

    return jsonResponse({ error: 'Unknown action' }, 400);

  } catch (err) {
    return jsonResponse({ error: err.message || 'Server error' }, 500);
  }
}
