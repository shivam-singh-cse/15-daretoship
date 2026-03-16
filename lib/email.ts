import { Resend } from "resend";

type EmailKind = "welcome" | "mission-reminder" | "demo-day";

function getEmailContent(kind: EmailKind, name?: string) {
  switch (kind) {
    case "welcome":
      return {
        subject: "Welcome to Outwibe",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
            <h2>Welcome${name ? `, ${name}` : ""}</h2>
            <p>You are about to build two real products in 15 days: a fun web game and a useful micro-product.</p>
            <p>Open the dashboard, start today's mission, and keep shipping one step at a time.</p>
          </div>
        `,
      };
    case "mission-reminder":
      return {
        subject: "Your next builder mission is waiting",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
            <h2>Your next mission is ready</h2>
            <p>Take the next small step in your AI Builder Journey today.</p>
            <p>Open your dashboard, complete today's mission, and keep your momentum going.</p>
          </div>
        `,
      };
    case "demo-day":
      return {
        subject: "Demo day is here - launch your products",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
            <h2>Demo day is here</h2>
            <p>Your products are ready to be shared.</p>
            <p>Launch your game, present your micro-product, and show everyone what you built.</p>
          </div>
        `,
      };
  }
}

export async function sendBuilderEmail(
  to: string,
  kind: EmailKind,
  name?: string,
) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    return { skipped: true, reason: "Missing RESEND_API_KEY" };
  }

  const resend = new Resend(key);
  const content = getEmailContent(kind, name);

  return resend.emails.send({
    from: "Outwibe <hello@updates.outwibe.com>",
    to,
    subject: content.subject,
    html: content.html,
  });
}
