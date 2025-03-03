import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Stripe } from 'https://esm.sh/stripe@13.10.0?target=deno'
import { corsHeaders } from '../shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Parse request body
    const { email, amount } = await req.json()
    if (!email || !amount) {
      throw new Error('Missing required fields')
    }

    console.log('Creating payment intent:', { email, amount })

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: email,
      metadata: {
        email,
        type: 'subscription_setup'
      }
    })

    console.log('Payment intent created:', paymentIntent.id)

    // Return the client secret
    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        publishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY')
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create payment intent'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: error.message === 'No authorization header' ? 401 : 400,
      }
    )
  }
})