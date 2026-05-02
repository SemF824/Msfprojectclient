// Initialisation des types natifs pour l'Edge Runtime de Supabase
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// Import de la librairie Supabase pour communiquer avec la base de données
import { createClient } from "npm:@supabase/supabase-js@2"

console.log("Démarrage du Webhook Calendly...")

Deno.serve(async (req) => {
  // Sécurité de base : on n'accepte que les requêtes POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    // 1. Récupération et parsing du payload (le paquet envoyé par Calendly)
    const body = await req.json()

    // 2. On filtre : on ne veut réagir que si c'est un NOUVEAU rendez-vous
    if (body.event === 'invitee.created') {
      const payload = body.payload;
      
      // Extraction des données brutes
      const inviteeEmail = payload.email;
      const startTime = payload.event.start_time; // Format ISO: "2026-06-10T09:15:00Z"
      
      // Découpage chirurgical de la date et de l'heure
      const dateStr = startTime.split('T')[0]; // "2026-06-10"
      const timeStr = startTime.split('T')[1].substring(0, 5); // "09:15"

      // 3. Connexion au mode "God Mode" (Service Role) pour contourner tes propres RLS
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SERVICE_ROLE_KEY') ?? '' 
      )

      // 4. Traque de l'ID du client via son email dans la table profiles
      // ATTENTION : Ce code présume que tu as une colonne 'email' dans ta table 'profiles'
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', inviteeEmail)
        .single();

      // Si le mec a pris RDV avec un email qui n'est pas dans la base client
      if (profileError || !profile) {
        console.warn(`Webhook ignoré : Aucun compte client trouvé pour l'email ${inviteeEmail}`);
        // On renvoie quand même 200 à Calendly, sinon il va retenter la requête en boucle
        return new Response(JSON.stringify({ message: "Client non reconnu, mais webhook validé." }), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      }

      // 5. Insertion autoritaire du rendez-vous dans la table 'appointments'
      const { error: insertError } = await supabaseAdmin
        .from('appointments')
        .insert({
          user_id: profile.id,
          property_name: "Rendez-vous Conseil MSF", // Tu peux le rendre dynamique si tu as l'info
          type: "consultation",
          date: dateStr,
          time: timeStr,
          status: "scheduled",
          agent_name: "Équipe MSF"
        });

      if (insertError) {
        console.error("Échec de l'insertion dans Supabase :", insertError);
        throw insertError;
      }

      console.log(`[SUCCÈS] Rendez-vous inséré pour le client : ${inviteeEmail}`);
    }

    // On rassure Calendly : le message a bien été reçu et traité.
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Erreur critique dans le Webhook Calendly:", error);
    
    // Typage strict et sécurisé de l'erreur
    const errorMessage = error instanceof Error ? error.message : String(error);

    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
})