import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

export interface WeeklyChildSummary {
  name: string;
  grade: number;
  xpEarned: number;
  attemptsCount: number;
  correctCount: number;
  badgesEarned: string[];
  streakCount: number;
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? 'noreply@koblio.com';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly enabled: boolean;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    this.enabled = !!apiKey;
    if (apiKey) sgMail.setApiKey(apiKey);
  }

  async sendWeeklyDigest(
    to: string,
    parentName: string,
    children: WeeklyChildSummary[],
  ): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(
        `EmailService disabled (no SENDGRID_API_KEY). Would send to ${to}`,
      );
      return;
    }

    const html = this.buildDigestHtml(parentName, children);

    await sgMail.send({
      to,
      from: FROM_EMAIL,
      subject: `Koblio — Weekly Progress Report`,
      html,
    });

    this.logger.log(`Weekly digest sent to ${to}`);
  }

  private buildDigestHtml(
    parentName: string,
    children: WeeklyChildSummary[],
  ): string {
    const childRows = children
      .map((c) => {
        const accuracy =
          c.attemptsCount === 0
            ? 'N/A'
            : `${Math.round((c.correctCount / c.attemptsCount) * 100)}%`;

        const badgeList =
          c.badgesEarned.length > 0 ? c.badgesEarned.join(', ') : '—';

        return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${c.name} (Grade ${c.grade})</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${c.xpEarned}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${c.attemptsCount}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${accuracy}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${c.streakCount} days</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${badgeList}</td>
        </tr>`;
      })
      .join('');

    const emptyState =
      children.length === 0
        ? `<p style="color:#6b7280;">No linked children found.</p>`
        : '';

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#111827;max-width:700px;margin:0 auto;padding:24px;">
  <h1 style="color:#4f46e5;">Koblio Weekly Progress Report</h1>
  <p>Hi ${parentName},</p>
  <p>Here's a summary of your child's activity on Koblio over the past 7 days:</p>
  ${emptyState}
  ${
    children.length > 0
      ? `
  <table style="width:100%;border-collapse:collapse;margin-top:16px;">
    <thead>
      <tr style="background:#f9fafb;">
        <th style="padding:10px;text-align:left;border-bottom:2px solid #e5e7eb;">Child</th>
        <th style="padding:10px;text-align:center;border-bottom:2px solid #e5e7eb;">XP Earned</th>
        <th style="padding:10px;text-align:center;border-bottom:2px solid #e5e7eb;">Problems</th>
        <th style="padding:10px;text-align:center;border-bottom:2px solid #e5e7eb;">Accuracy</th>
        <th style="padding:10px;text-align:center;border-bottom:2px solid #e5e7eb;">Streak</th>
        <th style="padding:10px;text-align:left;border-bottom:2px solid #e5e7eb;">Badges Earned</th>
      </tr>
    </thead>
    <tbody>${childRows}</tbody>
  </table>`
      : ''
  }
  <p style="margin-top:24px;color:#6b7280;font-size:13px;">
    Keep it up! Log in to <a href="https://koblio.com" style="color:#4f46e5;">koblio.com</a> to see full details.
  </p>
  <p style="color:#6b7280;font-size:12px;">
    You're receiving this because you're a parent on Koblio.
    <a href="https://koblio.com/settings/notifications" style="color:#6b7280;">Unsubscribe</a>
  </p>
</body>
</html>`;
  }
}
