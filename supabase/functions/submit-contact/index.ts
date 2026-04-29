import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // CORRECTION ICI : Récupération directe et native du JSON
    const payload = await req.json();

    // Extraire les variables en vérifiant la structure
    const token = payload?.token;
    const formData = payload?.formData;

    if (!token) {
      throw new Error("Jeton reCAPTCHA manquant.");
    }
    if (!formData) {
      throw new Error("Données du formulaire manquantes.");
    }

    // Vérification de la clé secrète sur le serveur
    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
    if (!secretKey) {
      throw new Error("La clé secrète reCAPTCHA n'est pas configurée dans les variables d'environnement Supabase.");
    }

    // Appel à Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
    const recaptchaJson = await recaptchaRes.json();

    if (!recaptchaJson.success) {
      console.error("Échec de la validation Google:", recaptchaJson['error-codes']);
      return new Response(
        JSON.stringify({ error: "Échec de l'authentification anti-bot." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    if (recaptchaJson.score < 0.5) {
      return new Response(
        JSON.stringify({ error: "Activité automatisée détectée." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Initialisation du client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Impossible d'initialiser la base de données. URL ou Clé de service manquante.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Insertion
    const { error: dbError } = await supabaseAdmin
      .from('contact_requests')
      .insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        property_type: formData.propertyType || null,
        budget: formData.budget || null,
        message: formData.message,
        created_at: new Date().toISOString()
      }]);

    if (dbError) {
      throw new Error(`Erreur lors de la sauvegarde : ${dbError.message}`);
    }

    // Succès total
    return new Response(
      JSON.stringify({ success: true, message: "Message envoyé avec succès." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    // Renvoi du vrai message d'erreur au client
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})