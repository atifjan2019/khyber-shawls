const nodemailer = require('nodemailer');

async function checkSmtp() {
    console.log('Testing SMTP connection with Cloudways Elastic Email credentials...');
    const transporter = nodemailer.createTransport({
        host: 'smtp.elasticemail.com',
        port: 2525,
        secure: false,
        auth: {
            user: 'e6xd41718014549@managedcloudhostingemail.com',
            pass: '8DD945F52DFFCA0CCA3F0840E4A7174AA7E2'
        }
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Server is ready to take our messages');

        const info = await transporter.sendMail({
            from: 'mail@webspires.co.uk',
            to: 'atifjan2019@gmail.com',
            subject: 'Khyber Shawls SMTP Test',
            text: 'This is a test email to verify the new Cloudways SMTP credentials.',
        });

        console.log('✅ Message sent successfully! MessageId:', info.messageId);
    } catch (error) {
        console.error('❌ SMTP Error occurred:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.command) console.error('SMTP Command:', error.command);
    }
}

checkSmtp();
