const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Log env vars are present (not values)
    console.log('ENV CHECK:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL
    });

    const { name, phone, email, address, plan } = req.body;
    console.log('BODY:', { name, phone, email, address, plan });

    if (!name || !phone || !email || !address || !plan) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    console.log('Inserting into Supabase...');
    const { data, error: dbError } = await supabase
      .from('signups')
      .insert([{ name, phone, email, address, plan, status: 'new' }]);

    if (dbError) {
      console.error('SUPABASE ERROR:', JSON.stringify(dbError));
      return res.status(500).json({ error: 'Database error: ' + dbError.message });
    }

    console.log('Supabase insert success, sending emails...');

    const resend = new Resend(process.env.RESEND_API_KEY);

    const planLabels = {
      cleanup: 'Initial Clean-Up — Free Estimate',
      weekly: 'Weekly Plan — $400/month',
      biweekly: 'Biweekly Plan — $240/month'
    };
    const planLabel = planLabels[plan] || plan;

    const { error: emailError } = await resend.emails.send({
      from: 'Weekly Weeding <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Weekly Weeding! 🌿',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0f3d1a;padding:40px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;">WeeklyWeeding</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;">Your Personal Weeder</p>
        </div>
        <div style="background:white;padding:40px;border-radius:0 0 12px 12px;border:1px solid #eee;">
          <h2 style="color:#1B5E20;">You're on the list, ${name}! 🌿</h2>
          <p style="color:#444;line-height:1.6;">Thanks for signing up. We'll reach out within <strong>24 hours</strong> to confirm your first visit.</p>
          <div style="background:#e8f5e9;border-left:4px solid #2d9e47;padding:20px;border-radius:8px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#1B5E20;font-weight:bold;">Your Service Details</p>
            <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Plan:</strong> ${planLabel}</p>
            <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Address:</strong> ${address}</p>
            <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Season:</strong> May – October</p>
          </div>
          <p style="color:#2d9e47;font-weight:bold;">📞 (973) 534-3941</p>
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
          <p style="color:#999;font-size:12px;text-align:center;">Weekly Weeding · Sparta, NJ · weeklyweeding.com</p>
        </div>
      </div>`
    });

    if (emailError) {
      console.error('RESEND ERROR:', JSON.stringify(emailError));
    }

    await resend.emails.send({
      from: 'Weekly Weeding <onboarding@resend.dev>',
      to: 'tommy.alnor@gmail.com',
      subject: `🌿 New Signup — ${name} (${planLabel})`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0f3d1a;padding:32px;border-radius:12px 12px 0 0;">
          <h2 style="color:white;margin:0;">New Signup! 🌿</h2>
        </div>
        <div style="background:white;padding:32px;border:1px solid #eee;border-radius:0 0 12px 12px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Plan:</strong> ${planLabel}</p>
        </div>
      </div>`
    });

    console.log('All done!');
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('CAUGHT ERROR:', error.message, error.stack);
    return res.status(500).json({ error: error.message });
  }
}
