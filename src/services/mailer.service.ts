import { Injectable } from '@nestjs/common';
import { MailerService as MailerServiceLib } from '@nestjs-modules/mailer';
import {
  MailerSend,
  EmailParams,
  Sender,
  Recipient,
  Attachment,
} from 'mailersend';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MailerService {
  constructor(private mailerService: MailerServiceLib) {}

  async sendVerification(account: any, hash: string, locale?: string) {
    //Default gr if not exists
    if (!locale) {
      locale = 'gr';
    }

    const templatePath = path.join(
      __dirname,
      `../templates/verification-template-${locale}.html`,
    );

    console.log(templatePath);
    const htmlTemplate = fs
      .readFileSync(templatePath, 'utf8')
      .replace('{real_name}', account.real_name)
      .replace('{login}', account.login)
      .replace('{password}', account.password)
      .replace('{question1}', account.question1)
      .replace('{answer1}', account.answer1)
      .replace('{social_id}', account.social_id)
      .replace('{hash}', hash)
      .replace(/{BASE_FRONT_URL}/g, process.env.BASE_FRONT_URL);
    return this.mailerService.sendMail({
      from: `"Reventon - GR👻" <${process.env.MAILER_USER}>`, // sender address
      to: account.email, // list of receivers
      subject: 'Η ΕΓΓΡΑΦΗ ΣΟΥ - REVENTON', // Subject line
      html: htmlTemplate, // html body
    });
  }

  sendResetPassword(email: string, hash: string, locale?: string) {
    //Default gr if not exists
    if (!locale) {
      locale = 'gr';
    }

    const templatePath = path.join(
      __dirname,
      `../templates/reset-password-template-${locale}.html`,
    );
    const htmlTemplate = fs
      .readFileSync(templatePath, 'utf8')
      .replace('{hash}', hash)
      .replace(/{BASE_FRONT_URL}/g, process.env.BASE_FRONT_URL);

    return this.mailerService.sendMail({
      from: `"Reventon - GR👻" <${process.env.MAILER_USER}>`, // sender address
      to: email, // list of receivers
      subject: 'ΕΠΑΝΑΦΟΡΑ ΛΟΓΑΡΙΣΜΟΥ - REVENTON', // Subject line
      html: htmlTemplate, // html body
    });
  }

  async sendServerAnnouncement(
    emails: string[],
    subject: string,
    title: string,
    content: string,
    locale?: string,
  ) {
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });
    console.log(process.env.MAILERSEND_API_KEY);
    const receivers = [];
    //Default gr if not exists
    if (!locale) {
      locale = 'gr';
    }

    const templatePath = path.join(
      __dirname,
      `../templates/server-announcement-template-${locale}.html`,
    );
    const htmlTemplate = fs
      .readFileSync(templatePath, 'utf8')
      .replace('{title}', title)
      .replace('{content}', content)
      .replace(/{BASE_FRONT_URL}/g, process.env.BASE_FRONT_URL);

    const sentFrom = new Sender(process.env.MAILER_USER, 'Reventon - GR👻');

    for (let i = 0; i < emails.length; i++) {
      receivers.push(
        new EmailParams()
          .setFrom(sentFrom)
          .setTo([new Recipient(process.env.MAILER_USER)])
          .setBcc([new Recipient(emails[i])])
          .setSubject(subject)
          //          .setHtml(htmlTemplate),
          .setTemplateId('z86org88vq0gew13'),
      );
    }
    return mailerSend.email.sendBulk(receivers);
  }
}

/*
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
javascript
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg = {
  to: 'test@example.com', // Change to your recipient
  from: 'test@example.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
   */
