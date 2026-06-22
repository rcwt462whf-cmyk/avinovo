// On-brand Avinovo transactional emails — warm, editorial, European.
// Inline styles + table layout for email-client compatibility. No emoji in headings.

const C = {
  bg: '#F5F0E8',
  card: '#FDFAF6',
  text: '#4A2518',
  muted: '#7B503C',
  border: '#DDD5C8',
};

function shell(previewText: string, heading: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading}</title></head>
<body style="margin:0;padding:0;background:${C.bg};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${C.card};border:1px solid ${C.border};border-radius:10px;">
<tr><td style="padding:40px 40px 4px;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:${C.muted};">Avinovo</div>
</td></tr>
<tr><td style="padding:10px 40px 0;">
<h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:${C.text};font-weight:600;">${heading}</h1>
</td></tr>
<tr><td style="padding:16px 40px 38px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${C.text};">
${inner}
</td></tr>
</table>
<div style="max-width:520px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${C.muted};padding:18px 8px;text-align:center;">
Avinovo — interior design ideas for the home you live in
</div>
</td></tr></table></body></html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;"><tr><td style="border-radius:8px;background:${C.text};">
<a href="${href}" style="display:inline-block;padding:13px 26px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:${C.card};text-decoration:none;border-radius:8px;">${label}</a>
</td></tr></table>`;
}

export function confirmEmail(confirmUrl: string): { subject: string; html: string } {
  const inner = `
<p style="margin:0 0 18px;">Thanks for subscribing to Avinovo. Before we send anything, we just need to know this address is really yours.</p>
${button(confirmUrl, 'Confirm subscription')}
<p style="margin:22px 0 0;font-size:14px;color:${C.muted};">If the button doesn't work, paste this link into your browser:<br><a href="${confirmUrl}" style="color:${C.muted};word-break:break-all;">${confirmUrl}</a></p>
<p style="margin:18px 0 0;font-size:14px;color:${C.muted};">Didn't sign up? You can safely ignore this — nothing happens until you confirm.</p>`;
  return {
    subject: 'Confirm your Avinovo subscription',
    html: shell('Confirm your subscription to Avinovo.', 'One quick confirmation', inner),
  };
}

export function welcomeEmail(siteUrl: string): { subject: string; html: string } {
  const inner = `
<p style="margin:0 0 16px;">You're confirmed — welcome to Avinovo.</p>
<p style="margin:0 0 20px;">From here you'll get our considered take on interiors: real-world ideas, specific finds, and the occasional guide worth keeping. No noise, and you can leave anytime from the link at the bottom of any email.</p>
${button(siteUrl, 'Browse the latest')}`;
  return {
    subject: 'Welcome to Avinovo',
    html: shell("You're confirmed — welcome to Avinovo.", "You're in", inner),
  };
}
