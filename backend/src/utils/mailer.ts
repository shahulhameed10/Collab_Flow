import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendInvitationEmail = async (
  to: string,
  workspaceName: string,
  invitedBy: string
) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `You're invited to join ${workspaceName}`,
    html: `
      <p>Hello,</p>
      <p><strong>${invitedBy}</strong> has invited you to join the workspace <strong>${workspaceName}</strong>.</p>
      <p><a href="http://localhost:5173/login">Click here to join</a></p>
    `,
  });

  console.log("✅ Email sent:", info.messageId);
};
