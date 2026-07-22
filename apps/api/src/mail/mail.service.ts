import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  sendEmailVerification(email: string, token: string): Promise<void> { this.deliver(email, 'Verify your ARMZON email', `/verify-email?token=${encodeURIComponent(token)}`); return Promise.resolve(); }
  sendPasswordReset(email: string, token: string): Promise<void> { this.deliver(email, 'Reset your ARMZON password', `/reset-password?token=${encodeURIComponent(token)}`); return Promise.resolve(); }
  private deliver(email: string, subject: string, path: string): void {
    const provider = process.env.MAIL_PROVIDER ?? 'development';
    if (provider !== 'development') throw new Error('Production mail provider is not configured');
    const url = `${process.env.APP_WEB_URL ?? 'http://localhost:3000'}${path}`;
    this.logger.log(`[development mail] to=${email} subject=${subject} url=${url}`);
  }
}
