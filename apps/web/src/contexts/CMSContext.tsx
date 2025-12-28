/**
 * CMS Context Provider
 * 
 * Provides global CMS configuration and utilities
 * for the application
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';

// ============================================================
// Domain Configuration
// ============================================================

export const DOMAINS = [
  'adult-nursing',
  'adult-health',
  'mental-health',
  'child-nursing',
  'social-work',
  'technology',
  'ai',
  'crypto',
  'enterprise',
  'general',
] as const;

export type Domain = (typeof DOMAINS)[number];

export interface DomainInfo {
  id: Domain;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  color: string;
}

export const DOMAIN_CONFIG: Record<Domain, DomainInfo> = {
  'adult-nursing': {
    id: 'adult-nursing',
    name: 'Adult Nursing',
    description: 'Comprehensive care for adult patients across clinical settings',
    icon: 'Heart',
    gradient: 'from-rose-500 to-pink-600',
    color: '#f43f5e',
  },
  'adult-health': {
    id: 'adult-health',
    name: 'Adult Nursing',
    description: 'Comprehensive care for adult patients across clinical settings',
    icon: 'Heart',
    gradient: 'from-rose-500 to-pink-600',
    color: '#f43f5e',
  },
  'mental-health': {
    id: 'mental-health',
    name: 'Mental Health Nursing',
    description: 'Specialized psychiatric and mental wellness care',
    icon: 'Brain',
    gradient: 'from-purple-500 to-violet-600',
    color: '#8b5cf6',
  },
  'child-nursing': {
    id: 'child-nursing',
    name: 'Child Nursing',
    description: 'Pediatric care for infants, children, and adolescents',
    icon: 'Baby',
    gradient: 'from-blue-500 to-cyan-600',
    color: '#3b82f6',
  },
  'social-work': {
    id: 'social-work',
    name: 'Social Work',
    description: 'Community support and social welfare services',
    icon: 'Users',
    gradient: 'from-emerald-500 to-teal-600',
    color: '#10b981',
  },
  'technology': {
    id: 'technology',
    name: 'Technology',
    description: 'Software development and digital innovation',
    icon: 'Code',
    gradient: 'from-indigo-500 to-blue-600',
    color: '#6366f1',
  },
  'ai': {
    id: 'ai',
    name: 'Artificial Intelligence',
    description: 'Machine learning, AI agents, and intelligent systems',
    icon: 'Bot',
    gradient: 'from-violet-500 to-purple-600',
    color: '#7c3aed',
  },
  'crypto': {
    id: 'crypto',
    name: 'Crypto & Web3',
    description: 'Blockchain, cryptocurrencies, and decentralized systems',
    icon: 'Coins',
    gradient: 'from-amber-500 to-orange-600',
    color: '#f59e0b',
  },
  'enterprise': {
    id: 'enterprise',
    name: 'Enterprise Solutions',
    description: 'Business strategy and enterprise technology',
    icon: 'Building2',
    gradient: 'from-slate-600 to-gray-700',
    color: '#475569',
  },
  'general': {
    id: 'general',
    name: 'General',
    description: 'General articles and resources',
    icon: 'FileText',
    gradient: 'from-gray-500 to-slate-600',
    color: '#64748b',
  },
};

// ============================================================
// x402 Protocol Configuration
// ============================================================

export interface X402Config {
  enabled: boolean;
  defaultPrice: number;
  currency: string;
  facilitatorUrl?: string;
  supportedAssets: string[];
}

const DEFAULT_X402_CONFIG: X402Config = {
  enabled: true,
  defaultPrice: 0.001, // $0.001 per request
  currency: 'USD',
  facilitatorUrl: import.meta.env.VITE_X402_FACILITATOR_URL,
  supportedAssets: ['USDC', 'USDT', 'ETH'],
};

// ============================================================
// CMS Context
// ============================================================

interface CMSContextValue {
  // CMS Configuration
  cmsUrl: string;
  cmsToken?: string;
  
  // Domain helpers
  domains: readonly Domain[];
  getDomainInfo: (domain: Domain) => DomainInfo;
  getDomainName: (domain: Domain) => string;
  getDomainGradient: (domain: Domain) => string;
  getDomainColor: (domain: Domain) => string;
  
  // x402 Protocol
  x402Config: X402Config;
  isX402Enabled: boolean;
  
  // Media helpers
  resolveMediaUrl: (url?: string) => string | undefined;
}

const CMSContext = createContext<CMSContextValue | null>(null);

// ============================================================
// CMS Provider
// ============================================================

interface CMSProviderProps {
  children: ReactNode;
  x402Config?: Partial<X402Config>;
}

export function CMSProvider({ children, x402Config: customX402Config }: CMSProviderProps) {
  const cmsUrl = import.meta.env.VITE_CMS_URL || 'http://localhost:1337';
  const cmsToken = import.meta.env.VITE_CMS_TOKEN;

  const x402Config = useMemo(() => ({
    ...DEFAULT_X402_CONFIG,
    ...customX402Config,
  }), [customX402Config]);

  const value = useMemo<CMSContextValue>(() => ({
    cmsUrl,
    cmsToken,
    
    domains: DOMAINS,
    
    getDomainInfo: (domain: Domain) => DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.general,
    
    getDomainName: (domain: Domain) => DOMAIN_CONFIG[domain]?.name || 'General',
    
    getDomainGradient: (domain: Domain) => 
      DOMAIN_CONFIG[domain]?.gradient || DOMAIN_CONFIG.general.gradient,
    
    getDomainColor: (domain: Domain) => 
      DOMAIN_CONFIG[domain]?.color || DOMAIN_CONFIG.general.color,
    
    x402Config,
    isX402Enabled: x402Config.enabled,
    
    resolveMediaUrl: (url?: string) => {
      if (!url) return undefined;
      if (url.startsWith('http')) return url;
      return `${cmsUrl}${url}`;
    },
  }), [cmsUrl, cmsToken, x402Config]);

  return (
    <CMSContext.Provider value={value}>
      {children}
    </CMSContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useCMSContext() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMSContext must be used within a CMSProvider');
  }
  return context;
}

// ============================================================
// Utility Hooks
// ============================================================

export function useDomain(domain: Domain) {
  const { getDomainInfo, getDomainGradient, getDomainColor } = useCMSContext();
  
  return useMemo(() => ({
    ...getDomainInfo(domain),
    gradient: getDomainGradient(domain),
    color: getDomainColor(domain),
  }), [domain, getDomainInfo, getDomainGradient, getDomainColor]);
}

export function useX402() {
  const { x402Config, isX402Enabled } = useCMSContext();
  
  return useMemo(() => ({
    config: x402Config,
    isEnabled: isX402Enabled,
    formatPrice: (price: number) => {
      if (price < 0.01) {
        return `$${(price * 1000).toFixed(1)}m`; // millicents
      }
      return `$${price.toFixed(3)}`;
    },
  }), [x402Config, isX402Enabled]);
}

// ============================================================
// Static Helpers (can be used outside React)
// ============================================================

export function getDomainInfoStatic(domain: string): DomainInfo {
  return DOMAIN_CONFIG[domain as Domain] || DOMAIN_CONFIG.general;
}

export function isDomainValid(domain: string): domain is Domain {
  return DOMAINS.includes(domain as Domain);
}

export function getAllDomains(): DomainInfo[] {
  return Object.values(DOMAIN_CONFIG);
}

export function getDomainsByCategory(category: 'healthcare' | 'technology' | 'business' | 'all'): DomainInfo[] {
  switch (category) {
    case 'healthcare':
      return [
        DOMAIN_CONFIG['adult-health'],
        DOMAIN_CONFIG['mental-health'],
        DOMAIN_CONFIG['child-nursing'],
        DOMAIN_CONFIG['social-work'],
      ];
    case 'technology':
      return [
        DOMAIN_CONFIG['technology'],
        DOMAIN_CONFIG['ai'],
        DOMAIN_CONFIG['crypto'],
      ];
    case 'business':
      return [
        DOMAIN_CONFIG['enterprise'],
        DOMAIN_CONFIG['general'],
      ];
    case 'all':
    default:
      return getAllDomains();
  }
}

export default CMSProvider;
