import { useState, useEffect, useRef } from "react";
import { Bath, Bed, MapPin, Maximize, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { supabase } from "../../hooks/useSupabaseAuth";

/* ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI CE FICHIER EST DIFFÉRENT DES AUTRES
 *
 * Framer Motion anime les cartes en interpolant opacity (0 → 1) + translateY.
 * Sur Safari / WebKit iOS, toute animation d'opacity sur un PARENT d'un élément
 * portant backdrop-filter force le navigateur à recalculer le filtre à chaque
 * frame intermédiaire → clignotement visible ("flash" à l'apparition).
 *
 * Ce bug ne concerne PAS les animations sur des éléments qui n'ont pas de
 * backdrop-filter dans leur sous-arbre (ex : les titres de section plus bas).
 *
 * SOLUTION : remplacer Framer Motion sur les cartes par des animations CSS
 * pures déclenchées via IntersectionObserver.
 *
 * Avantages :
 *   • Les animations CSS tournent sur le thread Compositor du navigateur,
 *     indépendamment du thread JS et du recompositing backdrop-filter.
 *   • On n'anime JAMAIS opacity sur le parent — on utilise visibility (discret,
 *     non interpolé) pour cacher/montrer la carte, et seulement translateY
 *     pour le mouvement. Safari peut garder le backdrop-filter dans son propre
 *     layer sans jamais le recalculer pendant l'animation.
 * ───────────────────────────────────────────────────────────────────────────── */

interface Property {
  id: string;
  title: string;
  location: string;
  price: string | number;
  image: string;
  beds: number;
  baths: number;
  sqft: string | number;
  type: string;
  tag?: string;
}

interface FeaturedPropertiesProps {
  filters?: {
    type: string;
    location: string;
    price: string;
  };
}

/* ─── CSS injecté une seule fois dans le <head> ──────────────────────────────
 *
 * @keyframes cardSlideUp : uniquement translateY, JAMAIS opacity.
 *   - translateY est géré par le Compositor (GPU, thread séparé).
 *   - opacity déclencherait un repaint de backdrop-filter → clignotement.
 *
 * .card-hidden : visibility:hidden (rendu sauté) + position initiale décalée.
 *   - visibility n'est PAS interpolé → changement discret, sans artefact.
 *
 * .card-visible : déclenche l'animation CSS ; animation-delay défini en inline
 *   style pour le stagger par index.
 * ─────────────────────────────────────────────────────────────────────────── */
const CARD_ANIMATION_CSS = `
  @keyframes cardSlideUp {
    from { transform: translate3d(0, 28px, 0); }
    to   { transform: translate3d(0, 0,   0); }
  }
  .card-hidden {
    visibility: hidden;
    transform: translate3d(0, 28px, 0);
  }
  .card-visible {
    visibility: visible;
    animation: cardSlideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
`;

/* ─── Injection unique du CSS dans <head> ────────────────────────────────── */
let cssInjected = false;
function ensureCardCSS() {
  if (cssInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = CARD_ANIMATION_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

/* ─── Composant wrapper pour chaque carte ───────────────────────────────────
 *
 * Utilise IntersectionObserver (équivalent de whileInView once:true) pour
 * déclencher la classe CSS au bon moment.
 * Le stagger (décalage entre cartes) est géré par animation-delay en inline.
 * ─────────────────────────────────────────────────────────────────────────── */
function AnimatedCard({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    ensureCardCSS();
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // once:true — on ne rejoue pas l'animation
        }
      },
      { rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={visible ? "card-visible" : "card-hidden"}
      style={visible ? { animationDelay: `${index * 0.08}s` } : undefined}
    >
      {children}
    </div>
  );
}

/* ─── Composant principal ─────────────────────────────────────────────────── */
export function FeaturedProperties({ filters }: FeaturedPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!supabase) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) setProperties(data);
      } catch (err) {
        console.error("Erreur de connexion à la table properties :", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const formatPrice = (price: string | number) => {
    if (typeof price === "number")
      return `${new Intl.NumberFormat("fr-FR").format(price)} FCFA`;
    return price;
  };

  const filteredProperties = properties.filter((property) => {
    if (!filters) return true;
    let typeMatch = true;
    if (filters.type !== "all") {
      const typeMap: Record<string, string> = {
        apartment: "Appartement",
        villa: "Villa",
        penthouse: "Penthouse",
        terrain: "Terrain",
        lotti: "Lotti",
      };
      typeMatch = property.type === (typeMap[filters.type] || filters.type);
    }
    let locationMatch = true;
    if (filters.location)
      locationMatch = property.location
        .toLowerCase()
        .includes(filters.location.toLowerCase());
    return typeMatch && locationMatch;
  });

  return (
    <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-[#0a0f1e] to-[#1e3a5f]/20 min-h-screen">
      <div className="container mx-auto">

        {/* ── En-tête : Framer Motion OK ici (pas de backdrop-blur enfant) ── */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[#1e3a5f]/60 border border-[#d4af37]/30 mb-4"
          >
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-[#d4af37]" />
            <span className="text-[10px] md:text-xs text-[#d4af37] tracking-wider uppercase">
              Collection Premium
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl mb-3 md:mb-4"
          >
            <span className="text-white">Propriétés </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              en Vedette
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base"
          >
            Découvrez notre sélection triée de résidences extraordinaires dans
            les lieux les plus prestigieux du Congo
          </motion.p>
        </div>

        {/* ── Grille de cartes ─────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#d4af37] animate-spin" />
            <p className="text-gray-400 text-sm md:text-base">
              Chargement du catalogue...
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center text-sm md:text-base text-gray-400 py-12 bg-[#0d1b2e]/80 rounded-2xl border border-white/10">
            Aucune propriété ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProperties.map((property, index) => (
              /*
               * AnimatedCard = wrapper CSS pur.
               * Le visuel de la carte est un div STATIQUE (jamais animé
               * directement) → backdrop-blur reste dans son propre layer GPU,
               * Safari ne le recompose JAMAIS pendant l'animation.
               */
              <AnimatedCard key={property.id} index={index}>
                <div className="group relative bg-[#0d1b2e]/90 md:bg-white/5 md:backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-[#d4af37]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4af37]/20 flex flex-col h-full">

                  {/* Image */}
                  <div className="relative h-56 md:h-64 overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent opacity-60" />
                    {property.tag && (
                      <div className="absolute top-3 right-3 md:top-4 md:right-4 px-2.5 py-1 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] text-[10px] md:text-xs font-bold rounded-full">
                        {property.tag}
                      </div>
                    )}
                    <div className="absolute top-3 left-3 md:top-4 md:left-4 px-2.5 py-1 bg-[#0a0f1e]/80 text-white text-[10px] md:text-xs font-medium rounded-full border border-[#d4af37]/40">
                      {property.type}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-4 md:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg md:text-xl text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 mb-3 md:mb-4">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 text-[#d4af37] flex-shrink-0" />
                      <span className="text-xs md:text-sm truncate">
                        {property.location}
                      </span>
                    </div>
                    <div className="text-xl md:text-3xl text-[#d4af37] mb-4 md:mb-6 font-bold truncate">
                      {formatPrice(property.price)}
                    </div>
                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/10 mt-auto">
                      <div className="flex flex-col md:flex-row items-center gap-1 text-gray-400">
                        <Bed className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="text-[10px] md:text-xs">
                          {property.beds}{" "}
                          <span className="hidden md:inline">Chb</span>
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row items-center gap-1 text-gray-400 border-x border-white/10 px-2 md:px-4">
                        <Bath className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="text-[10px] md:text-xs">
                          {property.baths}{" "}
                          <span className="hidden md:inline">Sdb</span>
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row items-center gap-1 text-gray-400">
                        <Maximize className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="text-[10px] md:text-xs">
                          {property.sqft} m²
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/vitrine/propriete/${property.id}`}
                      className="block w-full mt-4 md:mt-6 py-2.5 md:py-3 bg-white/10 text-white text-xs md:text-sm font-medium text-center rounded-lg border border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-[#0a0f1e] transition-all"
                    >
                      Voir les Détails
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {/* ── CTA bas de page ──────────────────────────────────────────────── */}
        {!isLoading && filteredProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8 md:mt-12"
          >
            <Link
              to="/vitrine/proprietes"
              className="inline-block w-full md:w-auto px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] text-sm md:text-base font-bold rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all"
            >
              Voir Toutes les Propriétés
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}