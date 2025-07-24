function buildNotificationEmailHTML(message) {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;">
      <h2 style="color: #4f46e5; margin-top: 0;">LearnPro Notification</h2>
      <p style="font-size: 16px; line-height: 1.4;">${message}</p>
      <p style="margin-top: 24px; font-size: 14px; color: #64748b;">Thank you for using LearnPro.</p>
    </div>
  </div>
  `;
}

module.exports = buildNotificationEmailHTML;
