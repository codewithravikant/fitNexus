declare module 'smtp-client' {
  export interface SMTPClientOptions {
    host: string;
    port: number;
    secure?: boolean;
  }

  export interface GreetOptions {
    hostname: string;
  }

  export interface AuthPlainOptions {
    username: string;
    password: string;
  }

  export interface MailOptions {
    from: string;
  }

  export interface RcptOptions {
    to: string;
  }

  export class SMTPClient {
    constructor(options: SMTPClientOptions);
    connect(): Promise<void>;
    greet(options: GreetOptions): Promise<void>;
    authPlain(options: AuthPlainOptions): Promise<void>;
    mail(options: MailOptions): Promise<void>;
    rcpt(options: RcptOptions): Promise<void>;
    data(message: string): Promise<void>;
    quit(): Promise<void>;
  }
}
