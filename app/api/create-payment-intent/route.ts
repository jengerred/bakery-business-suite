/* -------------------------------------------------------
   💳 Stripe PaymentIntent API Route
   Creates a PaymentIntent for manual card entry using
   Stripe Elements inside the CheckoutModal.
------------------------------------------------------- */

import Stripe from "stripe";
import { NextResponse } from "next/server";

/* -------------------------------------------------------
   🔐 Initialize Stripe
   Uses your secret key from environment variables.
------------------------------------------------------- */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/* -------------------------------------------------------
   📨 POST /api/create-payment-intent
   Expects: { amount: number } in cents
   Returns: { clientSecret }
------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    /* ------------------------------
       💳 Create PaymentIntent
       automatic_payment_methods = true
       lets Stripe decide the best payment method.
    ------------------------------ */
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error("Stripe error:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
