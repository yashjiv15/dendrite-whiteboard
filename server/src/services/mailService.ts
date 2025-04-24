import { transporter } from '../config/mailConfig';

export const sendInviteMail = async (email: string, sessionId: string) => {
  const link = `${process.env.FRONTEND_URL}/board/${sessionId}`;
  const mailOptions = {
    from: `"Whiteboard App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "You're invited to a Whiteboard Session!",
    html: `<p>Hello,</p>
           <p>You have been invited to join a whiteboard session.</p>
           <p><a href="${link}">Click here to join</a></p>`,
  };

  return transporter.sendMail(mailOptions);
};
