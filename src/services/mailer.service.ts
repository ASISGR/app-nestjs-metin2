import { Injectable } from '@nestjs/common';
import { MailerService as MailerServiceLib } from '@nestjs-modules/mailer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: MailerServiceLib) {}

  private getLocale(locale?: string): string {
    return locale || 'gr';
  }

  private getFrom(): string {
    return `"${process.env.MAILER_FROM_NAME || 'REVENTON'}" <${process.env.MAILER_FROM_EMAIL}>`;
  }

  private loadTemplate(templateName: string, locale: string): string {
    const templatePath = path.join(
      __dirname,
      `../templates/${templateName}-${locale}.html`,
    );

    return fs.readFileSync(templatePath, 'utf8');
  }

  private async sendHtmlMail(to: string | string[], subject: string, html: string) {
    return this.mailerService.sendMail({
      to,
      from: this.getFrom(),
      subject,
      html,
    });
  }

  async sendVerification(account: any, hash: string, locale?: string) {
    locale = this.getLocale(locale);

    const htmlTemplate = this.loadTemplate('verification-template', locale)
      .replace('{real_name}', account.real_name ?? '')
      .replace('{login}', account.login ?? '')
      .replace('{password}', account.password ?? '')
      .replace('{question1}', account.question1 ?? '')
      .replace('{answer1}', account.answer1 ?? '')
      .replace('{social_id}', account.social_id ?? '')
      .replace('{hash}', hash)
      .replace(/{BASE_FRONT_URL}/g, process.env.BASE_FRONT_URL || '');

    return this.sendHtmlMail(
      account.email,
      'Η ΕΓΓΡΑΦΗ ΣΟΥ - REVENTON',
      htmlTemplate,
    );
  }

  async sendRetryVerification(account: any, hash: string, locale?: string) {
    locale = this.getLocale(locale);

    const htmlTemplate = this.loadTemplate('verification-retry-template', locale)
      .replace('{username}', account.username ?? account.login ?? '')
      .replace('{hash}', hash)
      .replace(/{BASE_FRONT_URL}/g, process.env.BASE_FRONT_URL || '');

    return this.sendHtmlMail(
      account.email,
      'ΕΠΙΒΕΒΑΙΩΣΗ ΛΟΓΑΡΙΣΜΟΥ - REVENTON',
      htmlTemplate,
    );
  }

  async sendResetPassword(email: string, hash: string, locale?: string) {
    locale = this.getLocale(locale);

    const htmlTemplate = this.loadTemplate('reset-password-template', locale)
      .replace('{hash}', hash)
      .replace(/{BASE_FRONT_URL}/g, process.env.BASE_FRONT_URL || '');

    return this.sendHtmlMail(
      email,
      'ΕΠΑΝΑΦΟΡΑ ΛΟΓΑΡΙΣΜΟΥ - REVENTON',
      htmlTemplate,
    );
  }

  async sendServerAnnouncement(
    emails: string[],
    subject: string,
    title?: string,
    content?: string,
    locale?: string,
  ) {
    locale = this.getLocale(locale);

    let html = `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6;">
        <h1>${title || 'REVENTON'}</h1>
        <div>${content || ''}</div>
      </div>
    `;

    return this.sendHtmlMail(emails, subject, html);
  }

  async emailValidation(email: string): Promise<boolean> {
    // Με SMTP2GO δεν χρειάζεται να κρατήσεις ElasticEmail validation logic.
    // Κρατάμε προσωρινά basic validation για να μη σπάσει το flow.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}