import { Sample } from '@/types/sample'

// SamplesMap component props
export interface SamplesMapProps {
  samples: Sample[]
  selectedSample: Sample | null
  onSampleSelect: (sample: Sample) => void
} 