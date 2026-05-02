// Initialisation des types natifs pour l'Edge Runtime de Supabase
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// Import de la librairie Supabase
import { createClient } from "npm:@supabase/supabase-js@2"

console.log("Démarrage du Webhook Calendly - Version 2.0 (Blindée)...")

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405, 
      headers: { "Content-Type": "application/json" } 
    })
  }

  try {
    const body = await req.json()
    
    // Log pour debug : permet de voir la structure réelle envoyée par Calendly dans tes logs Supabase
    console.log("Payload reçu de Calendly:", JSON.stringify(body))

    if (body.event === 'invitee.created') {
      const payload = body.payload;
      
      // Extraction sécurisée : On vérifie plusieurs chemins possibles pour la date
      const inviteeEmail = payload.email;
      const startTime = payload.scheduled_event?.start_time || payload.event?.start_time; 

      if (!startTime) {
        console.error("ERREUR : Impossible de trouver start_time dans le payload.");
        return new Response(JSON.stringify({ error: "Missing start_time in payload" }), { status: 400 });
      }

      // Découpage de la date et de l'heure
      const dateParts = startTime.split('T');
      const dateStr = dateParts[0]; 
      const timeStr = dateParts[1] ? dateParts[1].substring(0, 5) : "00:00"; 

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SERVICE_ROLE_KEY') ?? ''
      )

      // Recherche du profil
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', inviteeEmail)
        .single();

      if (profileError || !profile) {
        console.warn(`Webhook ignoré : Aucun compte trouvé pour l'email ${inviteeEmail}`);
        return new Response(JSON.stringify({ message: "Client non reconnu" }), { status: 200 });
      }

      // Insertion du rendez-vous
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

      if (insertError) {
        console.error("Erreur insertion Supabase:", insertError);
        throw insertError;
      }

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