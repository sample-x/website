export const sampleTypeColors: { [key: string]: string } = {
  'bacterial culture': '#4CAF50',
  'tissue sample': '#F44336',
  'water sample': '#2196F3',
  'soil sample': '#795548',
  'plant sample': '#8BC34A',
  'animal sample': '#FF9800',
  'mineral sample': '#9C27B0',
  'chemical sample': '#607D8B',
  'default': '#9E9E9E'
};

export const ITEMS_PER_PAGE = 10;

export const SAMPLE_TYPES = [
  'bacterial culture',
  'tissue sample',
  'water sample',
  'soil sample',
  'plant sample',
  'animal sample',
  'mineral sample',
  'chemical sample'
] as const;

export const STORAGE_CONDITIONS = [
  'Room Temperature',
  'Refrigerated (2-8°C)',
  'Frozen (-20°C)',
  'Ultra-Low (-80°C)',
  'Liquid Nitrogen (-196°C)',
  'Vacuum Sealed',
  'Desiccated'
] as const; 