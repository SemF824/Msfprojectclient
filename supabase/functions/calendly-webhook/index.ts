// Initialisation des types natifs pour l'Edge Runtime de Supabase
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// Import de la librairie Supabase
import { createClient } from "npm:@supabase/supabase-js@2"

console.log("Démarrage du Webhook Calendly - Version Corrigée...")

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405, 
      headers: { "Content-Type": "application/json" } 
    })
  }

  try {
    const body = await req.json()

    if (body.event === 'invitee.created') {
      const payload = body.payload;
      
      // EXTRACTION CORRIGÉE : Calendly utilise 'scheduled_event'
      const inviteeEmail = payload.email;
      const startTime = payload.scheduled_event?.start_time; 

      // Sécurité : Si start_time est absent, on log proprement l'erreur
      if (!startTime) {
        console.error("Structure JSON inattendue : 'scheduled_event.start_time' est introuvable dans le payload.");
        return new Response(JSON.stringify({ error: "Missing start_time in payload" }), { status: 400 });
      }

      // Découpage sécurisé
      const dateStr = startTime.split('T')[0]; 
      const timeStr = startTime.split('T')[1].substring(0, 5); 

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SERVICE_ROLE_KEY') ?? ''
      )

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', inviteeEmail)
        .single();

      if (profileError || !profile) {
        console.warn(`Webhook ignoré : Aucun compte trouvé pour l'email ${inviteeEmail}`);
        return new Response(JSON.stringify({ message: "Client non reconnu" }), { status: 200 });
      }

      const { error: insertError } = await supabaseAdmin
        .from('appointments')
        .insert({
          user_id: profile.id,
          property_name: "Rendez-vous Conseil MSF",
          type: "consultation",
          date: dateStr,
          time: timeStr,
          status: "scheduled",
          agent_name: "Équipe MSF"
        });

      if (insertError) throw insertError;

      console.log(`[SUCCÈS] Rendez-vous inséré pour : ${inviteeEmail} le ${dateStr}`);
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erreur critique dans le Webhook Calendly:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 400, 
      headers: { "Content-Type": "application/json" } 
    });
  }
})