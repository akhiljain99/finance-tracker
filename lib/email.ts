type DailyEmailArgs = {
  to: string;
  name: string;
  monthLabel: string;
  totalExpense: number;
  totalIncome: number;
  totalInvested: number;
};

export async function sendDailyDigestEmail(args: DailyEmailArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.DIGEST_FROM_EMAIL;

  if (!apiKey || !fromEmail) return false;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111827; max-width: 640px; margin: 0 auto;">
      <h1 style="font-size: 24px; margin: 0 0 8px;">Simple Finance</h1>
      <p style="font-size: 16px; margin: 0 0 20px;">Make finance simple.</p>
      <h2 style="font-size: 18px; margin: 0 0 12px;">Good morning, ${args.name}</h2>
      <p style="margin: 0 0 16px;">Here is your monthly snapshot for <strong>${args.monthLabel}</strong>.</p>
      <ul style="padding-left: 18px; margin: 0 0 16px;">
        <li>Total spending: <strong>$${args.totalExpense.toFixed(2)}</strong></li>
        <li>Total income: <strong>$${args.totalIncome.toFixed(2)}</strong></li>
        <li>Total invested: <strong>$${args.totalInvested.toFixed(2)}</strong></li>
      </ul>
      <p style="margin: 0;">Open your dashboard to compare month-over-month performance.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [args.to],
      subject: `Simple Finance daily digest - ${args.monthLabel}`,
      html,
    }),
  });

  return response.ok;
}
