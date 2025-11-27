export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailTemplates {
  du: {
    send: EmailTemplate;
    review: EmailTemplate;
    deliver: EmailTemplate;
  };
  sie: {
    send: EmailTemplate;
    review: EmailTemplate;
    deliver: EmailTemplate;
  };
}

export type SalutationType = 'du' | 'sie';
export type EmailType = 'send' | 'review' | 'deliver';
