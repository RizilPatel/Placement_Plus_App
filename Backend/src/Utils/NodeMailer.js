import nodemailer from "nodemailer"

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `"Placement Plus" ${process.env.EMAIL_ID}`,
        to,
        subject,
        html,
    });
};

export { sendEmail }