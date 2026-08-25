import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { PopupModal } from "react-calendly";
import {
  ArrowLeft,
  Bed,
  Bath,
  Square,
  MapPin,
  Heart,
  Share2,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  X,
  Play,
  Maximize2,
  Car,
  Shield,
  Waves,
  Dumbbell,
  Camera,
  Map as MapIcon,
  Building2,
  TreePine,
  ShoppingCart,
  GraduationCap,
  Hospital,
  FileText,
  Loader2,
  Info,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";

// On récupère l'URL depuis les variables d'environnement, avec un fallback de sécurité
const calendlyUrl = (import.meta as any).env.VITE_CALENDLY_URL;

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1760129745103-91c4022ed5fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9uJTIwb2NlYW4lMjB2aWV3fGVufDF8fHx8MTc3NjI3NTQzOHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1638454795595-0a0abf68614d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzc2MjM0MjUyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1643034738686-d69e7bc047e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwbWFyYmxlJTIwbHV4dXJ5fGVufDF8fHx8MTc3NjI3NTQzOHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1758448755969-8791367cf5c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRyb29tJTIwbWFzdGVyJTIwc3VpdGV8ZW58MXx8fHwxNzc2MjMyMDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHNwYSUyMG1vZGVybnxlbnwxfHx8fDE3NzYyNzU0Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1755493872564-516424a81dd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBpbmZpbml0eSUyMG9jZWFuJTIwdmlld3xlbnwxfHx8fDE3NzYyNzU0Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useSupabaseAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  // ── Chargement dynamique de la propriété depuis Supabase ──
  const {
    data: dbProperty,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property-detail", id],
    queryFn: async () => {
      if (!supabase || !id) return null;
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Construction de l'objet property dynamique
  const property = dbProperty
    ? {
        id: dbProperty.id,
        title: dbProperty.title || "Propriété de Prestige",
        location: dbProperty.location || "Congo",
        price: dbProperty.price,
        priceLabel:
          typeof dbProperty.price === "number"
            ? `${new Intl.NumberFormat("fr-FR").format(dbProperty.price)} FCFA`
            : dbProperty.price || "Sur demande",
        type: dbProperty.type
          ? dbProperty.type.charAt(0).toUpperCase() + dbProperty.type.slice(1)
          : "Villa de Luxe",
        status: dbProperty.status
          ? dbProperty.status.charAt(0).toUpperCase() +
            dbProperty.status.slice(1)
          : "Disponible",
        bedrooms: dbProperty.beds || dbProperty.bedrooms || 3,
        bathrooms: dbProperty.baths || dbProperty.bathrooms || 2,
        surface: dbProperty.sqft || dbProperty.surface || 250,
        landSize:
          dbProperty.landSize ||
          dbProperty.land_size ||
          (dbProperty.sqft ? Math.round(dbProperty.sqft * 1.5) : 500),
        description:
          dbProperty.description ||
          `Découvrez cette villa exceptionnelle "${dbProperty.title}" située à ${dbProperty.location}. Conçue avec des matériaux haut de gamme, cette propriété offre un cadre de vie d'exception fusionnant élégance, sécurité et confort moderne.`,
        images:
          Array.isArray(dbProperty.images) && dbProperty.images.length > 0
            ? dbProperty.images
            : dbProperty.image
              ? [dbProperty.image, ...DEFAULT_IMAGES.slice(1)]
              : DEFAULT_IMAGES,
        features:
          Array.isArray(dbProperty.features) && dbProperty.features.length > 0
            ? dbProperty.features
            : [
                "Cuisine équipée haut de gamme",
                "Piscine & terrasse spacieuse",
                "Vue panoramique exceptionnelle",
                "Jardin tropical aménagé",
                "Garage sécurisé",
                "Système de sécurité 24/7",
                "Climatisation centrale",
                "Générateur de secours",
              ],
        amenities: [
          { icon: Waves, label: "Piscine Privée" },
          { icon: Car, label: "Garage Sécurisé" },
          { icon: Shield, label: "Sécurité 24/7" },
          { icon: Dumbbell, label: "Espace Fitness" },
        ],
        neighborhood: [
          {
            icon: ShoppingCart,
            label: "Supermarchés & Commerces",
            distance: "500m",
          },
          {
            icon: GraduationCap,
            label: "Écoles & Établissements",
            distance: "1.2km",
          },
          { icon: Hospital, label: "Cliniques & Hôpitaux", distance: "800m" },
          {
            icon: Building2,
            label: "Centre-Ville & Quartier d'Affaires",
            distance: "3km",
          },
        ],
      }
    : null;

  // Vérifier si la propriété est dans les favoris au chargement
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !supabase || !property?.id) return;
      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("property_id", property.id)
        .maybeSingle();

      if (data) setIsFavorite(true);
    };
    checkFavorite();
  }, [user, property?.id]);

  const toggleFavorite = async () => {
    if (!property?.id) return;
    if (!user) {
      alert(
        "Veuillez vous connecter pour ajouter cette propriété à vos favoris.",
      );
      return;
    }
    if (!supabase) return;

    setIsTogglingFavorite(true);
    try {
      if (isFavorite) {
        // Retirer des favoris
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", property.id);
        setIsFavorite(false);
      } else {
        // Ajouter aux favoris
        await supabase.from("favorites").insert({
          user_id: user.id,
          property_id: property.id,
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Erreur favoris:", error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const PropertyMap = ({ location }: { location: string }) => {
    const apiKey = (import.meta as any as any).env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return (
        <div className="h-64 bg-gray-100 rounded-xl relative overflow-hidden border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <MapIcon className="w-12 h-12 text-[#d4af37] mx-auto mb-2" />
            <p className="text-gray-600">Carte Interactive</p>
            <p className="text-sm text-gray-500">{location}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location + " Pointe-Noire Congo")}&zoom=14&language=fr`}
          allowFullScreen
          title={`Localisation ${location}`}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-28 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
        <p className="text-gray-600 font-medium">
          Chargement des détails de la propriété...
        </p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-28 pb-20 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mb-4 text-[#d4af37]">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#0a0f1e] mb-2">
          Propriété Introuvable
        </h1>
        <p className="text-gray-600 max-w-md mb-6">
          La propriété demandée n'existe pas ou n'est plus disponible dans le
          catalogue MSF Congo.
        </p>
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0a0f1e] font-bold rounded-xl hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explorer toutes les propriétés</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20">
      {/* Back Button */}
      <div className="container mx-auto px-6 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#d4af37] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour aux propriétés</span>
        </Link>
      </div>

      {/* Main Gallery */}
      <div className="container mx-auto px-6 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Main Image */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
            <ImageWithFallback
              src={property.images[selectedImage]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setShowGallery(true)}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span className="text-sm">
                Voir toutes les photos ({property.images.length})
              </span>
            </button>
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-[#d4af37] text-[#0a0f1e] text-xs rounded-full">
                {property.status}
              </span>
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {property.images.slice(1, 5).map((img: string, idx: number) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(idx + 1)}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                  selectedImage === idx + 1
                    ? "ring-2 ring-[#d4af37]"
                    : "hover:opacity-80"
                }`}
              >
                <ImageWithFallback
                  src={img}
                  alt={`${property.title} ${idx + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-8"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[#d4af37] text-sm mb-2">{property.type}</p>
                  <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFavorite}
                    disabled={isTogglingFavorite}
                    className={`p-3 rounded-xl border transition-colors ${
                      isFavorite
                        ? "bg-[#d4af37] border-[#d4af37] text-[#0a0f1e]"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#d4af37]"
                    }`}
                  >
                    {isTogglingFavorite ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                      />
                    )}
                  </button>
                  <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:border-[#d4af37] transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-[#0a0f1e]">
                    {property.bedrooms} Chambres
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-[#0a0f1e]">
                    {property.bathrooms} Salles de bain
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-[#0a0f1e]">{property.surface} m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-[#0a0f1e]">
                    {property.landSize} m² terrain
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-8"
            >
              <h2 className="text-2xl text-[#0a0f1e] mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-8"
            >
              <h2 className="text-2xl text-[#0a0f1e] mb-6">Caractéristiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-8"
            >
              <h2 className="text-2xl text-[#0a0f1e] mb-6">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.amenities.map((amenity, idx) => {
                  const Icon = amenity.icon;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="w-12 h-12 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#d4af37]" />
                      </div>
                      <span className="text-sm text-gray-700 text-center">
                        {amenity.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Virtual Tour */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-8"
            >
              <h2 className="text-2xl text-[#0a0f1e] mb-6">Visite Virtuelle</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-[#0a0f1e] ml-1" />
                      </div>
                      <span className="text-white">Visite Vidéo 360°</span>
                    </div>
                  </div>
                  <ImageWithFallback
                    src={property.images[0]}
                    alt="Video tour"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center">
                        <Maximize2 className="w-8 h-8 text-[#0a0f1e]" />
                      </div>
                      <span className="text-white">Plan 3D Interactif</span>
                    </div>
                  </div>
                  <ImageWithFallback
                    src={property.images[1]}
                    alt="3D plan"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>

            {/* Plan de Financement Sécurisé */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#d4af37]/10 rounded-xl flex items-center justify-center text-[#d4af37]">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-2xl text-[#0a0f1e] font-bold">
                  Plan de Financement Sécurisé
                </h3>
              </div>

              <p className="text-gray-600 mb-8">
                Pour garantir la sécurité de votre investissement, nos paiements
                sont échelonnés et strictement liés à l'avancement réel des
                travaux.
              </p>

              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#d4af37] before:via-[#d4af37] before:to-transparent">
                {[
                  {
                    step: "Phase 1",
                    title: "Signature, Terrain, Titre & Fondations",
                    desc: "Acquisition du terrain, établissement du titre foncier, signature du contrat et réalisation des fondations solides.",
                    pct: "30%",
                  },
                  {
                    step: "Phase 2",
                    title: "Élévations",
                    desc: "Élévation des murs et de la structure principale de votre villa.",
                    pct: "10%",
                  },
                  {
                    step: "Phase 3",
                    title: "Mise hors d'eau (Toiture)",
                    desc: "Installation complète de la charpente et de la toiture.",
                    pct: "20%",
                  },
                  {
                    step: "Phase 4",
                    title: "Finalisation",
                    desc: "Travaux de plomberie, électricité, finitions intérieures/extérieures et remise officielle des clés.",
                    pct: "40%",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#0a0f1e] text-[#d4af37] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                          {item.step}
                        </span>
                        <span className="px-3 py-1 bg-white text-[#0a0f1e] font-black text-sm rounded-lg border border-gray-200 shadow-sm">
                          {item.pct}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-[#0a0f1e] mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Location & Neighborhood */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-8"
            >
              <h2 className="text-2xl text-[#0a0f1e] mb-6">
                Localisation & Quartier
              </h2>

              {/* Google Map */}
              <div className="mb-6">
                <PropertyMap location={property.location} />
              </div>

              {/* Nearby Places */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.neighborhood.map((place, idx) => {
                  const Icon = place.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#d4af37]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[#0a0f1e] text-sm">{place.label}</p>
                        <p className="text-gray-600 text-xs">
                          {place.distance}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-24"
            >
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-1">Prix</p>
                <p className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
                  {property.priceLabel}
                </p>
                <p className="text-gray-600 text-sm mt-1">Prêt disponible</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Link
                  to={`/devis/${property.id}`}
                  className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all font-semibold text-center flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>Demander un Devis</span>
                </Link>

                <button
                  onClick={toggleFavorite}
                  disabled={isTogglingFavorite}
                  className={`w-full py-3 rounded-xl border-2 transition-all font-medium flex items-center justify-center gap-2 ${
                    isFavorite
                      ? "bg-pink-50 border-pink-500 text-pink-600"
                      : "bg-white border-gray-200 text-gray-700 hover:border-[#d4af37]"
                  }`}
                >
                  {isTogglingFavorite ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                  )}
                  <span>
                    {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  </span>
                </button>
              </div>

              {/* INTÉGRATION CALENDLY */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-[#0a0f1e]">
                  Organiser une visite
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choisissez un créneau de 30 minutes avec l'un de nos
                  conseillers directement sur notre calendrier.
                </p>
                <button
                  onClick={() => setIsCalendlyOpen(true)}
                  className="w-full py-4 bg-white border-2 border-[#d4af37] text-[#0a0f1e] rounded-xl hover:bg-[#d4af37]/10 transition-all font-medium flex justify-center items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Voir les créneaux disponibles
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <a
                  href="tel:+242064588618"
                  className="flex items-center gap-3 text-gray-700 hover:text-[#d4af37] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>+242 06 458 8618</span>
                </a>
                <a
                  href="mailto:promotions@msfcongo.com"
                  className="flex items-center gap-3 text-gray-700 hover:text-[#d4af37] transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>promotions@msfcongo.com</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-6xl w-full">
            <ImageWithFallback
              src={property.images[selectedImage]}
              alt={property.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {property.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                    selectedImage === idx ? "ring-2 ring-[#d4af37]" : ""
                  }`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendly Popup Modal */}
      <PopupModal
        url={calendlyUrl}
        onModalClose={() => setIsCalendlyOpen(false)}
        open={isCalendlyOpen}
        rootElement={document.getElementById("root")!}
      />
    </div>
  );
}
