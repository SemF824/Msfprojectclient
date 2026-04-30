import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User, Mail, Phone, MapPin, Calendar,
  Edit2, Save, X, Shield, Award, TrendingUp,
  Home, CreditCard
} from "lucide-react";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { supabase } from "../../hooks/useSupabaseAuth";
import Breadcrumb from "../components/Breadcrumb";

export default function Profile() {
  const { user: authUser, isLoading } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    country: "Congo-Brazzaville",
    profession: "",
    company: "",
    dateOfBirth: "",
    idNumber: "",
  });

  useEffect(() => {
    if (authUser) {
      setFormData(prev => ({
        ...prev,
        firstName: authUser.user_metadata?.first_name || "",
        lastName: authUser.user_metadata?.last_name || "",
        email: authUser.email || "",
        phone: authUser.user_metadata?.phone || "",
        city: authUser.user_metadata?.city || "",
      }));
    }
  }, [authUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          alternate_phone: formData.alternatePhone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          profession: formData.profession,
          company: formData.company,
          date_of_birth: formData.dateOfBirth,
          id_number: formData.idNumber,
        }
      });

      if (error) throw error;

      setSaveMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setSaveMessage({ type: 'error', text: error.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const stats = [
    { label: "Propriétés Visitées", value: "12", icon: Home, color: "from-blue-500 to-blue-600" },
    { label: "Réservations", value: "3", icon: CreditCard, color: "from-green-500 to-green-600" },
    { label: "Favoris", value: "7", icon: Award, color: "from-pink-500 to-pink-600" },
    { label: "Investissements", value: "295M", icon: TrendingUp, color: "from-purple-500 to-purple-600" },
  ];

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumb items={[
          { label: "Dashboard", path: "/client/dashboard" },
          { label: "Profil", path: "/client/profile" }
        ]} />

        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-xl ${
              saveMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {saveMessage.text}
          </motion.div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
              Mon <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Profil</span>
            </h1>
            <p className="text-gray-600">Gérez vos informations personnelles</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl hover:shadow-xl transition-all font-medium"
            >
              <Edit2 className="w-5 h-5" />
              <span>Modifier</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
              >
                <X className="w-5 h-5" />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl hover:shadow-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin"></div>
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl text-[#0a0f1e] font-semibold">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Informations Personnelles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
      >
        <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Informations Personnelles</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">Prénom</label>
            {isEditing ? (
              <input type="text" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-[#0a0f1e]">{formData.firstName || "-"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">Nom</label>
            {isEditing ? (
              <input type="text" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-[#0a0f1e]">{formData.lastName || "-"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">Email</label>
            {isEditing ? (
              <input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-[#0a0f1e]">{formData.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">Téléphone Principal</label>
            {isEditing ? (
              <input type="tel" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-[#0a0f1e]">{formData.phone || "-"}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Adresse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
      >
        <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Adresse</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-2 font-medium">Adresse Complète</label>
            {isEditing ? (
              <input type="text" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-[#0a0f1e]">{formData.address || "-"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">Ville</label>
            {isEditing ? (
              <input type="text" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-[#0a0f1e]">{formData.city || "-"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">Pays</label>
            {isEditing ? (
              <input type="text" value={formData.country} onChange={(e) => handleInputChange("country", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors" />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-[#0a0f1e]">{formData.country || "-"}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}