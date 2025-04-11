'use client';

import { useState } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'react-toastify';
import { DemoSlot, SelectedSlot } from './types';
import { useAuth } from '../auth/AuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define available time slots (9 AM to 5 PM Pacific Time, Monday to Friday)
const generateAvailableSlots = (): DemoSlot[] => {
  const events: DemoSlot[] = [];
  const currentDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // Show availability for next 30 days

  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Monday to Friday
      for (let hour = 9; hour < 17; hour++) { // 9 AM to 5 PM PT
        const start = new Date(currentDate);
        start.setHours(hour, 0, 0);
        const end = new Date(currentDate);
        end.setHours(hour + 1, 0, 0);
        
        events.push({
          title: 'Available',
          start,
          end,
          available: true,
        });
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return events;
};

export default function DemoPage() {
  const supabase = createClientComponentClient();
  const { user, profile } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [availableSlots] = useState<DemoSlot[]>(generateAvailableSlots());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const slot = availableSlots.find(
      (slot) => 
        slot.start.getTime() === slotInfo.start.getTime() &&
        slot.end.getTime() === slotInfo.end.getTime()
    );

    if (slot && slot.available) {
      setSelectedSlot({
        start: slotInfo.start,
        end: slotInfo.end,
      });
    }
  };

  const handleScheduleDemo = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot first');
      return;
    }

    if (!user) {
      toast.error('Please sign in to schedule a demo');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if the slot is still available
      const { data: existingAppointments, error: checkError } = await supabase
        .from('demo_appointments')
        .select('id')
        .eq('status', 'scheduled')
        .gte('start_time', selectedSlot.start.toISOString())
        .lt('start_time', selectedSlot.end.toISOString());

      if (checkError) {
        throw new Error('Failed to check slot availability');
      }

      if (existingAppointments && existingAppointments.length > 0) {
        toast.error('This time slot is no longer available. Please select another time.');
        return;
      }

      // Save the appointment
      const { error: insertError } = await supabase
        .from('demo_appointments')
        .insert({
          user_id: user.id,
          email: user.email,
          name: profile ? `${profile.first_name} ${profile.last_name}` : user.email,
          start_time: selectedSlot.start.toISOString(),
          end_time: selectedSlot.end.toISOString(),
          status: 'scheduled',
        });

      if (insertError) {
        throw insertError;
      }

      toast.success('Demo scheduled successfully! We will send you a confirmation email shortly.');
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error scheduling demo:', error);
      toast.error('Failed to schedule demo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Schedule a Demo
          </h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg">
              Ready to explore Samplex? Schedule a personalized demo with our team
              to learn how we can help streamline your sample management process.
            </p>
            <h2 className="text-xl font-semibold mt-6">What you'll learn:</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Overview of the Samplex platform and its key features</li>
              <li>Best practices for managing and tracking samples</li>
              <li>How to optimize your sample exchange workflow</li>
              <li>Tips for collaboration and team management</li>
              <li>Security features and data protection measures</li>
            </ul>
            {!user && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Please sign in to schedule a demo.
                </p>
              </div>
            )}
            {selectedSlot && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Selected Time Slot
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  {format(selectedSlot.start, 'MMMM do, yyyy h:mm a')} -{' '}
                  {format(selectedSlot.end, 'h:mm a')} PT
                </p>
                <button
                  onClick={handleScheduleDemo}
                  disabled={!user || isSubmitting}
                  className={`mt-4 px-6 py-2 rounded-md transition-colors ${
                    user && !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Demo'}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Calendar
            localizer={localizer}
            events={availableSlots}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            selectable
            onSelectSlot={handleSelectSlot}
            defaultView="week"
            views={['week', 'month']}
            min={new Date(0, 0, 0, 9, 0, 0)} // 9 AM
            max={new Date(0, 0, 0, 17, 0, 0)} // 5 PM
            eventPropGetter={(event: DemoSlot) => ({
              className: event.available ? 'bg-green-500' : 'bg-gray-500',
            })}
          />
        </div>
      </div>
    </div>
  );
} 