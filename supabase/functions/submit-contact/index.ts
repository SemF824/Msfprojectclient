import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "npm:resend"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json();
    const token = payload?.token;
    const formData = payload?.formData;

    if (!token) {
      throw new Error("Jeton reCAPTCHA manquant.");
    }
    if (!formData) {
      throw new Error("Données du formulaire manquantes.");
    }

    // 1. Validation de sécurité Google reCAPTCHA v3
    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
    if (!secretKey) {
      throw new Error("La clé secrète reCAPTCHA n'est pas configurée dans Supabase.");
    }

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
        JSON.stringify({ error: "Activité automatisée suspecte détectée." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // 2. Enregistrement dans la base Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variables d'environnement Supabase manquantes.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

    // 3. Envoi de l'email de notification avec Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const notificationRecipient = Deno.env.get('CONTACT_TO_EMAIL') || 'promotions@msfcongo.com';
    const fromSender = Deno.env.get('RESEND_FROM_EMAIL') || 'MSF Congo <onboarding@resend.dev>';

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      const htmlEmailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: #0a0f1e; padding: 28px 32px; border-bottom: 3px solid #d4af37; }
            .header h1 { color: #ffffff; margin: 0 0 4px 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
            .header p { color: #d4af37; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
            .body { padding: 32px; }
            .badge { display: inline-block; background: #f1f5f9; color: #0a0f1e; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #cbd5e1; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .info-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .info-table td.label { color: #64748b; font-weight: 600; width: 35%; }
            .info-table td.value { color: #0a0f1e; font-weight: 500; }
            .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-top: 12px; }
            .message-box h3 { margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
            .message-box p { margin: 0; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
            .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
            .btn { display: inline-block; background: #0a0f1e; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nouveau Message de Contact</h1>
              <p>MSF Congo — Plateforme Web</p>
            </div>
            <div class="body">
              <span class="badge">Objet : ${formData.subject}</span>
              <table class="info-table">
                <tr>
                  <td class="label">Nom complet</td>
                  <td class="value"><strong>${formData.name}</strong></td>
                </tr>
                <tr>
                  <td class="label">Adresse Email</td>
                  <td class="value"><a href="mailto:${formData.email}" style="color: #0284c7; text-decoration: none;">${formData.email}</a></td>
                </tr>
                <tr>
                  <td class="label">Téléphone</td>
                  <td class="value"><a href="tel:${formData.phone}" style="color: #0a0f1e; text-decoration: none;">${formData.phone}</a></td>
                </tr>
                ${formData.propertyType ? `<tr><td class="label">Type de bien</td><td class="value">${formData.propertyType}</td></tr>` : ''}
                ${formData.budget ? `<tr><td class="label">Budget estimé</td><td class="value">${formData.budget}</td></tr>` : ''}
              </table>

              <div class="message-box">
                <h3>Message du prospect :</h3>
                <p>${formData.message}</p>
              </div>

              <div style="text-align: center;">
                <a href="mailto:${formData.email}?subject=Re:%20${encodeURIComponent(formData.subject)}" class="btn">
                  Répondre directement par email
                </a>
              </div>
            </div>
            <div class="footer">
              Ce message a été envoyé via le formulaire de contact sur msfcongo.com.<br>
              Vous pouvez répondre directement à cet email pour contacter le client.
            </div>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: fromSender,
        to: [notificationRecipient],
        reply_to: formData.email, // Permet de cliquer sur "Répondre" dans la boîte mail
        subject: `[Nouveau Contact] ${formData.subject} - ${formData.name}`,
        html: htmlEmailContent,
      });
    } else {
      console.warn("RESEND_API_KEY non configurée. L'email n'a pas été envoyé.");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Message envoyé et transmis avec succès." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Erreur dans submit-contact :", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})