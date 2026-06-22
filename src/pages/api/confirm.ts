import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { verifySubscribeToken } from '../../lib/subscribe-token';
import { welcomeEmail } from '../../lib/emails';

export const prerender = false; // on-demand function (needs server runtime)

export const GET: APIRoute = async ({ url, site, redirect }) => {
  const base = (site?.toString().replace(/\/$/, '')) || import.meta.env.SITE || 'https://avinovo.com';
  const apiKey = import.meta.env.RESEND_API_KEY;
  const secret = import.meta.env.SUBSCRIBE_TOKEN_SECRET;
  const audienceId = import.meta.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !secret) {
    console.error('[confirm] missing RESEND_API_KEY or SUBSCRIBE_TOKEN_SECRET');
    return redirect('/subscribed?status=error', 302);
  }

  const token = url.searchParams.get('token') ?? '';
  const email = token ? await verifySubscribeToken(token, secret) : null;
  if (!email) {
    return redirect('/subscribed?status=invalid', 302);
  }

  const resend = new Resend(apiKey);

  // Now that consent is confirmed, add the contact to the audience (idempotent —
  // a duplicate just errors, which we treat as already-subscribed and continue).
  if (audienceId) {
    const { error: addErr } = await resend.contacts.create({ email, audienceId, unsubscribed: false });
    if (addErr) console.warn('[confirm] contacts.create (continuing):', addErr);
  } else {
    console.warn('[confirm] no RESEND_AUDIENCE_ID set — skipping audience add');
  }

  // Welcome email — non-fatal: confirmation already succeeded.
  const from = import.meta.env.RESEND_FROM || 'Avinovo <hello@avinovo.com>';
  const { subject, html } = welcomeEmail(base);
  await resend.emails
    .send({ from, to: email, subject, html })
    .catch((e) => console.error('[confirm] welcome send failed:', e));

  return redirect('/subscribed?status=confirmed', 302);
};
