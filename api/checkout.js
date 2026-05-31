const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { name, phone, email, address, plan } = req.body;

    if (!name || !phone || !email || !address || !plan) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Only weekly and biweekly go to Stripe checkout
    // cleanup goes to regular submit (free estimate, no payment)
    if (plan === 'cleanup') {
      return res.status(400).json({ error: 'Cleanup plan does not require payment' });
    }

    const priceIds = {
      weekly: process.env.STRIPE_WEEKLY_PRICE_ID,
      biweekly: process.env.STRIPE_BIWEEKLY_PRICE_ID
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { name, phone, address, plan },
      subscription_data: {
        metadata: { name, phone, address, plan }
      },
      success_url: `${process.env.NEXT_PUBLIC_URL || 'https://weeklyweeding.com'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'https://weeklyweeding.com'}/#pricing`,
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Stripe error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
