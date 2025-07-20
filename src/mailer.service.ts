import { Resend } from 'resend';

export class MailerService {
  private readonly mailer: Resend;

  constructor() {
    this.mailer = new Resend(process.env.RESEND_API_KEY);
  }
  private async sendEmail({
    recipient,
    subject,
    html,
  }: {
    recipient: string[];
    subject: string;
    html: string;
  }) {
    try {
      const { data, error } = await this.mailer.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: recipient,
        subject: subject,
        html: html,
      });

      if (error) {
        return console.error({ error });
      }

      console.log({ data });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error({ error: error.message });
      }
      return {
        error: true,
        message: 'an unexpected error occurred during registration',
      };
    }
  }
  async sendWelcomeEmail({
    recipient,
    firstName,
  }: {
    recipient: string;
    firstName: string;
  }) {
    return this.sendEmail({
      recipient: [recipient],
      subject: 'Welcome to our app',
      html:
        'Hi ' +
        firstName +
        '! Welcome to our app, we are <strong>glad</strong> to have you here.',
    });
  }
}
