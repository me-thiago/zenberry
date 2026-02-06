export type EmailAddress = { email: string; name?: string };

export type SendEmailInput = {
    from?: EmailAddress;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    html?: string;
    text?: string;
    templateId?: string;          // ID de template do provedor
    variables?: Record<string, any>; // merge vars / dynamic template data
    attachments?: { filename: string; content: Buffer | string; type?: string }[];
    replyTo?: EmailAddress;
};

export type SendEmailResult = {
    provider: 'mailersend' | 'sendgrid' | 'resend';
    requestId?: string;   // x-message-id (MailerSend) ou sg_message_id
};

export interface EmailPort {
    send(input: SendEmailInput): Promise<SendEmailResult>;
}