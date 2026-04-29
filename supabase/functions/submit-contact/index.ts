import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gérer les requêtes de pré-vérification du navigateur (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, formData } = await req.json()

    // 1. Vérification du token auprès des serveurs de Google
    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY')
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`

    const recaptchaRes = await fetch(verifyUrl, { method: 'POST' })
    const recaptchaJson = await recaptchaRes.json()

    // Le score v3 va de 0.0 (bot) à 1.0 (humain). On refuse en dessous de 0.5.
    if (!recaptchaJson.success || recaptchaJson.score < 0.5) {
      return new Response(
        JSON.stringify({ error: "Échec de la validation humaine (score trop bas)." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // 2. Si humain, on initialise Supabase avec la clé de service (Service Role Key)
    // Elle permet d'insérer des données même si les règles RLS sont strictes
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Insertion des données dans la table contact_requests
    const { error } = await supabaseClient
      .from('contact_requests')
      .insert([formData])

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})