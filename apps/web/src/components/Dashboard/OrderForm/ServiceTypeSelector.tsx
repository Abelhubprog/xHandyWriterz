/**
 * Service Type Selector
 * Second step in order flow - choose service type (dissertation, essay, etc.)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SERVICE_TYPES, type ServiceType } from './types';

interface ServiceTypeSelectorProps {
  selectedService: ServiceType | null;
  onSelect: (service: ServiceType) => void;
  onBack: () => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function ServiceTypeSelector({
  selectedService,
  onSelect,
  onBack,
  className,
}: ServiceTypeSelectorProps) {
  const handleSelect = (service: ServiceType) => {
    // Turnitin redirects to dedicated page
    if (service.id === 'turnitin') {
      window.location.href = '/turnitin/submit';
      return;
    }
    onSelect(service);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Select Service Type
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {SERVICE_TYPES.map((service) => (
          <ServiceTypeCard
            key={service.id}
            service={service}
            isSelected={selectedService?.id === service.id}
            onSelect={() => handleSelect(service)}
          />
        ))}
      </motion.div>
    </div>
  );
}

interface ServiceTypeCardProps {
  service: ServiceType;
  isSelected: boolean;
  onSelect: () => void;
}

function ServiceTypeCard({ service, isSelected, onSelect }: ServiceTypeCardProps) {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onSelect}
      className={cn(
        'p-5 rounded-xl border-2 text-left transition-all duration-200',
        'hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isSelected
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      )}
    >
      <div className="flex items-start gap-4">
        {service.icon && (
          <span className="text-2xl flex-shrink-0" role="img" aria-label={service.title}>
            {service.icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            {service.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {service.desc}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default ServiceTypeSelector;
