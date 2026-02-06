import { Module, Provider } from '@nestjs/common';
import { EmailPort } from './email.port';
//import { MailerSendEmailAdapter } from './drivers/mailersend.email.adapter';
import { ResendEmailAdapter } from './drivers/resend.email.adapter';
import { TOKENS } from 'src/common/injection-tokens';
//import { SendGridEmailAdapter } from './drivers/sendgrid.email.adapter';

export const EMAIL_PORT = Symbol('EMAIL_PORT');

function buildEmailAdapter(): EmailPort {
    const provider = process.env.EMAIL_PROVIDER?.toLowerCase();
    const from = process.env.EMAIL_FROM ?? 'candor@dooor.ai';

    switch (provider) {
        case 'sendgrid':
            //return new SendGridEmailAdapter(process.env.SENDGRID_API_KEY!);
        case 'resend':
            return new ResendEmailAdapter(process.env.RESEND_API_KEY!, from);
        case 'mailersend':
            //return new MailerSendEmailAdapter(process.env.MAILERSEND_API_KEY!, from);
        default:
            return new ResendEmailAdapter(process.env.RESEND_API_KEY!, from);
            //return new MailerSendEmailAdapter(process.env.MAILERSEND_API_KEY!, from);
    }
}

const EmailProvider: Provider = {
    provide: TOKENS.EMAIL,
    useFactory: () => buildEmailAdapter(),
};

@Module({
    providers: [EmailProvider],
    exports: [EmailProvider],
})
export class EmailModule { }