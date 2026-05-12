export default function FloatingWhatsApp() {
  // Attention : Pas de "+" au début du numéro
  const WHATSAPP_NUMBER = "33759281752"; 
  const DEFAULT_MESSAGE = "Bonjour l'équipe MSF, je souhaite avoir plus d'informations sur le projet Résidences Caraïbes.";
  
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      /* On passe à left-6 pour ne pas gêner reCAPTCHA */
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl hover:bg-[#20bd5a] hover:scale-110 transition-transform duration-300 group"
      aria-label="Contactez-nous sur WhatsApp"
    >
      {/* LE VÉRITABLE LOGO WHATSAPP OFFICIEL EN SVG */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-8 h-8"
      >
        <path d="M12.031 0C5.395 0 .015 5.38.015 12.016c0 2.124.554 4.195 1.606 6.015L.014 24l6.11-1.604a11.966 11.966 0 005.907 1.547h.005c6.634 0 12.014-5.38 12.014-12.017 0-3.216-1.253-6.239-3.528-8.513A11.947 11.947 0 0012.031 0zm0 22.022h-.004a9.98 9.98 0 01-5.086-1.381l-.365-.216-3.78.992.992-3.685-.237-.377a9.957 9.957 0 01-1.523-5.339c0-5.513 4.488-10.001 10.003-10.001 2.673 0 5.185 1.042 7.076 2.932A9.957 9.957 0 0122.045 12.02c0 5.513-4.487 10.002-10.014 10.002zm5.492-7.502c-.301-.151-1.782-.881-2.059-.982-.277-.101-.478-.151-.68.151-.201.302-.781.982-.958 1.183-.176.201-.353.226-.654.075-2.017-.962-3.57-2.617-4.103-3.535-.176-.301.077-.282.37-.582.102-.1.202-.25.302-.352.101-.101.127-.151.202-.251.101-.151.05-.276 0-.427-.05-.151-.68-1.631-.931-2.234-.246-.59-.496-.51-.68-.52-.176-.01-.377-.01-.578-.01-.201 0-.528.075-.805.377-.277.302-1.056 1.031-1.056 2.515 0 1.484 1.082 2.918 1.233 3.119.151.201 2.131 3.255 5.163 4.561 2.019.869 2.766.755 3.267.629.619-.156 1.782-.73 2.033-1.433.251-.704.251-1.308.176-1.434-.075-.126-.277-.201-.578-.352z"/>
      </svg>
      {/* Le tooltip s'affiche maintenant à droite du bouton (left-16 au lieu de right-16) */}
      <span className="absolute left-16 bg-white text-gray-800 text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
        Discutons de votre projet
      </span>
    </a>
  );
}