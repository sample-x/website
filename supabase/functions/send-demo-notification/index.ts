// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@1.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "no-reply@samplex.com";

// Initialize Resend with your API key
const resend = new Resend(RESEND_API_KEY);

serve(async (req) => {
  // CORS preflight handler
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

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

    // Send email to admin
    const emailToAdmin = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: "New Demo Scheduled",
      html: `
        <h1>New Demo Request</h1>
        <p>A new demo has been scheduled with the following details:</p>
        <ul>
          <li><strong>Name:</strong> ${appointment.name}</li>
          <li><strong>Email:</strong> ${appointment.email}</li>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time:</strong> ${formattedStartTime} - ${formattedEndTime} PT</li>
        </ul>
        <p>Please make sure to confirm this appointment with the user.</p>
      `,
    });

    // Send confirmation email to user
    const emailToUser = await resend.emails.send({
      from: FROM_EMAIL,
      to: appointment.email,
      subject: "Your Demo Request Confirmation",
      html: `
        <h1>Demo Scheduled</h1>
        <p>Hello ${appointment.name},</p>
        <p>Thank you for scheduling a demo with Samplex. Your demo is confirmed for:</p>
        <p><strong>Date:</strong> ${formattedDate}<br>
        <strong>Time:</strong> ${formattedStartTime} - ${formattedEndTime} PT</p>
        <p>Our team will reach out with further details and a meeting link before your scheduled time.</p>
        <p>If you need to reschedule or have any questions, please reply to this email.</p>
        <p>Best regards,<br>The Samplex Team</p>
      `,
    });

    return new Response(
      JSON.stringify({
        success: true,
        adminEmail: emailToAdmin,
        userEmail: emailToUser
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}); 