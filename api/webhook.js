const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// IMPORTANT: Disable body parsing so Stripe can verify signature
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: err.message });
  }

  console.log('Webhook event received:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { name, phone, address, plan } = session.metadata;
    const email = session.customer_email;

    console.log('Payment completed for:', name, email, plan);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: dbError } = await supabase.from('signups').insert([{
      name, phone, email, address, plan, status: 'paid'
    }]);

    if (dbError) console.error('DB error:', dbError.message);

    const planLabels = {
      weekly: 'Weekly Plan — $400/month',
      biweekly: 'Biweekly Plan — $240/month'
    };
    const planLabel = planLabels[plan] || plan;

    await resend.emails.send({
      from: 'Weekly Weeding <hello@weeklyweeding.com>',
      to: email,
      subject: 'Payment confirmed — Welcome to Weekly Weeding! 🌿',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0f3d1a;padding:40px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;">WeeklyWeeding</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;">Your Personal Weeder</p>
        </div>
        <div style="background:white;padding:40px;border-radius:0 0 12px 12px;border:1px solid #eee;">
          <h2 style="color:#1B5E20;">You're all set, ${name}! 🌿</h2>
          <p style="color:#444;line-height:1.6;">Your payment was confirmed and your subscription is active. We'll reach out within <strong>24 hours</strong> to schedule your first visit.</p>
          <div style="background:#e8f5e9;border-left:4px solid #2d9e47;padding:20px;border-radius:8px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#1B5E20;font-weight:bold;">Your Service Details</p>
            <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Plan:</strong> ${planLabel}</p>
            <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Address:</strong> ${address}</p>
            <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Season:</strong> May – October</p>
            <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Status:</strong> Active ✅</p>
          </div>
          <p style="color:#444;">Questions? Reach out anytime:</p>
          <p style="color:#2d9e47;font-weight:bold;">📞 (973) 534-3941</p>
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
          <p style="color:#999;font-size:12px;text-align:center;">Weekly Weeding · Sparta, NJ · weeklyweeding.com</p>
        </div>
      </div>`
    });

    await resend.emails.send({
      from: 'Weekly Weeding <hello@weeklyweeding.com>',
      to: 'tommy.alnor@gmail.com',
      subject: `💳 Payment received — ${name} (${planLabel})`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0f3d1a;padding:32px;border-radius:12px 12px 0 0;">
          <h2 style="color:white;margin:0;">💳 New Paid Signup!</h2>
        </div>
        <div style="background:white;padding:32px;border:1px solid #eee;border-radius:0 0 12px 12px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Plan:</strong> ${planLabel}</p>
          <p><strong>Status:</strong> ✅ Payment confirmed</p>
          <div style="margin-top:24px;padding:16px;background:#e8f5e9;border-radius:8px;">
            <p style="margin:0;color:#1B5E20;font-size:14px;">Send service agreement via SignWell and schedule first visit!</p>
          </div>
        </div>
      </div>`
    });

    console.log('Emails sent successfully!');
  }

  return res.status(200).json({ received: true });
}

module.exports.config = { api: { bodyParser: false } };
