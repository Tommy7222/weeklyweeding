import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, phone, email, address, plan } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !address || !plan) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save to Supabase database
    const { error: dbError } = await supabase
      .from('signups')
      .insert([{
        name,
        phone,
        email,
        address,
        plan,
        created_at: new Date().toISOString(),
        status: 'new'
      }]);

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to save signup' });
    }

    const planLabels = {
      cleanup: 'Initial Clean-Up — Free Estimate',
      weekly: 'Weekly Plan — $400/month',
      biweekly: 'Biweekly Plan — $240/month'
    };

    const planLabel = planLabels[plan] || plan;

    // Send confirmation email to client
    await resend.emails.send({
      from: 'Weekly Weeding <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Weekly Weeding! 🌿',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #0f3d1a; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; font-size: 28px; margin: 0;">WeeklyWeeding</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">Your Personal Weeder</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
            <h2 style="color: #1B5E20; margin-top: 0;">You're on the list, ${name}! 🌿</h2>
            <p style="color: #444; line-height: 1.6;">Thanks for signing up with Weekly Weeding. We've received your request and will reach out within <strong>24 hours</strong> to confirm your first visit and get everything set up.</p>

            <div style="background: #e8f5e9; border-left: 4px solid #2d9e47; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #1B5E20; font-weight: bold;">Your Service Details</p>
              <p style="margin: 4px 0; color: #333; font-size: 14px;"><strong>Plan:</strong> ${planLabel}</p>
              <p style="margin: 4px 0; color: #333; font-size: 14px;"><strong>Address:</strong> ${address}</p>
              <p style="margin: 4px 0; color: #333; font-size: 14px;"><strong>Season:</strong> May – October</p>
            </div>

            <p style="color: #444; line-height: 1.6;">In the meantime, if you have any questions don't hesitate to reach out:</p>
            <p style="color: #2d9e47; font-weight: bold; font-size: 16px;">📞 (973) 534-3941</p>
            <p style="color: #2d9e47; font-size: 14px;">✉️ tommy.alnor@gmail.com</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">Weekly Weeding · Sparta, NJ · Sussex County · weeklyweeding.com</p>
          </div>
        </body>
        </html>
      `
    });

    // Send notification email to Tommy
    await resend.emails.send({
      from: 'Weekly Weeding <onboarding@resend.dev>',
      to: 'tommy.alnor@gmail.com',
      subject: `🌿 New Signup — ${name} (${planLabel})`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0f3d1a; padding: 32px; border-radius: 12px 12px 0 0;">
            <h2 style="color: white; margin: 0;">New Weekly Weeding Signup! 🌿</h2>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #1B5E20; font-weight: bold; width: 120px;">Name</td>
                <td style="padding: 12px 0; color: #333;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #1B5E20; font-weight: bold;">Phone</td>
                <td style="padding: 12px 0; color: #333;">${phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #1B5E20; font-weight: bold;">Email</td>
                <td style="padding: 12px 0; color: #333;">${email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #1B5E20; font-weight: bold;">Address</td>
                <td style="padding: 12px 0; color: #333;">${address}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #1B5E20; font-weight: bold;">Plan</td>
                <td style="padding: 12px 0; color: #333;">${planLabel}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding: 16px; background: #e8f5e9; border-radius: 8px;">
              <p style="margin: 0; color: #1B5E20; font-size: 14px;">Next step: Reach out to ${name} within 24 hours to confirm their first visit and send them the service agreement.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return res.status(200).json({ success: true, message: 'Signup saved and emails sent!' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
