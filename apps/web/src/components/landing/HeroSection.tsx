import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, Bot, Coins, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeroSectionProps {
  title?: string;
  highlightedText?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  };
  stats?: Array<{
    value: string;
    label: string;
  }>;
  features?: Array<
    | {
        icon?: string;
        text: string;
      }
    | string
  >;
  image?: string;
  variant?: 'default' | 'centered' | 'split' | 'gradient';
  showX402Badge?: boolean;
  className?: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export function HeroSection({
  title = "Professional Content Platform",
  highlightedText = "World-Class",
  subtitle = "for the Modern Web",
  description = "Access premium content across healthcare, technology, and enterprise domains. Built for humans, powered by AI.",
  primaryCTA = { text: "Explore Content", href: "/articles" },
  secondaryCTA = { text: "Our Services", href: "/services" },
  stats,
  features,
  image,
  variant = 'default',
  showX402Badge = true,
  className
}: HeroSectionProps) {
  const normalizedFeatures = (features ?? []).map((feature) =>
    typeof feature === 'string' ? { text: feature } : feature
  );
  
  if (variant === 'centered') {
    return (
      <section className={cn("relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white", className)}>
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        <div className="container relative z-10 mx-auto px-4 py-20 text-center">
          {/* X402 Badge */}
          {showX402Badge && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 px-5 py-2.5 text-sm font-medium text-violet-700 ring-1 ring-violet-200"
            >
              <Bot className="h-4 w-4" />
              <span>x402 Protocol Enabled</span>
              <Coins className="h-4 w-4" />
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-6 text-5xl font-bold tracking-tight text-slate-900 md:text-6xl lg:text-7xl"
          >
            {title}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              {highlightedText}
            </span>
            <br />
            {subtitle}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mx-auto mb-10 max-w-2xl text-xl text-slate-600"
          >
            {description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.div variants={fadeInUp}>
              <Link
                to={primaryCTA.href}
                onClick={primaryCTA.onClick}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                {primaryCTA.text}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Link
                to={secondaryCTA.href}
                onClick={secondaryCTA.onClick}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-slate-700 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                {secondaryCTA.text}
              </Link>
            </motion.div>
          </motion.div>

          {/* Features */}
          {normalizedFeatures.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mb-16 flex flex-wrap items-center justify-center gap-6"
            >
              {normalizedFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="flex items-center gap-2 text-slate-600"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Stats */}
          {stats && stats.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mx-auto grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4"
            >
              {stats.map((stat, index) => (
                <motion.div key={index} variants={scaleIn} className="text-center">
                  <div className="text-3xl font-bold text-slate-900 md:text-4xl">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={floatingAnimation}
          className="absolute left-[10%] top-[20%] h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-xl"
        />
        <motion.div
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.5 } }}
          className="absolute right-[15%] top-[30%] h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-xl"
        />
        <motion.div
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
          className="absolute left-[20%] bottom-[20%] h-24 w-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 opacity-20 blur-xl"
        />
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section className={cn("relative min-h-screen overflow-hidden bg-white", className)}>
        <div className="container mx-auto grid min-h-screen items-center gap-12 px-4 py-20 lg:grid-cols-2">
          {/* Content */}
          <div>
            {/* X402 Badge */}
            {showX402Badge && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={scaleIn}
                className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 px-4 py-2 text-sm font-medium text-violet-700"
              >
                <Bot className="h-4 w-4" />
                <span>x402 Protocol</span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl"
            >
              {title}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {highlightedText}
              </span>{' '}
              {subtitle}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mb-8 max-w-lg text-lg text-slate-600"
            >
              {description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mb-10 flex flex-wrap gap-4"
            >
              <motion.div variants={fadeInUp}>
                <Link
                  to={primaryCTA.href}
                  onClick={primaryCTA.onClick}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white transition-all hover:bg-slate-800"
                >
                  {primaryCTA.text}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link
                  to={secondaryCTA.href}
                  onClick={secondaryCTA.onClick}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3.5 font-semibold text-slate-700 transition-all hover:bg-slate-200"
                >
                  {secondaryCTA.text}
                </Link>
              </motion.div>
            </motion.div>

            {/* Features */}
            {normalizedFeatures.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="flex flex-wrap gap-4"
              >
                {normalizedFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {feature.text}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Image/Visual */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative"
          >
            {image ? (
              <img
                src={image}
                alt="Hero"
                className="rounded-3xl shadow-2xl"
              />
            ) : (
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 p-8">
                {/* Placeholder Visual */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
                <div className="relative z-10 grid h-full grid-cols-2 gap-4">
                  <motion.div
                    animate={floatingAnimation}
                    className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl"
                  >
                    <Shield className="h-12 w-12" />
                  </motion.div>
                  <motion.div
                    animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.3 } }}
                    className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-xl"
                  >
                    <Sparkles className="h-12 w-12" />
                  </motion.div>
                  <motion.div
                    animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.6 } }}
                    className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl"
                  >
                    <Zap className="h-12 w-12" />
                  </motion.div>
                  <motion.div
                    animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.9 } }}
                    className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl"
                  >
                    <Bot className="h-12 w-12" />
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === 'gradient') {
    return (
      <section className={cn("relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900", className)}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.15),transparent_50%)]" />
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.1), transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(139,92,246,0.1), transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.1), transparent 50%)',
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          />
        </div>

        <div className="container relative z-10 mx-auto flex min-h-screen items-center px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* X402 Badge */}
            {showX402Badge && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={scaleIn}
                className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm ring-1 ring-white/20"
              >
                <Bot className="h-5 w-5 text-violet-400" />
                <span>x402 Protocol - AI Payments Enabled</span>
                <Coins className="h-5 w-5 text-amber-400" />
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mb-8 text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl"
            >
              {title}
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {highlightedText}
              </span>{' '}
              {subtitle}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mx-auto mb-12 max-w-2xl text-xl text-slate-300"
            >
              {description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <motion.div variants={fadeInUp}>
                <Link
                  to={primaryCTA.href}
                  onClick={primaryCTA.onClick}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-slate-900 shadow-xl shadow-white/10 transition-all hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5"
                >
                  {primaryCTA.text}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link
                  to={secondaryCTA.href}
                  onClick={secondaryCTA.onClick}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm ring-1 ring-white/20 transition-all hover:bg-white/20"
                >
                  {secondaryCTA.text}
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="mx-auto grid max-w-3xl grid-cols-2 gap-8 rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 md:grid-cols-4"
              >
                {stats.map((stat, index) => (
                  <motion.div key={index} variants={scaleIn} className="text-center">
                    <div className="text-3xl font-bold text-white md:text-4xl">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className={cn("relative min-h-[85vh] flex items-center overflow-hidden bg-white", className)}>
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            {/* X402 Badge */}
            {showX402Badge && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={scaleIn}
                className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700"
              >
                <Bot className="h-4 w-4" />
                <span>x402 Protocol Ready</span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl"
            >
              {title}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {highlightedText}
              </span>{' '}
              {subtitle}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mb-8 max-w-lg text-lg text-slate-600"
            >
              {description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-wrap gap-4"
            >
              <motion.div variants={fadeInUp}>
                <Link
                  to={primaryCTA.href}
                  onClick={primaryCTA.onClick}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white transition-all hover:bg-slate-800"
                >
                  {primaryCTA.text}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link
                  to={secondaryCTA.href}
                  onClick={secondaryCTA.onClick}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  {secondaryCTA.text}
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats Card */}
          {stats && stats.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="relative"
            >
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl md:p-12">
                <div className="grid grid-cols-2 gap-8">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-4xl font-bold text-white md:text-5xl">{stat.value}</div>
                      <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Decorative */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 opacity-20 blur-2xl" />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
