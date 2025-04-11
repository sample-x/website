export interface DemoSlot {
  title: string;
  start: Date;
  end: Date;
  available: boolean;
}

export interface SelectedSlot {
  start: Date;
  end: Date;
}

export interface DemoAppointment {
  id: string;
  email: string;
  name: string;
  start: Date;
  end: Date;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
} 