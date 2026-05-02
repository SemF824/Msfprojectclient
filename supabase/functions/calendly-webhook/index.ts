import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

console.log("Démarrage du Webhook Calendly - Version Mapping Complet...")

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })

  try {
    const body = await req.json()
    console.log("Payload reçu de Calendly:", JSON.stringify(body))

    if (body.event === 'invitee.created') {
      const payload = body.payload;
      const inviteeEmail = payload.email;
      const startTime = payload.scheduled_event?.start_time || payload.event?.start_time; 

      if (!startTime) {
        console.error("ERREUR : Impossible de trouver start_time.");
        return new Response(JSON.stringify({ error: "Missing start_time" }), { status: 400 });
      }

      // Extraction de la date et de l'heure
      const dateParts = startTime.split('T');
      const dateStr = dateParts[0]; 
      const timeStr = dateParts[1] ? dateParts[1].substring(0, 5) : "00:00"; 

      // Extraction du lieu (Lien Google Meet ou valeur par défaut)
      const locationData = payload.scheduled_event?.location;
      const locationStr = locationData?.join_url || locationData?.location || "En ligne / À définir";

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SERVICE_ROLE_KEY') ?? ''
      )

      // Recherche du profil client
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', inviteeEmail)
        .single();

      if (profileError || !profile) {
        console.warn(`Client non reconnu pour l'email: ${inviteeEmail}`);
        return new Response(JSON.stringify({ message: "Client non reconnu" }), { status: 200 });
      }

      // INSERTION SQL BLINDÉE
      const { error: insertError } = await supabaseAdmin
        .from('appointments')
        .insert({
          user_id: profile.id,
          title: payload.scheduled_event?.name || "Rendez-vous MSF",
          property_name: "Rendez-vous Conseil MSF",
          type: "consultation",
          date: dateStr,            
          time: timeStr,            
          status: "planifie",
          agent_name: "Équipe MSF",
          appointment_date: dateStr,   // Format YYYY-MM-DD
          appointment_time: timeStr,   // Format HH:MM
          location: locationStr        // L'AJOUT QUI DÉTRUIT LE DERNIER MUR
        });

      if (insertError) {
        console.error("Erreur insertion Supabase:", insertError);
        throw insertError;
      }
      
      console.log(`[SUCCÈS] Rendez-vous inséré pour : ${inviteeEmail} via Calendly`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erreur critique dans le Webhook Calendly:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
})