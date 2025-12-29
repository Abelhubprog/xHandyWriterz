import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HeroSectionProps {
  title: string;
  description: string;
  accentColor: string;
  ctaText: string;
  onCtaClick?: () => void;
}

export function HeroSection({ title, description, accentColor, ctaText, onCtaClick }: HeroSectionProps) {
  return (
    <section className={`bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 text-white py-20 px-4`}>
      <div className="container mx-auto text-center">
        <Card className="bg-transparent border-none">
          <CardHeader className="space-y-4">
            <CardTitle className="text-4xl md:text-6xl font-bold">
              {title}
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl max-w-2xl mx-auto">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100"
              onClick={onCtaClick}
            >
              {ctaText}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
