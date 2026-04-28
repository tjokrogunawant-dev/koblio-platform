import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe | null;
  private readonly webhookSecret: string | null;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    this.stripe = key ? new Stripe(key, { apiVersion: '2023-10-16' }) : null;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? null;
  }

  async createCheckoutSession(
    customerId: string | null,
    email: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string | null> {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured — STRIPE_SECRET_KEY missing');
      return null;
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerId ? undefined : email,
    };

    if (customerId) {
      params.customer = customerId;
    }

    const session = await this.stripe.checkout.sessions.create(params);
    return session.url;
  }

  async getOrCreateCustomer(
    email: string,
    existingCustomerId: string | null,
  ): Promise<string | null> {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured — STRIPE_SECRET_KEY missing');
      return null;
    }

    if (existingCustomerId) {
      return existingCustomerId;
    }

    const customer = await this.stripe.customers.create({ email });
    return customer.id;
  }

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Stripe.Event | null {
    if (!this.stripe || !this.webhookSecret) {
      this.logger.warn(
        'Stripe webhook not configured — STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing',
      );
      return null;
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.warn(`Webhook signature verification failed: ${String(err)}`);
      return null;
    }
  }
}
