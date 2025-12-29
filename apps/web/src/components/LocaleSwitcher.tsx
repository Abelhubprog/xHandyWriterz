/**
 * Locale Switcher Component (F-034)
 * 
 * Provides UI for switching between available content locales.
 * Integrates with Strapi i18n to fetch localized content.
 * 
 * Features:
 * - Dropdown menu with available locales
 * - Persists selected locale to localStorage
 * - Updates URL query param for sharing localized links
 * - Displays locale names in native language
 */

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface Locale {
  code: string;
  name: string;
  nativeName: string;
}

// Supported locales matching Strapi configuration
export const SUPPORTED_LOCALES: Locale[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

const LOCALE_STORAGE_KEY = 'handywriterz_locale';

export interface LocaleSwitcherProps {
  /**
   * Callback when locale changes
   */
  onLocaleChange?: (locale: string) => void;
  
  /**
   * Current locale (controlled mode)
   */
  value?: string;
  
  /**
   * Show label alongside icon
   */
  showLabel?: boolean;
  
  /**
   * Compact mode (icon only)
   */
  compact?: boolean;
}

/**
 * Get current locale from localStorage or URL
 */
export function getCurrentLocale(): string {
  // Check URL query param first
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlLocale = params.get('locale');
    if (urlLocale && SUPPORTED_LOCALES.some((l) => l.code === urlLocale)) {
      return urlLocale;
    }

    // Check localStorage
    const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedLocale && SUPPORTED_LOCALES.some((l) => l.code === storedLocale)) {
      return storedLocale;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LOCALES.some((l) => l.code === browserLang)) {
      return browserLang;
    }
  }

  // Default to English
  return 'en';
}

/**
 * Persist locale selection
 */
export function setLocale(locale: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);

    // Update URL query param
    const url = new URL(window.location.href);
    url.searchParams.set('locale', locale);
    window.history.replaceState({}, '', url.toString());
  }
}

export function LocaleSwitcher({
  onLocaleChange,
  value,
  showLabel = false,
  compact = false,
}: LocaleSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState<string>(value || getCurrentLocale());

  useEffect(() => {
    if (value !== undefined) {
      setCurrentLocale(value);
    }
  }, [value]);

  const handleLocaleChange = (locale: string) => {
    setCurrentLocale(locale);
    setLocale(locale);

    if (onLocaleChange) {
      onLocaleChange(locale);
    }

    // Reload page to fetch localized content
    window.location.reload();
  };

  const currentLocaleObj = SUPPORTED_LOCALES.find((l) => l.code === currentLocale);

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {SUPPORTED_LOCALES.map((locale) => (
            <DropdownMenuItem
              key={locale.code}
              onClick={() => handleLocaleChange(locale.code)}
              className={currentLocale === locale.code ? 'bg-accent' : ''}
            >
              <span className="font-medium">{locale.nativeName}</span>
              {currentLocale === locale.code && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {showLabel && <span>{currentLocaleObj?.nativeName || 'English'}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {SUPPORTED_LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className={currentLocale === locale.code ? 'bg-accent' : ''}
          >
            <div className="flex flex-col">
              <span className="font-medium">{locale.nativeName}</span>
              <span className="text-xs text-muted-foreground">{locale.name}</span>
            </div>
            {currentLocale === locale.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Hook to access current locale in components
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<string>(getCurrentLocale());

  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  };

  return {
    locale,
    changeLocale,
    currentLocaleObj: SUPPORTED_LOCALES.find((l) => l.code === locale),
    supportedLocales: SUPPORTED_LOCALES,
  };
}
