import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (email, username, password, role, url) => {
  try {
    const mailOptions = {
      from: `"Reparv" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your ${role} Account Details`,
      html: `
        <p>Hello,</p>
        <p>You have been assigned as a <strong>${role}</strong>.</p>
        <p>This is Your URL for Login: <strong>${url}</strong>.</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in and update your password for security.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>www.reparv.in</strong></p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error("Error sending email:", error.message || error);
  }
};

export default sendEmail;