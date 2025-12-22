const nodemailer = require('nodemailer');

async function checkSmtp() {
    console.log('Testing SMTP connection...');
    const transporter = nodemailer.createTransport({
        host: 'smtp.elasticemail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: '285DC040B9E83DCDED5FCEC7A6B079919FE3664B3462758AFA099B14BF509DF916CFC8CEE50EBB46B806539A63434E0B',
            pass: '285DC040B9E83DCDED5FCEC7A6B079919FE3664B3462758AFA099B14BF509DF916CFC8CEE50EBB46B806539A63434E0B'
        }
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Server is ready to take our messages');

        const info = await transporter.sendMail({
            from: 'mail@webspires.co.uk',
            to: 'mail@webspires.co.uk',
            subject: 'SMTP Verification Check',
            text: 'This is a test email to verify SMTP configuration after your changes.',
        });

        console.log('✅ Message sent successfully! MessageId:', info.messageId);
    } catch (error) {
        console.error('❌ SMTP Error occurred:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.command) console.error('SMTP Command:', error.command);
    }
}

checkSmtp();
