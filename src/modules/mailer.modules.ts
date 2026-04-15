import { MailerModule as Mailer } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailerService } from 'src/services/mailer.service';

@Module({
  imports: [
    Mailer.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        port: parseInt(process.env.MAILER_PORT || '2525', 10),
        secure: process.env.MAILER_SECURE === 'true',
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
      defaults: {
        from: `"${process.env.MAILER_FROM_NAME || 'REVENTON'}" <${process.env.MAILER_FROM_EMAIL}>`,
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}