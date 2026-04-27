import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserRole } from '@koblio/shared';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3001';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('create-checkout')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Create a Stripe Checkout session for subscription' })
  async createCheckout(@CurrentUser() user: AuthenticatedUser) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, email: true, stripeCustomerId: true },
    });

    if (!dbUser) {
      throw new BadRequestException('User not found');
    }

    const customerId = await this.stripeService.getOrCreateCustomer(
      dbUser.email ?? '',
      dbUser.stripeCustomerId,
    );

    if (customerId && customerId !== dbUser.stripeCustomerId) {
      await this.prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const url = await this.stripeService.createCheckoutSession(
      customerId,
      dbUser.email ?? '',
      STRIPE_PRICE_ID ?? '',
      `${WEB_URL}/subscribe/success`,
      `${WEB_URL}/subscribe/cancel`,
    );

    return { url };
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook receiver (public — no JWT)' })
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    // express.raw() middleware (wired in main.ts) stores raw body in req.body as a Buffer for this route
    const rawBody = req.body as Buffer;

    const event = this.stripeService.constructWebhookEvent(rawBody, signature);

    if (event) {
      await this.processEvent(event);
    }

    return { received: true };
  }

  private async processEvent(event: import('stripe').default.Event) {
    const type = event.type;

    if (
      type === 'customer.subscription.created' ||
      type === 'customer.subscription.updated'
    ) {
      const sub = event.data.object as import('stripe').default.Subscription;
      const customerId =
        typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

      await this.prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionStatus: 'active',
          subscriptionId: sub.id,
        },
      });

      this.logger.log(`Subscription activated for customer ${customerId}`);
    } else if (type === 'customer.subscription.deleted') {
      const sub = event.data.object as import('stripe').default.Subscription;
      const customerId =
        typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

      await this.prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { subscriptionStatus: 'canceled' },
      });

      this.logger.log(`Subscription canceled for customer ${customerId}`);
    }
  }
}
