import { Injectable } from '@nestjs/common';
import { MailerService as MailerServiceLib } from '@nestjs-modules/mailer';
import * as path from 'path';
import * as fs from 'fs';
import * as ElasticEmail from '@elasticemail/elasticemail-client';
import axios from 'axios';

@Injectable()
export class MailerService {
  constructor(private mailerService: MailerServiceLib) {}

  async sendVerification(account: any, hash: string, locale?: string) {
    //Default gr if not exists
    if (!locale) {
      locale = 'gr';
    }

    //Get client instance:

    const defaultClient = ElasticEmail.ApiClient.instance;
    // Generate and use your API key (remember to check a required access level):
    let apikey = defaultClient.authentications['apikey'];
    apikey.apiKey = process.env.ELASTICEMAIL_API_KEY;

    //Create an instance of EmailsApi that will be used to send a transactional email.
    const api = new ElasticEmail.EmailsApi();

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

    const emailData = ElasticEmail.EmailMessageData.constructFromObject({
      Recipients: [new ElasticEmail.EmailRecipient(account.email)],
      Content: {
        Body: [
          ElasticEmail.BodyPart.constructFromObject({
            ContentType: 'HTML',
            Content: htmlTemplate,
          }),
        ],

        Subject: 'Η ΕΓΓΡΑΦΗ ΣΟΥ - ASCEO2',
        From: `Asceo2 - GR👻 <${process.env.MAILER_USER}>`,
      },
    });

    return api
      .emailsPost(emailData)
      .then((response: any) => {
        return response;
      })
      .catch((err: any) => {
        return err;
      });
  }

  async sendRetryVerification(account: any, hash: string, locale?: string) {
    console.log(account);
    //Default gr if not exists
    if (!locale) {
      locale = 'gr';
    }

    //Get client instance:

    const defaultClient = ElasticEmail.ApiClient.instance;
    // Generate and use your API key (remember to check a required access level):
    let apikey = defaultClient.authentications['apikey'];
    apikey.apiKey = process.env.ELASTICEMAIL_API_KEY;

    //Create an instance of EmailsApi that will be used to send a transactional email.
    const api = new ElasticEmail.EmailsApi();

    const templatePath = path.join(
      __dirname,
      `../templates/verification-retry-template-${locale}.html`,
    );

    const htmlTemplate = fs
      .readFileSync(templatePath, 'utf8')
      .replace('{username}', account.username)
      .replace('{hash}', hash)
      .replace(/{BASE_FRONT_URL}/g, process.env.BASE_FRONT_URL);

    const emailData = ElasticEmail.EmailMessageData.constructFromObject({
      Recipients: [new ElasticEmail.EmailRecipient(account.email)],
      Content: {
        Body: [
          ElasticEmail.BodyPart.constructFromObject({
            ContentType: 'HTML',
            Content: htmlTemplate,
          }),
        ],

        Subject: 'ΕΠΙΒΕΒΑΙΩΣΗ ΛΟΓΑΡΙΣΜΟΥ - ASCEO2',
        From: `Asceo2 - GR👻 <${process.env.MAILER_USER}>`,
      },
    });

    return api
      .emailsPost(emailData)
      .then((response: any) => {
        return response;
      })
      .catch((err: any) => {
        return err;
      });
  }

  async emailValidation(email: string): Promise<boolean> {
    return axios(
      `https://api.elasticemail.com/v4/verifications/${email}?apikey=${process.env.ELASTICEMAIL_API_KEY}`,
      { headers: { 'Content-Type': 'application/json' }, method: 'POST' },
    )
      .then((response: any) => {
        console.log(response.data);
        if (
          response.data.Result === 'Risky' ||
          response.data.Result === 'Invalid' ||
          response.data.PredictedStatus === 'HighRisk' ||
          response.data.PredictedStatus === 'Invalid'
        ) {
          return false;
        }
        return true;
      })
      .catch((err: any) => {
        console.log(err);
        return false;
      });
  }

  sendResetPassword(email: string, hash: string, locale?: string) {
    //Default gr if not exists
    if (!locale) {
      locale = 'gr';
    }

    //Get client instance:

    const defaultClient = ElasticEmail.ApiClient.instance;
    // Generate and use your API key (remember to check a required access level):
    let apikey = defaultClient.authentications['apikey'];
    apikey.apiKey = process.env.ELASTICEMAIL_API_KEY;

    //Create an instance of EmailsApi that will be used to send a transactional email.
    const api = new ElasticEmail.EmailsApi();

    const templatePath = path.join(
      __dirname,
      `../templates/reset-password-template-${locale}.html`,
    );
    const htmlTemplate = fs
      .readFileSync(templatePath, 'utf8')
      .replace('{hash}', hash)
      .replace(/{BASE_FRONT_URL}/g, process.env.BASE_FRONT_URL);

    const emailData = ElasticEmail.EmailMessageData.constructFromObject({
      Recipients: [new ElasticEmail.EmailRecipient(email)],
      Content: {
        Body: [
          ElasticEmail.BodyPart.constructFromObject({
            ContentType: 'HTML',
            Content: htmlTemplate,
          }),
        ],
        Subject: 'ΕΠΑΝΑΦΟΡΑ ΛΟΓΑΡΙΣΜΟΥ - ASCEO2',
        From: `Asceo2 - GR👻 <${process.env.MAILER_USER}>`,
      },
    });

    return api
      .emailsPost(emailData)
      .then((response: any) => {
        return response;
      })
      .catch((err: any) => {
        return err;
      });
  }

  async sendServerAnnouncement(
    emails: string[],
    subject: string,
    title?: string,
    content?: string,
    locale?: string,
  ) {
    //Default gr if not exists
    if (!locale) {
      locale = 'gr';
    }

    const apiBulkUrl = `https://api.elasticemail.com/v4/emails?apikey=${process.env.ELASTICEMAIL_API_KEY}`;

    const emailsMapping = emails.map((object) => {
      return { Email: object };
    });

    return axios(apiBulkUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      data: {
        Recipients: emailsMapping,
        Content: {
          Body: [
            {
              ContentType: 'HTML',
              Content: 'string',
              Charset: 'utf-8',
            },
          ],
          //`${process.env.MAILER_USER} - Reventon - GR👻`
          From: `Asceo2 - GR👻 <${process.env.MAILER_USER}>`,
          Subject: subject,
          TemplateName: 'AsceoMetin2Campainge',
        },
      },
    })
      .then((response: any) => {
        console.log(response);
        return response;
      })
      .catch((err: any) => {
        console.log(err);
        return err;
      });
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
