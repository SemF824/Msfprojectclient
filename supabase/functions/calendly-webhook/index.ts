import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

console.log("Démarrage du Webhook Calendly - Suppression Radicale...")

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })

  try {
    const body = await req.json()
    console.log(`Payload reçu (${body.event}):`, JSON.stringify(body))

    const payload = body.payload;
    const inviteeEmail = payload.email;
    const startTime = payload.scheduled_event?.start_time || payload.event?.start_time;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', inviteeEmail)
      .single();

    if (!profile) return new Response(JSON.stringify({ message: "Client non reconnu" }), { status: 200 });

    // === GESTION DE L'ANNULATION (Destruction de la ligne) ===
    if (body.event === 'invitee.canceled') {
       // LA FRAPPE CHIRURGICALE : On efface purement et simplement la ligne
       const { error: cancelError } = await supabaseAdmin
          .from('appointments')
          .delete() 
          .eq('user_id', profile.id)
          .eq('appointment_date', startTime.split('T')[0])
          .eq('appointment_time', startTime.split('T')[1].substring(0, 5));

       if (cancelError) throw cancelError;
       console.log(`[SUCCÈS] Ancien rendez-vous DÉTRUIT pour : ${inviteeEmail}`);
    }

    // === GESTION DE LA CRÉATION ===
    else if (body.event === 'invitee.created') {
      const dateParts = startTime.split('T');
      const dateStr = dateParts[0]; 
      const timeStr = dateParts[1] ? dateParts[1].substring(0, 5) : "00:00"; 
      
      const locationData = payload.scheduled_event?.location;
      const locationStr = locationData?.join_url || locationData?.location || "Lieu à confirmer";

      const { error: insertError } = await supabaseAdmin
        .from('appointments')
        .insert({
          user_id: profile.id,
          title: payload.scheduled_event?.name || "Rendez-vous MSF",
          property_name: "Rendez-vous Conseil MSF",
          type: "visite",
          date: dateStr,            
          time: timeStr,            
          status: "planifie",
          agent_name: "Équipe MSF",
          appointment_date: dateStr,   
          appointment_time: timeStr,   
          location: locationStr,
          cancel_url: payload.cancel_url,        
          reschedule_url: payload.reschedule_url 
        });

      if (insertError) throw insertError;
      console.log(`[SUCCÈS] Nouveau rendez-vous CRÉÉ pour : ${inviteeEmail}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })

  } catch (error: any) {
    // EXTRACTION PRÉCISE DE L'ERREUR SUPABASE
    let errorMessage = "Erreur inconnue";
    if (error && typeof error === 'object') {
        errorMessage = error.message || error.details || error.hint || JSON.stringify(error);
    } else {
        errorMessage = String(error);
    }
    
    console.error("Erreur critique Webhook:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
})