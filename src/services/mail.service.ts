import nodemailer from 'nodemailer';
import 'dotenv/config';
import config from 'config';
import { User } from '../entities/user.entity';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.get<string>('nodemailerUser'),
    pass: config.get<string>('nodemailerPass'),
  },
});

export const sendMail = (to: string, subject: string, html: string) => {
  transporter.sendMail({
    from: config.get<string>('nodemailerUser'),
    to,
    subject,
    html,
  });
};

export const sendActivationCode = (
  user: User,
  randomSixDigitNumber: number
) => {
  const subject = 'Your activation code';
  const html = `<div>
            <h3>Here is your activation code. Do not give it to anyone</h3>
             <h1>${randomSixDigitNumber}</h1> 
            </div>`;
  sendMail(user.email, subject, html);
};
