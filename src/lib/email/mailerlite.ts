import { createLogger } from '@/lib/logger';

const logger = createLogger('mailerlite');

const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';

interface MailerLiteSubscriber {
  email: string;
  fields?: Record<string, string>;
  groups?: string[];
  status?: 'active' | 'unsubscribed' | 'unconfirmed' | 'bounced' | 'junk';
}

interface MailerLiteResponse {
  data?: {
    id: string;
    email: string;
    status: string;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

class MailerLiteClient {
  private apiKey: string | undefined;
  private hostGroupId: string | undefined;
  private creatorGroupId: string | undefined;

  constructor() {
    this.apiKey = process.env.MAILERLITE_API_KEY;
    this.hostGroupId = process.env.MAILERLITE_GROUP_HOSTS_ID;
    this.creatorGroupId = process.env.MAILERLITE_GROUP_CREATORS_ID;
  }

  private isConfigured(): boolean {
    return !!this.apiKey;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T | null> {
    if (!this.isConfigured()) {
      logger.warn('MailerLite API key not configured, skipping request');
      return null;
    }

    try {
      const response = await fetch(`${MAILERLITE_API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error({ status: response.status, errorData, endpoint }, 'MailerLite API error');
        return null;
      }

      return response.json();
    } catch (error) {
      logger.error({ error, endpoint }, 'MailerLite request failed');
      return null;
    }
  }

  /**
   * Add or update a subscriber
   */
  async upsertSubscriber(subscriber: MailerLiteSubscriber): Promise<MailerLiteResponse | null> {
    return this.request<MailerLiteResponse>('/subscribers', 'POST', {
      email: subscriber.email,
      fields: subscriber.fields,
      groups: subscriber.groups,
      status: subscriber.status || 'active',
    });
  }

  /**
   * Add subscriber to a specific group
   */
  async addToGroup(email: string, groupId: string): Promise<boolean> {
    const result = await this.request(`/subscribers/${email}/groups/${groupId}`, 'POST');
    return result !== null;
  }

  /**
   * Add a new host to the hosts mailing list
   */
  async addHost(email: string, name?: string): Promise<boolean> {
    if (!this.hostGroupId) {
      logger.warn('Host group ID not configured');
      return false;
    }

    const result = await this.upsertSubscriber({
      email,
      fields: name ? { name } : undefined,
      groups: [this.hostGroupId],
    });

    if (result) {
      logger.info({ email }, 'Added host to MailerLite');
      return true;
    }
    return false;
  }

  /**
   * Add a new creator to the creators mailing list
   */
  async addCreator(email: string, name?: string): Promise<boolean> {
    if (!this.creatorGroupId) {
      logger.warn('Creator group ID not configured');
      return false;
    }

    const result = await this.upsertSubscriber({
      email,
      fields: name ? { name } : undefined,
      groups: [this.creatorGroupId],
    });

    if (result) {
      logger.info({ email }, 'Added creator to MailerLite');
      return true;
    }
    return false;
  }

  /**
   * Update subscriber fields
   */
  async updateSubscriber(
    email: string,
    fields: Record<string, string>
  ): Promise<MailerLiteResponse | null> {
    return this.request<MailerLiteResponse>(`/subscribers/${email}`, 'PUT', { fields });
  }

  /**
   * Remove subscriber from a group
   */
  async removeFromGroup(email: string, groupId: string): Promise<boolean> {
    const result = await this.request(`/subscribers/${email}/groups/${groupId}`, 'DELETE');
    return result !== null;
  }
}

export const mailerlite = new MailerLiteClient();

export default mailerlite;
