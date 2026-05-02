import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

console.log("Démarrage du Webhook Calendly - Version FORCE UPDATE...")

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

      const dateParts = startTime.split('T');
      const dateStr = dateParts[0]; 
      const timeStr = dateParts[1] ? dateParts[1].substring(0, 5) : "00:00"; 

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
        return new Response(JSON.stringify({ message: "Client non reconnu" }), { status: 200 });
      }

      // LE BLOC D'INSERTION BLINDÉ
      const { error: insertError } = await supabaseAdmin
        .from('appointments')
        .insert({
          user_id: profile.id,
          title: payload.scheduled_event?.name || "Rendez-vous Conseil MSF",
          property_name: "Rendez-vous Conseil MSF",
          type: "consultation",
          date: dateStr,            
          time: timeStr,            
          status: "scheduled",
          agent_name: "Équipe MSF",
          appointment_date: startTime, 
          appointment_time: timeStr    // CETTE LIGNE DOIT ÊTRE LUE PAR LE SERVEUR
        });

      if (insertError) {
        console.error("Erreur insertion Supabase:", insertError);
        throw insertError;
      }
      console.log(`[SUCCÈS] Rendez-vous inséré pour : ${inviteeEmail}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erreur critique dans le Webhook Calendly:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
})