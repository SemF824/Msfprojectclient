import { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin,
  Edit2, Save, X, Briefcase, Landmark, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import Breadcrumb from "../components/Breadcrumb";
import { PhoneInput } from "../components/ui/PhoneInput";
import { isValidPhone } from "../../utils/phone";

export default function Profile() {
  const { user: authUser, isLoading: authLoading } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
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
      setFormData({
        firstName: authUser.user_metadata?.first_name || "",
        lastName: authUser.user_metadata?.last_name || "",
        email: authUser.email || "",
        phone: authUser.user_metadata?.phone || "",
        alternatePhone: authUser.user_metadata?.alternate_phone || "",
        address: authUser.user_metadata?.address || "",
        city: authUser.user_metadata?.city || "",
        country: authUser.user_metadata?.country || "Congo-Brazzaville",
        profession: authUser.user_metadata?.profession || "",
        company: authUser.user_metadata?.company || "",
        dateOfBirth: authUser.user_metadata?.date_of_birth || "",
        idNumber: authUser.user_metadata?.id_number || "",
      });
    }
  }, [authUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (_formatted: string, _isValid: boolean, e164: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: e164 || _formatted,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !authUser) return;

    if (formData.phone && !isValidPhone(formData.phone, "CG") && !isValidPhone(formData.phone)) {
      setFeedback({ type: 'error', text: "Le numéro de téléphone principal est invalide." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

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

      setFeedback({ type: 'success', text: "Vos informations de profil ont été mises à jour avec succès." });
      setIsEditing(false);
    } catch (err: any) {
      console.error("Erreur de sauvegarde du profil:", err);
      setFeedback({ type: 'error', text: err.message || "Une erreur est survenue lors de la mise à jour." });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#0a0f1e]">
      <div className="mb-8">
        <Breadcrumb items={[
          { label: "Dashboard", path: "/client/dashboard" },
          { label: "Mon Profil", path: "/client/profile" }
        ]} />
        <h1 className="text-3xl mt-2 mb-2 font-bold">Mon Profil Conseillé</h1>
        <p className="text-gray-500 text-sm">Gérez vos informations personnelles et justificatifs contractuels.</p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="flex flex-col lg:flex-row gap-8">
        <div className="flex-2 lg:w-2/3 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-8">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-[#d4af37]" /> Informations Personnelles
            </h2>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-xs font-bold text-[#d4af37] border border-[#d4af37]/30 px-3 py-1.5 rounded-lg hover:bg-[#d4af37]/5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setFeedback(null); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 text-xs font-bold bg-[#d4af37] text-[#0a0f1e] px-3 py-1.5 rounded-lg hover:bg-[#b8952e] transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Enregistrer
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Nom</label>
              {isEditing ? (
                <input type="text" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] text-sm" required />
              ) : (
                <p className="px-4 py-2.5 bg-gray-50/50 rounded-xl text-[#0a0f1e] font-medium border border-transparent text-sm">{formData.lastName || "-"}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Prénom</label>
              {isEditing ? (
                <input type="text" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] text-sm" required />
              ) : (
                <p className="px-4 py-2.5 bg-gray-50/50 rounded-xl text-[#0a0f1e] font-medium border border-transparent text-sm">{formData.firstName || "-"}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" /> Adresse Email
              </label>
              <p className="px-4 py-2.5 bg-gray-100 rounded-xl text-gray-500 font-medium text-sm border border-gray-200 cursor-not-allowed">
                {formData.email}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" /> Téléphone Principal
              </label>
              {isEditing ? (
                <PhoneInput
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  defaultCountry="CG"
                />
              ) : (
                <p className="px-4 py-2.5 bg-gray-50/50 rounded-xl text-[#0a0f1e] font-medium border border-transparent text-sm">{formData.phone || "-"}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Adresse & Résidence</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" /> Adresse complète
                </label>
                {isEditing ? (
                  <input type="text" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] text-sm" />
                ) : (
                  <p className="px-4 py-2.5 bg-gray-50/50 rounded-xl text-[#0a0f1e] font-medium border border-transparent text-sm">{formData.address || "-"}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ville</label>
                {isEditing ? (
                  <input type="text" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] text-sm" />
                ) : (
                  <p className="px-4 py-2.5 bg-gray-50/50 rounded-xl text-[#0a0f1e] font-medium border border-transparent text-sm">{formData.city || "-"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Situation Professionnelle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-gray-400" /> Profession / Poste
                </label>
                {isEditing ? (
                  <input type="text" value={formData.profession} onChange={(e) => handleInputChange("profession", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] text-sm" />
                ) : (
                  <p className="px-4 py-2.5 bg-gray-50/50 rounded-xl text-[#0a0f1e] font-medium border border-transparent text-sm">{formData.profession || "-"}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-gray-400" /> Entreprise / Employeur
                </label>
                {isEditing ? (
                  <input type="text" value={formData.company} onChange={(e) => handleInputChange("company", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] text-sm" />
                ) : (
                  <p className="px-4 py-2.5 bg-gray-50/50 rounded-xl text-[#0a0f1e] font-medium border border-transparent text-sm">{formData.company || "-"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}