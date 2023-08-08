import { MailerModule as Mailer } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

console.log(process.env.MAILER_HOST);
@Module({
  imports: [
    Mailer.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        port: parseInt(process.env.MAILER_PORT),
        ignoreTLS: true,
        secure: false,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
    }),
  ],
})
export class MailerModule {}
