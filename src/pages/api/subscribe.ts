import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createSubscribeToken } from '../../lib/subscribe-token';
import { confirmEmail } from '../../lib/emails';

export const prerender = false; // on-demand function (needs server runtime)

const json = (obj: unknown, status: number) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request, site }) => {
  const data = await request.formData();
  const email = data.get('email')?.toString().trim().toLowerCase();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const secret = import.meta.env.SUBSCRIBE_TOKEN_SECRET;
  if (!apiKey || !secret) {
    console.error('[subscribe] missing RESEND_API_KEY or SUBSCRIBE_TOKEN_SECRET');
    return json({ error: 'Something went wrong. Try again.' }, 500);
  }

  // Double opt-in: do NOT add to the audience yet — only send a confirmation link.
  const base = (site?.toString().replace(/\/$/, '')) || import.meta.env.SITE || 'https://avinovo.com';
  const from = import.meta.env.RESEND_FROM || 'Avinovo <hello@avinovo.com>';
  const token = await createSubscribeToken(email, secret);
  const confirmUrl = `${base}/api/confirm?token=${encodeURIComponent(token)}`;

  const resend = new Resend(apiKey);
  const { subject, html } = confirmEmail(confirmUrl);
  const { error } = await resend.emails.send({ from, to: email, subject, html });

  if (error) {
    console.error('[subscribe] resend send failed:', error);
    return json({ error: 'Something went wrong. Try again.' }, 500);
  }

  return json({ success: true }, 200);
};
