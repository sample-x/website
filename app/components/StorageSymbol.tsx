import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSnowflake, 
  faTemperatureLow, 
  faTemperatureHigh,
  faFlask
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';

interface StorageSymbolProps {
  condition: string;
  id?: string;
}

const getStorageInfo = (condition: string) => {
  const normalized = condition.toLowerCase();
  
  if (normalized.includes('liquid nitrogen') || normalized.includes('-150') || normalized.includes('cryopreserved')) {
    return {
      icon: faSnowflake,
      color: '#3b82f6', // blue
      tooltip: 'Cryopreserved (-150°C or below)'
    };
  }
  
  if (normalized.includes('-80') || normalized.includes('ultra') || normalized.includes('-70')) {
    return {
      icon: faSnowflake,
      color: '#6366f1', // indigo
      tooltip: 'Ultra-frozen (-80°C)'
    };
  }
  
  if (normalized.includes('-20') || normalized.includes('frozen')) {
    return {
      icon: faTemperatureLow,
      color: '#8b5cf6', // purple
      tooltip: 'Frozen (-20°C)'
    };
  }
  
  if (normalized.includes('4') || normalized.includes('refrigerat')) {
    return {
      icon: faTemperatureLow,
      color: '#10b981', // green
      tooltip: 'Refrigerated (4°C)'
    };
  }
  
  if (normalized.includes('room') || normalized.includes('ambient')) {
    return {
      icon: faTemperatureHigh,
      color: '#f59e0b', // amber
      tooltip: 'Room Temperature'
    };
  }
  
  return {
    icon: faFlask,
    color: '#6b7280', // gray
    tooltip: condition || 'Storage condition not specified'
  };
};

export default function StorageSymbol({ condition, id = 'storage-tooltip' }: StorageSymbolProps) {
  const { icon, color, tooltip } = getStorageInfo(condition);
  const tooltipId = `${id}-${condition.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  return (
    <>
      <FontAwesomeIcon 
        icon={icon} 
        style={{ color, fontSize: '1.2em' }}
        data-tooltip-id={tooltipId}
        data-tooltip-content={tooltip}
      />
      <Tooltip id={tooltipId} />
    </>
  );
} 