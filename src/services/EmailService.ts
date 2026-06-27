import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'admin@dse00.com',
    pass: 'tiberxfsyzslqnud',
  },
});

export async function sendSuccessNotification(
  toEmail: string,
  earnings: number,
  details: string,
  slotScreenshot?: Buffer | null
): Promise<void> {
  if (!toEmail) return;

  const earningsStr = `$${earnings.toFixed(2)}`;
  const attachments: Mail.Attachment[] = [];

  if (slotScreenshot) {
    attachments.push({
      filename: 'slot.png',
      content: slotScreenshot,
      cid: 'slot-screenshot',
    });
  }

  const imgHtml = slotScreenshot
    ? `<p><img src="cid:slot-screenshot" alt="Slot screenshot" style="max-width:100%;border-radius:6px;" /></p>`
    : '';

  await transporter.sendMail({
    from: '"Amazon Flex Bot" <admin@dse00.com>',
    to: toEmail,
    subject: `Slot Grabbed! ${earningsStr}`,
    text: `Your Amazon Flex bot successfully grabbed a slot.\n\n${details}`,
    html: `
      <h2 style="color:#2ea44f">Slot Grabbed! ${earningsStr}</h2>
      <p style="font-size:16px">${details.replace(/\n/g, '<br>')}</p>
      ${imgHtml}
    `,
    attachments,
  });

  console.log(`[EmailService] Notification sent to ${toEmail} for ${earningsStr}`);
}
