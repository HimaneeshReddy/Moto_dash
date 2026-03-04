import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter using SMTP (defaulting to Gmail layout, easy to adapt)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your preferred service, e.g., 'gmail', 'outlook', or provide host/port
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // For Gmail, use an App Password if 2FA is enabled
    },
});

export const sendInviteEmail = async (contactEmail, companyEmail, role, organizationName, inviteToken, frontendOrigin) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        // Pass the companyEmail in the URL so it's auto-filled
        const inviteLink = `${frontendUrl}?mode=register&token=${inviteToken}&email=${encodeURIComponent(companyEmail)}`;

        const mailOptions = {
            from: `"DashFlow Alerts" <${process.env.EMAIL_USER}>`,
            to: contactEmail,
            subject: `Welcome to ${organizationName}! Your new Company Login is ready.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #3457B2;">Welcome to DashFlow!</h2>
                    <p>You have been invited to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p>
                    <p style="background-color: #f0fdf4; padding: 12px; border-left: 4px solid #16a34a; font-size: 15px;">
                        Your new company login email is: <strong>${companyEmail}</strong>
                    </p>
                    <p>Click the button below to accept your invitation, set your password, and activate your account:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${inviteLink}" style="background-color: #3457B2; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Accept Invitation</a>
                    </div>
                    <p>If the button doesn't work, you can also copy and paste the following token into the registration page:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 6px; font-family: monospace; word-break: break-all; margin-bottom: 20px;">
                        ${inviteToken}
                    </div>
                    <p style="font-size: 12px; color: #888;">This invite link will expire in 7 days.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Invite email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending invite email:', error);
        throw new Error('Failed to send invite email. Please check your email configuration.');
    }
};

export const sendSupportEmail = async (name, userEmail, type, subject, message) => {
    try {
        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            replyTo: userEmail,
            to: process.env.EMAIL_USER, // The admin's email
            subject: `[DashFlow Support - ${type.toUpperCase()}] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #3457B2; border-bottom: 2px solid #3457B2; padding-bottom: 10px;">New Support Request: ${type}</h2>
                    <p><strong>From:</strong> ${name} (<a href="mailto:${userEmail}">${userEmail}</a>)</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; white-space: pre-wrap; border-left: 4px solid #3457B2;">${message}</div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Support email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending support email:', error);
        throw new Error('Failed to send support email.');
    }
};
