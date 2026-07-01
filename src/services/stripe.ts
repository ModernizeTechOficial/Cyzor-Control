import Stripe from 'stripe';
import { db } from '../db/index.ts';
import { stripeConfig } from '../db/schema.ts';

export const getStripe = async (): Promise<Stripe> => {
  const config = await db.select().from(stripeConfig).limit(1);
  if (!config || config.length === 0) {
    throw new Error('Stripe configuration not found');
  }

  const isProd = config[0].environment === 'production';
  const secretKey = isProd ? config[0].liveSecretKey : config[0].testSecretKey;

  if (!secretKey) {
    throw new Error(`Stripe ${isProd ? 'Live' : 'Sandbox'} Secret Key is missing`);
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia' as any,
  });
};

export const getStripeConfig = async () => {
  const config = await db.select().from(stripeConfig).limit(1);
  if (config && config.length > 0) return config[0];
  return null;
};
