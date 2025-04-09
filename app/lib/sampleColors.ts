// Sample type color definitions for consistent visualization across the app
// This includes both standard and extended sample types

// Base color palette for standard sample types
export const standardSampleTypeColors: { [key: string]: string } = {
  'bacterial': '#10b981', // Green
  'viral': '#db2777',    // Pink
  'fungal': '#f59e0b',   // Amber
  'tissue': '#ef4444',   // Red
  'environmental': '#3b82f6', // Blue
  'cell line': '#8b5cf6', // Purple
  'soil': '#92400e',     // Brown
  'botanical': '#65a30d', // Lime
  'dna': '#7c3aed',      // Violet
  'water': '#0ea5e9',    // Sky blue
  'industrial': '#64748b', // Slate
};

// Extended color palette for new sample types
export const extendedSampleTypeColors: { [key: string]: string } = {
  'genomic': '#0d9488',   // Teal
  'protein': '#6366f1',   // Indigo
  'microbiome': '#2dd4bf', // Turquoise
  'molecular': '#ec4899', // Pink
  'sequencing': '#a78bfa', // Purple
  'immunological': '#f43f5e', // Rose
};

// Generate color for any sample type
export function getSampleTypeColor(type: string | null | undefined): string {
  if (!type) return '#6b7280'; // Default gray
  
  const typeLower = type.toLowerCase();
  
  // First check standard types
  if (standardSampleTypeColors[typeLower]) {
    return standardSampleTypeColors[typeLower];
  }
  
  // Then check extended types
  if (extendedSampleTypeColors[typeLower]) {
    return extendedSampleTypeColors[typeLower];
  }
  
  // For types not explicitly defined, try to find partial matches
  // Check if the type contains any of our known type keywords
  for (const [key, color] of Object.entries({...standardSampleTypeColors, ...extendedSampleTypeColors})) {
    if (typeLower.includes(key)) {
      return color;
    }
  }
  
  // Generate consistent colors for completely new types using hash function
  return stringToColor(typeLower);
}

// Generate a consistent color from a string (for dynamic new types)
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color with good saturation and lightness
  // Use only the hue from the hash to maintain consistent colors
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

// Get all known sample types for UI elements like filters and legends
export function getKnownSampleTypes(): { id: string, name: string, color: string }[] {
  const types: { id: string, name: string, color: string }[] = [];
  
  // Add standard types
  Object.entries(standardSampleTypeColors).forEach(([id, color]) => {
    types.push({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
      color
    });
  });
  
  // Add extended types
  Object.entries(extendedSampleTypeColors).forEach(([id, color]) => {
    types.push({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
      color
    });
  });
  
  return types;
}

// Function to get active sample types from sample data
export function getActiveSampleTypes(samples: any[]): { id: string, name: string, color: string }[] {
  // Get all unique types from sample data
  const uniqueTypes = new Set<string>();
  
  samples.forEach(sample => {
    if (sample.type) {
      uniqueTypes.add(sample.type.toLowerCase());
    }
  });
  
  // Map these to our type definitions with colors
  const activeTypes: { id: string, name: string, color: string }[] = [];
  
  uniqueTypes.forEach(type => {
    activeTypes.push({
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize
      color: getSampleTypeColor(type)
    });
  });
  
  return activeTypes;
} 