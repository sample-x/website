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
        end.setHours(hour, 30, 0); // 30-minute slots
        
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
  const [showConfirmation, setShowConfirmation] = useState(false);

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

      setShowConfirmation(true);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error scheduling demo:', error);
      toast.error('Failed to schedule demo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Demo Scheduled!</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Thank you for scheduling a demo with us. We will send you a confirmation email shortly with the meeting details.
            </p>
            <button
              onClick={() => setShowConfirmation(false)}
              className="mt-6 px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Schedule Another Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Schedule Demo
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Ready to explore Samplex? Schedule a personalized demo with our team
              to learn how we can help streamline your sample management process.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">What you'll learn:</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-orange-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">Overview of the Samplex platform and its key features</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-orange-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">Best practices for managing and tracking samples</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-orange-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">How to optimize your sample exchange workflow</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-orange-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">Tips for collaboration and team management</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-orange-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">Security features and data protection measures</span>
              </li>
            </ul>
          </div>

          {!user && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6">
              <p className="text-orange-800 dark:text-orange-200">
                Please sign in to schedule a demo.
              </p>
            </div>
          )}

          {selectedSlot && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Selected Time Slot
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {format(selectedSlot.start, 'MMMM do, yyyy h:mm a')} -{' '}
                {format(selectedSlot.end, 'h:mm a')} PT
              </p>
              <button
                onClick={handleScheduleDemo}
                disabled={!user || isSubmitting}
                className={`w-full px-6 py-3 rounded-lg transition-colors ${
                  user && !isSubmitting
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Demo'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
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
              className: `${
                selectedSlot &&
                event.start.getTime() === selectedSlot.start.getTime() &&
                event.end.getTime() === selectedSlot.end.getTime()
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`,
            })}
          />
        </div>
      </div>
    </div>
  );
} 