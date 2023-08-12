import { MailerModule as Mailer } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailerService } from 'src/services/mailer.service';

console.log(process.env.MAILER_HOST);
@Module({
  imports: [
    Mailer.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        port: parseInt(process.env.MAILER_PORT),
        secure: true,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
