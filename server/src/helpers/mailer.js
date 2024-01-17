import nodemailer from 'nodemailer';

const mailer = (options = { subject: "", to: "", body: "" }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: options.to,
        subject: options.subject,
        html: options.body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

export default mailer;