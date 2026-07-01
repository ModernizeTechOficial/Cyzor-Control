import Stripe from 'stripe';
import { db } from '../db/index.ts';
import { stripeConfig } from '../db/schema.ts';

let stripeInstance: Stripe | null = null;

export const getStripe = async (): Promise<Stripe> => {
  if (stripeInstance) return stripeInstance;

  const config = await db.select().from(stripeConfig).limit(1);
  if (!config || config.length === 0 || !config[0].secretKey) {
    throw new Error('Stripe configuration not found or incomplete');
  }

  stripeInstance = new Stripe(config[0].secretKey, {
    apiVersion: '2025-01-27.acacia' as any, // specify whatever api version is stable
  });

  return stripeInstance;
};

export const getStripeConfig = async () => {
  const config = await db.select().from(stripeConfig).limit(1);
  if (config && config.length > 0) return config[0];
  return null;
};
