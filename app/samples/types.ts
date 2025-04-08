import { Sample } from '@/types/sample'

// SamplesMap component props
export interface SamplesMapProps {
  samples: Sample[]
  onSelectSample?: (sample: Sample) => void
  onAddToCart?: (sample: Sample) => void
  selectedSample?: Sample | null
} 