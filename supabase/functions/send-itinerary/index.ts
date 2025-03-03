import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

interface EmailRequestBody {
  email: string
  itinerary: string
  preferences: {
    trip_purpose: string
    trip_length: string
    preferred_regions: string[]
    environment_preference: string
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, itinerary, preferences } = (await req.json()) as EmailRequestBody

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Format the email content
    const emailContent = `
Your Travel Itinerary

Trip Details:
- Purpose: ${preferences.trip_purpose}
- Length: ${preferences.trip_length}
- Regions: ${preferences.preferred_regions.join(', ')}
- Environment: ${preferences.environment_preference}

${itinerary}

Thank you for using our travel planning service!
    `.trim()

    // Send email using Supabase's built-in email service
    const { error } = await supabaseClient.auth.admin.sendRawEmail({
      to: email,
      subject: 'Your Personalized Travel Itinerary',
      body: emailContent,
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})