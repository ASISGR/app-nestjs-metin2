import { Injectable } from '@nestjs/common';
import { MailerService as MailerServiceLib } from '@nestjs-modules/mailer';
import path from 'path';
import fs from 'fs';

@Injectable()
export class MailerService {
  constructor(private mailerService: MailerServiceLib) {}

  async sendVerification(account: any, hash: string, locale: string) {
    //Default gr if not exists
    if (!locale) {
      locale = 'gr';
    }

    const templatePath = path.join(
      __dirname,
      `../templates/verification-template-${locale}.html`,
    );
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
}
