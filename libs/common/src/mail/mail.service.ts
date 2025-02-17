import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(to: string, subject: string, text: string, html: string) {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.mailerService.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email: %s', error);
      throw error;
    }
  }

  async sendMailWithTemplate(
    to: string,
    subject: string,
    template: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any,
  ) {
    try {
      const info = await this.mailerService.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
        to: to,
        subject: subject,
        template: template,
        context: context,
      });
      console.log(`Send Email ${subject} to ${to}`);
      return info;
    } catch (error) {
      throw error;
    }
  }
}
