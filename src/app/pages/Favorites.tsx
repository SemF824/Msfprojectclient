import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Heart, Bed, Bath, Square, MapPin,
  TrendingUp, Filter, Grid3x3, List, Trash2,
  Share2, Eye, Calendar, Search
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import Breadcrumb from "../components/Breadcrumb";

interface FavoriteProperty {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  type: string;
  status: "available" | "reserved" | "sold";
  addedDate: string;
}

export default function Favorites() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Transformation en "State" pour pouvoir supprimer des favoris
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([
    {
      id: "tchikobo-villa-5",
      name: "Villa Tchikobo Prestige",
      location: "Lotissement ROC Tchikobo, Pointe-Noire",
      price: 295200000,
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      bedrooms: 5,
      bathrooms: 4,
      surface: 450,
      type: "Villa",
      status: "available",
      addedDate: "2026-04-10",
    },
    {
      id: "caraibes-apt-12",
      name: "Appartement Vue Mer - Résidences Caraïbes",
      location: "Centre-Ville, Pointe-Noire",
      price: 118080000,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      bedrooms: 3,
      bathrooms: 2,
      surface: 180,
      type: "Appartement",
      status: "available",
      addedDate: "2026-04-08",
    },
    {
      id: "cite17-penthouse-3",
      name: "Penthouse Luxe - Cité de 17",
      location: "Brazzaville",
      price: 209920000,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      bedrooms: 4,
      bathrooms: 3,
      surface: 320,
      type: "Penthouse",
      status: "available",
      addedDate: "2026-04-05",
    },
    {
      id: "roc-terrain-45",
      name: "Terrain Lotissement ROC - 600m²",
      location: "Tchikobo, Pointe-Noire",
      price: 40000000,
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
      bedrooms: 0,
      bathrooms: 0,
      surface: 600,
      type: "Terrain",
      status: "available",
      addedDate: "2026-04-03",
    },
    {
      id: "oyo-villa-8",
      name: "Villa Moderne Oyo Gardens",
      location: "Oyo, Pointe-Noire",
      price: 185600000,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      bedrooms: 4,
      bathrooms: 3,
      surface: 380,
      type: "Villa",
      status: "reserved",
      addedDate: "2026-03-28",
    },
    {
      id: "sibiti-terrain-12",
      name: "Terrain Résidentiel Sibiti - 800m²",
      location: "Sibiti, Pointe-Noire",
      price: 56000000,
      image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800",
      bedrooms: 0,
      bathrooms: 0,
      surface: 800,
      type: "Terrain",
      status: "available",
      addedDate: "2026-03-25",
    },
    {
      id: "mpila-duplex-7",
      name: "Duplex Standing - Mpila",
      location: "Mpila, Brazzaville",
      price: 142400000,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      bedrooms: 4,
      bathrooms: 3,
      surface: 280,
      type: "Duplex",
      status: "available",
      addedDate: "2026-03-20",
    },
  ]);

  // Fonction pour retirer un favori (clic sur le coeur ou la poubelle)
  const toggleFavorite = (id: string) => {
    setFavorites(prevFavorites => prevFavorites.filter(prop => prop.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="px-3 py-1 bg-green-500/20 text-green-600 border border-green-500/30 rounded-full text-xs font-medium">Disponible</span>;
      case "reserved":
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 border border-yellow-500/30 rounded-full text-xs font-medium">Réservé</span>;
      case "sold":
        return <span className="px-3 py-1 bg-red-500/20 text-red-600 border border-red-500/30 rounded-full text-xs font-medium">Vendu</span>;
      default:
        return null;
    }
  };

  const propertyTypes = ["all", "Villa", "Appartement", "Penthouse", "Duplex", "Terrain"];

  const filteredFavorites = favorites.filter((property) => {
    const matchesType = filterType === "all" || property.type === filterType;
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalValue = favorites.reduce((sum, prop) => sum + prop.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Favoris", path: "/favorites" }
          ]} />
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
                Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Favoris</span>
              </h1>
              <p className="text-gray-600">{filteredFavorites.length} propriétés sauvegardées</p>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" 
                    ? "bg-[#d4af37] text-[#0a0f1e]" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-[#d4af37] text-[#0a0f1e]" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl text-[#0a0f1e] font-semibold">{favorites.length}</p>
                <p className="text-sm text-gray-600">Favoris</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl text-[#0a0f1e] font-semibold">{(totalValue / 1000000).toFixed(0)}M</p>
                <p className="text-sm text-gray-600">Valeur Totale (FCFA)</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl text-[#0a0f1e] font-semibold">
                  {favorites.filter(f => f.status === "available").length}
                </p>
                <p className="text-sm text-gray-600">Disponibles</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une propriété..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder-gray-400 focus:border-[#d4af37] focus:outline-none transition-colors"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "Tous les types" : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid/List */}
        {filteredFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-12 text-center"
          >
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-[#0a0f1e] font-semibold mb-2">Aucun favori trouvé</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== "all" 
                ? "Essayez de modifier vos filtres" 
                : "Commencez à ajouter des propriétés à vos favoris"}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl hover:shadow-xl transition-all font-medium"
            >
              Parcourir les Propriétés
            </Link>
          </motion.div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((property, idx) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg overflow-hidden group"
              >
                <div className="relative">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    {getStatusBadge(property.status)}
                    <button 
                      onClick={() => toggleFavorite(property.id)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-colors"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-[#0a0f1e]/80 backdrop-blur-sm text-white rounded-full text-xs font-medium">
                      {property.type}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-[#0a0f1e] font-semibold text-lg mb-2 line-clamp-2">
                    {property.name}
                  </h3>
                  <p className="text-gray-600 text-sm flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </p>

                  {property.type !== "Terrain" && (
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {property.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {property.bathrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        {property.surface}m²
                      </span>
                    </div>
                  )}

                  {property.type === "Terrain" && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                      <Square className="w-4 h-4" />
                      <span>{property.surface}m²</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Prix</p>
                      <p className="text-[#d4af37] font-bold text-lg">
                        {(property.price / 1000000).toFixed(1)}M FCFA
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/propriete/${property.id}`}
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-[#d4af37] hover:text-[#0a0f1e] transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => toggleFavorite(property.id)}
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Ajouté le {new Date(property.addedDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFavorites.map((property, idx) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
              >
                <div className="flex gap-6 p-6">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-48 h-48 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-[#0a0f1e] font-semibold text-xl">{property.name}</h3>
                          {getStatusBadge(property.status)}
                        </div>
                        <p className="text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {property.location}
                        </p>
                      </div>
                      <button 
                        onClick={() => toggleFavorite(property.id)}
                        className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-colors"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>

                    {property.type !== "Terrain" && (
                      <div className="flex items-center gap-6 mb-4 text-gray-600">
                        <span className="flex items-center gap-2">
                          <Bed className="w-5 h-5" />
                          {property.bedrooms} chambres
                        </span>
                        <span className="flex items-center gap-2">
                          <Bath className="w-5 h-5" />
                          {property.bathrooms} salles de bain
                        </span>
                        <span className="flex items-center gap-2">
                          <Square className="w-5 h-5" />
                          {property.surface}m²
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Prix</p>
                        <p className="text-[#d4af37] font-bold text-2xl">
                          {property.price.toLocaleString()} FCFA
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Ajouté le {new Date(property.addedDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/propriete/${property.id}`}
                          className="px-6 py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl hover:shadow-xl transition-all font-medium"
                        >
                          Voir Détails
                        </Link>
                        <button className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-blue-500 hover:text-white transition-colors">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => toggleFavorite(property.id)}
                          className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}