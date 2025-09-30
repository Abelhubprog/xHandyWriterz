import React from 'react';
import { Clock, Database, HardDrive, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface DataSourceIndicatorProps {
  source: 'database' | 'cache' | 'local' | 'default' | null;
  timestamp?: Date | null;
  className?: string;
}

export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({
  source,
  timestamp,
  className = ''
}) => {
  if (!source) return null;
  
  let icon;
  let label;
  let description;
  let color;
  
  switch (source) {
    case 'database':
      icon = <Database className="h-4 w-4" />;
      label = 'Live Data';
      description = 'This data is fresh from the database';
      color = 'text-green-600';
      break;
    case 'cache':
      icon = <HardDrive className="h-4 w-4" />;
      label = 'Cached Data';
      description = timestamp 
        ? `This data was cached on ${timestamp.toLocaleString()}`
        : 'This data is from the cache due to a database connection issue';
      color = 'text-amber-600';
      break;
    case 'default':
      icon = <AlertCircle className="h-4 w-4" />;
      label = 'Fallback Data';
      description = 'This is fallback data shown due to a database connection issue';
      color = 'text-red-600';
      break;
    default:
      icon = <Clock className="h-4 w-4" />;
      label = 'Local Data';
      description = 'This data is stored locally';
      color = 'text-blue-600';
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 text-xs ${color} ${className}`}>
            {icon}
            <span>{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{description}</p>
          {source !== 'database' && (
            <p className="text-xs mt-1 text-gray-500">
              We'll automatically update when the database connection is restored.
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 