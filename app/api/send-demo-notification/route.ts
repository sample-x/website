import { NextResponse } from 'next/server';

// This is a simple email sending API using EmailJS
// For production, consider using a more robust service like Resend, SendGrid, or AWS SES
export async function POST(req: Request) {
  try {
    const { appointment } = await req.json();
    
    // Format the date and time for better readability
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);
    
    const formattedDate = startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedStartTime = startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    
    const formattedEndTime = endTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    // EmailJS template parameters
    const templateParams = {
      to_email: "YOUR_EMAIL@example.com", // Replace with your email address
      from_name: "Samplex Demo System",
      user_email: appointment.email,
      user_name: appointment.name,
      demo_date: formattedDate,
      demo_time: `${formattedStartTime} - ${formattedEndTime} PT`,
      demo_id: appointment.id
    };

    // Using EmailJS to send emails without a server
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID, // Create and add to .env file
        template_id: process.env.EMAILJS_TEMPLATE_ID, // Create and add to .env file
        user_id: process.env.EMAILJS_USER_ID, // Create and add to .env file
        template_params: templateParams
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending demo notification email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email notification' }, { status: 500 });
  }
} 