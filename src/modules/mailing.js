/* eslint-disable quotes */
import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "dafcc3588284bd",
        pass: "5f7acc6798dd60"
    }
});

export async function sendingEmail(data) {
    const info = await transport.sendMail(data);
    console.log('Message sent: %s', info.messageId);
}

export function htmlValidateEmail({ token, host }) {
    return `
        <b>Validasi email:</b> <br />
        <a href="${host}/v1/register/validate/${token}" title="${token}">Klik</a>
    `;
};

export default {
    transport,
    sendingEmail,
    htmlValidateEmail
};