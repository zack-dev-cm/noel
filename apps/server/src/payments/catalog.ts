import type { EntitlementRecord } from '@noetic/shared';

export interface PaymentCatalogItem {
  type: string;
  title: string;
  description: string;
  amount: number;
  entitlements: Array<Pick<EntitlementRecord, 'type' | 'remaining'>>;
  public: boolean;
}

const STARS_STARGAZER = Number(process.env.STARS_STARGAZER || 10);
const STARS_COSMIC_PATRON = Number(process.env.STARS_COSMIC_PATRON || 100);
const STARS_UNIVERSAL_ARCHITECT = Number(process.env.STARS_UNIVERSAL_ARCHITECT || 1000);
const STARS_INTERVENTION = Number(process.env.STARS_INTERVENTION || 50);
const STARS_PRIVATE_SESSION = Number(process.env.STARS_PRIVATE_SESSION || 100);

const PAYMENT_CATALOG: Record<string, PaymentCatalogItem> = {
  stargazer: {
    type: 'stargazer',
    title: 'Stargazer',
    description: 'Basic API support for the research loop.',
    amount: STARS_STARGAZER,
    entitlements: [],
    public: true
  },
  cosmic_patron: {
    type: 'cosmic_patron',
    title: 'Cosmic Patron',
    description: 'Fund a full session and unlock 1 intervention.',
    amount: STARS_COSMIC_PATRON,
    entitlements: [{ type: 'intervention', remaining: 1 }],
    public: true
  },
  universal_architect: {
    type: 'universal_architect',
    title: 'Universal Architect',
    description: 'Priority access and 5 interventions.',
    amount: STARS_UNIVERSAL_ARCHITECT,
    entitlements: [{ type: 'intervention', remaining: 5 }],
    public: true
  },
  intervention: {
    type: 'intervention',
    title: 'Intervention',
    description: 'Inject a prompt into the live research loop.',
    amount: STARS_INTERVENTION,
    entitlements: [{ type: 'intervention', remaining: 1 }],
    public: false
  },
  private_session: {
    type: 'private_session',
    title: 'Private Session',
    description: 'Sponsor a private research session.',
    amount: STARS_PRIVATE_SESSION,
    entitlements: [{ type: 'private_session', remaining: 1 }],
    public: false
  }
};

export function getPaymentCatalogItem(type: string): PaymentCatalogItem | null {
  return PAYMENT_CATALOG[type] ?? null;
}

export function listPublicCatalog(): PaymentCatalogItem[] {
  return Object.values(PAYMENT_CATALOG).filter((item) => item.public);
}
