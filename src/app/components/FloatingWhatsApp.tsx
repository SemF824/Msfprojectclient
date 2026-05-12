import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  // Remplace par le bon numéro (format international sans le +)
  const WHATSAPP_NUMBER = "+33759281752"; 
  const DEFAULT_MESSAGE = "Bonjour l'équipe MSF, je souhaite avoir plus d'informations sur le projet Résidences Caraïbes.";
  
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl hover:bg-[#20bd5a] hover:scale-110 transition-transform duration-300 group"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      {/* Tooltip visible au survol */}
      <span className="absolute right-16 bg-white text-gray-800 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
        Discutons de votre projet
      </span>
    </a>
  );
}