import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole?: string;
  authorCompany?: string;
  authorAvatar?: string;
  rating?: number;
  domain?: string;
  featured?: boolean;
}

export interface TestimonialSectionProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  variant?: 'carousel' | 'grid' | 'featured' | 'marquee';
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, variant = 'default' }: { testimonial: Testimonial; variant?: 'default' | 'featured' }) {
  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-12 shadow-2xl"
      >
        {/* Quote Icon */}
        <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
          <Quote className="h-6 w-6 text-white" />
        </div>

        {/* Rating */}
        {testimonial.rating && (
          <div className="mb-6 flex justify-center">
            <StarRating rating={testimonial.rating} />
          </div>
        )}

        {/* Quote */}
        <blockquote className="mb-8 text-center text-xl font-medium leading-relaxed text-white md:text-2xl lg:text-3xl">
          "{testimonial.quote}"
        </blockquote>

        {/* Author */}
        <div className="flex flex-col items-center gap-4">
          {testimonial.authorAvatar && (
            <img
              src={testimonial.authorAvatar}
              alt={testimonial.authorName}
              className="h-16 w-16 rounded-full object-cover ring-4 ring-white/20"
            />
          )}
          <div className="text-center">
            <p className="text-lg font-semibold text-white">{testimonial.authorName}</p>
            {(testimonial.authorRole || testimonial.authorCompany) && (
              <p className="text-slate-400">
                {testimonial.authorRole}
                {testimonial.authorRole && testimonial.authorCompany && ' at '}
                {testimonial.authorCompany}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1"
    >
      {/* Quote Icon */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100">
        <Quote className="h-5 w-5 text-blue-600" />
      </div>

      {/* Rating */}
      {testimonial.rating && (
        <div className="mb-4">
          <StarRating rating={testimonial.rating} />
        </div>
      )}

      {/* Quote */}
      <blockquote className="mb-6 text-slate-700 leading-relaxed">
        "{testimonial.quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        {testimonial.authorAvatar ? (
          <img
            src={testimonial.authorAvatar}
            alt={testimonial.authorName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-semibold text-white">
            {testimonial.authorName.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-900">{testimonial.authorName}</p>
          {(testimonial.authorRole || testimonial.authorCompany) && (
            <p className="text-sm text-slate-500">
              {testimonial.authorRole}
              {testimonial.authorRole && testimonial.authorCompany && ', '}
              {testimonial.authorCompany}
            </p>
          )}
        </div>
      </div>

      {/* Domain Badge */}
      {testimonial.domain && (
        <span className="absolute right-4 top-4 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {testimonial.domain}
        </span>
      )}
    </motion.div>
  );
}

export function TestimonialSection({
  testimonials,
  title = "What Our Clients Say",
  subtitle,
  variant = 'carousel',
  autoPlay = true,
  autoPlayInterval = 5000,
  className
}: TestimonialSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isPlaying || variant !== 'carousel' || testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, variant, testimonials.length, autoPlayInterval]);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  if (variant === 'marquee') {
    return (
      <section className={cn("py-16 md:py-24 overflow-hidden bg-slate-50", className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{title}</h2>
            {subtitle && (
              <p className="mx-auto max-w-2xl text-lg text-slate-600">{subtitle}</p>
            )}
          </motion.div>
        </div>

        {/* Marquee */}
        <div className="relative">
          <div className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-slate-50 to-transparent" />
          <div className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-slate-50 to-transparent" />
          
          <motion.div
            animate={{ x: [0, -1920] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="flex gap-6"
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div key={`${testimonial.id}-${index}`} className="w-96 flex-shrink-0">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === 'grid') {
    return (
      <section className={cn("py-16 md:py-24", className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{title}</h2>
            {subtitle && (
              <p className="mx-auto max-w-2xl text-lg text-slate-600">{subtitle}</p>
            )}
          </motion.div>

          {/* Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === 'featured') {
    const featuredTestimonial = testimonials.find(t => t.featured) || testimonials[0];
    const otherTestimonials = testimonials.filter(t => t.id !== featuredTestimonial.id);

    return (
      <section className={cn("py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white", className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{title}</h2>
            {subtitle && (
              <p className="mx-auto max-w-2xl text-lg text-slate-600">{subtitle}</p>
            )}
          </motion.div>

          {/* Featured Testimonial */}
          <div className="mb-12">
            <TestimonialCard testimonial={featuredTestimonial} variant="featured" />
          </div>

          {/* Other Testimonials */}
          {otherTestimonials.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {otherTestimonials.slice(0, 3).map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  // Default: carousel
  return (
    <section className={cn("py-16 md:py-24 bg-gradient-to-br from-slate-900 to-slate-800", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">{title}</h2>
          {subtitle && (
            <p className="mx-auto max-w-2xl text-lg text-slate-300">{subtitle}</p>
          )}
        </motion.div>

        {/* Carousel */}
        <div className="relative mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            <TestimonialCard
              key={testimonials[activeIndex].id}
              testimonial={testimonials[activeIndex]}
              variant="featured"
            />
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {/* Prev Button */}
            <button
              onClick={goToPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === activeIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/30 hover:bg-white/50"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;
