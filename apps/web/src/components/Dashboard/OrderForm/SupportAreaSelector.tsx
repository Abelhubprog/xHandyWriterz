/**
 * Support Area Selector
 * First step in order flow - choose subject domain
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SUPPORT_AREAS, type SupportArea } from './types';

interface SupportAreaSelectorProps {
  selectedArea: string | null;
  onSelect: (areaId: string) => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function SupportAreaSelector({
  selectedArea,
  onSelect,
  className,
}: SupportAreaSelectorProps) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Select Your Subject Area
      </h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {SUPPORT_AREAS.map((area) => (
          <SupportAreaCard
            key={area.id}
            area={area}
            isSelected={selectedArea === area.id}
            onSelect={() => onSelect(area.id)}
          />
        ))}
      </motion.div>
    </div>
  );
}

interface SupportAreaCardProps {
  area: SupportArea;
  isSelected: boolean;
  onSelect: () => void;
}

function SupportAreaCard({ area, isSelected, onSelect }: SupportAreaCardProps) {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onSelect}
      className={cn(
        'p-4 rounded-xl border-2 text-left transition-all duration-200',
        'hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isSelected
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      )}
    >
      <div className="flex items-center gap-3">
        {area.icon && (
          <span className="text-2xl" role="img" aria-label={area.title}>
            {area.icon}
          </span>
        )}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {area.title}
        </span>
      </div>
    </motion.button>
  );
}

export default SupportAreaSelector;
