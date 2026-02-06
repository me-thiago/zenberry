import axios, { AxiosInstance } from 'axios';
import { EmailPort, SendEmailInput, SendEmailResult } from '../email.port';
type ResendAttachment = {
    filename: string;
    content: string;            // base64
    content_type?: string;
    content_id?: string;
    path?: string;
};

export class ResendEmailAdapter implements EmailPort {
    private http: AxiosInstance;
    private defaultFrom: string;

    constructor(apiKey: string, defaultFrom: string) {
        this.defaultFrom = defaultFrom;
        this.http = axios.create({
            baseURL: 'https://api.resend.com',
            timeout: 15_000,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });
    }

    private formatAddress(addr: { email: string; name?: string }) {
        return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
    }

    private toList(addrs?: { email: string; name?: string }[]) {
        if (!addrs?.length) return undefined;
        return addrs.map(this.formatAddress);
    }

    private toBase64(content: Buffer | string): string {
        if (Buffer.isBuffer(content)) return content.toString('base64');
        // Se já veio em dataURL ou base64 cru, envia como está
        return content;
    }

    private mapAttachments(atts?: { filename: string; content: Buffer | string; type?: string }[]): ResendAttachment[] | undefined {
        if (!atts?.length) return undefined;
        return atts.map(a => ({
            filename: a.filename,
            content: this.toBase64(a.content),
            content_type: a.type,
        }));
    }

    private async postWithRetry<T>(path: string, data: any, headers?: Record<string, string>): Promise<T> {
        const maxAttempts = 4;
        let attempt = 0;
        let delay = 300; // ms

        // Retry on 429/5xx
        while (true) {
            try {
                const res = await this.http.post<T>(path, data, { headers });
                return res.data;
            } catch (err: any) {
                const status = err?.response?.status as number | undefined;
                const retriable = status === 429 || (status && status >= 500);
                if (!retriable || attempt >= (maxAttempts - 1)) {
                    // propaga com detalhes úteis do Resend (errors)
                    const payload = err?.response?.data;
                    const msg = payload?.error?.message || payload?.message || err.message;
                    const code = payload?.error?.code || payload?.name;
                    const info = { status, code, message: msg, data: payload };
                    const e = new Error(`Resend send failed${status ? ` (${status})` : ''}: ${msg}`);
                    (e as any).info = info;
                    throw e;
                }
                await new Promise(r => setTimeout(r, delay));
                delay = Math.min(delay * 2, 3000);
                attempt++;
            }
        }
    }

    async send(input: SendEmailInput & { providerOptions?: { idempotencyKey?: string; headers?: Record<string, string>; tags?: { name: string; value: string }[]; scheduledAt?: string } }): Promise<SendEmailResult> {
        const from = input.from ? this.formatAddress(input.from) : this.defaultFrom;

        const body: any = {
            from,
            to: this.toList(input.to)!,
            cc: this.toList(input.cc),
            bcc: this.toList(input.bcc),
            subject: input.subject,
            html: input.html,
            text: input.text,
            reply_to: input.replyTo ? this.formatAddress(input.replyTo) : undefined,
            attachments: this.mapAttachments(input.attachments),
            // Campos extras opcionais do Resend:
            headers: input.providerOptions?.headers,
            tags: input.providerOptions?.tags,
            scheduled_at: input.providerOptions?.scheduledAt, // e.g. "in 1 min" ou ISO8601
        };

        const headers: Record<string, string> = {};
        if (input.providerOptions?.idempotencyKey) {
            headers['Idempotency-Key'] = input.providerOptions.idempotencyKey;
        }

        // POST /emails => { id: string }
        const data = await this.postWithRetry<{ id: string }>('/emails', body, headers);
        return { provider: 'resend', requestId: data?.id };
    }
}