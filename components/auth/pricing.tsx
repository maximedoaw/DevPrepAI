'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import styles from './pricing.module.css';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";
import { useSubscribeStore } from '@/store/subscribe-store'
import { Infinity as InfinityIcon } from 'lucide-react'

export interface PricingTierFrequency {
  id: string;
  value: string;
  label: string;
  priceSuffix: string;
}

export interface PricingTier {
  name: string;
  id: string;
  href: string;
  discountPrice: string | Record<string, string>;
  price: string | Record<string, string>;
  description: string | React.ReactNode;
  features: string[];
  featured?: boolean;
  highlighted?: boolean;
  cta: string;
  soldOut?: boolean;
}

export const frequencies: PricingTierFrequency[] = [
  { id: '1', value: '1', label: 'Mensuel', priceSuffix: '/mois' },
  { id: '2', value: '2', label: 'Annuel', priceSuffix: '/an' },
];

export const tiers: PricingTier[] = [
  {
    name: 'Gratuit',
    id: '0',
    href: '/subscribe',
    price: { '1': '0 FCFA', '2': '0 FCFA' },
    discountPrice: { '1': '', '2': '' },
    description: `Profitez des fonctionnalités de base gratuitement, sans carte de crédit requise.`,
    features: [
      `2 simulations d'entretien IA par jour`,
      `Accès à 5 questions de soft skills et 5 de hard skills par semaine`,
      `Feedback basique sur vos performances`,
      `Historique des activités conservé pendant 1 mois`,
      `Accès aux ressources d'apprentissage de base`,
    ],
    featured: false,
    highlighted: false,
    soldOut: false,
    cta: `Commencer`,
  },
  {
    name: 'Plan Pro',
    id: '1',
    href: '/subscribe',
    price: { '1': '5000 FCFA', '2': '50000 FCFA' },
    discountPrice: { '1': '', '2': '' },
    description: `Pour ceux qui veulent booster leur préparation aux entretiens.`,
    features: [
      `Simulations d'entretien illimitées (hard/soft skills)`,
      `Feedback personnalisé et recommandations avancées par IA`,
      `Analyse détaillée de vos points forts et axes d'amélioration`,
      `Suggestions d'apprentissage personnalisées`,
      `Notifications intelligentes pour suivre votre progression`,
      `Historique des activités conservé pendant 6 mois`,
    ],
    featured: false,
    highlighted: true,
    soldOut: false,
    cta: `Commencer`,
  },
  {
    name: 'Plan Expert',
    id: '2',
    href: '/contact-us',
    price: { '1': '9000 FCFA', '2': '90000 FCFA' },
    discountPrice: { '1': '', '2': '' },
    description: `La solution complète pour une préparation professionnelle aux entretiens.`,
    features: [
      `Tous les avantages du Plan Pro`,
      `Générateur de CV intelligent avec optimisation IA`,
      `Analyse approfondie de votre portfolio GitHub`,
      `Coaching IA en temps réel (chat, vocal et simulations)`,
      `Accès à une communauté privée d'experts et pairs`,
      `Ateliers et webinaires exclusifs`,
      `Historique illimité et sauvegarde de vos données`,
      `Support prioritaire`,
    ],
    featured: true,
    highlighted: false,
    soldOut: false,
    cta: `Commencer`,
  },
];

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('w-6 h-6', className)}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export function Pricing() {
  const [frequency, setFrequency] = useState(frequencies[0]);
  const { isAuthenticated } = useKindeBrowserClient();
  const router = useRouter();
  const { open, setPendingAfterAuth } = useSubscribeStore();

  const bannerText = '';

  function handleSubscribeClick(e: React.MouseEvent, tierId: string) {
    e.preventDefault();
    // Ouvre toujours le dialog, peu importe le forfait
    if (!isAuthenticated) {
      setPendingAfterAuth(true);
      router.push(process.env.NEXT_PUBLIC_KIND_REGISTER_URL || "");
      setTimeout(() => {
        open()        
      }, 10000);
    } else {
      open();
    }
  }

  return (
    <div className={cn('flex flex-col w-full items-center', styles.fancyOverlay)}>
      <div className="w-full flex flex-col items-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center">
          <div className="w-full lg:w-auto mx-auto max-w-4xl lg:text-center">
            <h1 className="text-black dark:text-white text-4xl font-semibold max-w-xs sm:max-w-none md:text-6xl !leading-tight">
              Tarifs
            </h1>
          </div>
          {bannerText ? (
            <div className="w-full lg:w-auto flex justify-center my-4">
              <p className="w-full px-4 py-3 text-xs bg-fuchsia-100 text-black dark:bg-fuchsia-300/30 dark:text-white/80 rounded-xl">
                {bannerText}
              </p>
            </div>
          ) : null}
          <div className="isolate mx-auto mt-8 mb-20 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {tiers.map((tier, idx) => (
              <div
                key={tier.id}
                className={cn(
                  'relative flex flex-col items-stretch rounded-2xl shadow-lg border border-gray-200 bg-white/90 hover:shadow-2xl transition-shadow duration-200',
                  tier.highlighted ? 'ring-2 ring-fuchsia-400 scale-[1.03] z-10' : '',
                  'p-6',
                )}
              >
                {tier.highlighted && (
                  <span className="absolute top-4 right-4 bg-fuchsia-100 text-fuchsia-700 text-xs font-bold px-3 py-1 rounded-full shadow">Populaire</span>
                )}
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  {tier.name}
                  {tier.id === '2' && <InfinityIcon className="w-5 h-5 text-purple-500" />}
                </h3>
                <p className="text-gray-600 text-sm mb-4 min-h-[48px]">{tier.description}</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-extrabold text-blue-700">
                    {typeof tier.price === 'string' ? tier.price : tier.price[frequency.value]}
                  </span>
                  <span className="text-gray-500 text-base">{frequency.priceSuffix}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                      <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  onClick={e => handleSubscribeClick(e, tier.id)}
                  className={cn(
                    'w-full py-2 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700 transition-colors',
                    tier.soldOut ? 'pointer-events-none opacity-60' : '',
                  )}
                  disabled={tier.soldOut}
                >
                  {tier.soldOut ? 'Épuisé' : tier.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}