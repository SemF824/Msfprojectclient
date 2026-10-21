/**
 * MSF CONGO - Configuration Supabase Partagée
 *
 * Ce fichier contient la configuration commune pour :
 * - CLIENT APP (demandes de devis, profils utilisateurs)
 * - ADMIN APP (gestion demandes, validation documents)
 *
 * Les deux applications se connectent à la MÊME base de données
 * mais avec des permissions différentes selon le rôle utilisateur.
 */


import type { DevisRequest } from "../types/database.types";
export type { DevisRequest };

// Use environment variables for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseKey,

  // Tables partagées
  tables: {
    // Demandes de devis (partagée client + admin)
    devisRequests: "devis_requests",

    // Utilisateurs clients
    users: "users",

    // Propriétés
    properties: "properties",

    // Documents
    documents: "documents",

    // Transactions
    transactions: "transactions",

    // Notes internes (admin uniquement)
    adminNotes: "admin_notes",

    // Timeline/historique
    timeline: "timeline_events",
  },

  // Buckets de stockage (Correspondance exacte Supabase Hetzner)
  storage: {
    properties: "make-3c1961a2-properties",
    documents: "msf-private-docs",
    clientDocuments: "client-documents",
    importantPictures: "Important Pictures",
  },

  // Rôles utilisateurs
  roles: {
    client: "client",
    admin: "admin",
    superadmin: "superadmin",
  },
};

export interface Document {
  id: string;
  request_id: string;
  name: string;
  type: string;
  size: number;
  storage_path: string;
  uploaded_at: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface AdminNote {
  id: string;
  request_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  request_id: string;
  event: string;
  user: string;
  created_at: string;
}

// Helper functions pour les deux apps
export const formatPrice = (price: number): string => {
  return `${(price / 1000000).toFixed(1)}M FCFA`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    nouveau: "bg-blue-100 text-blue-700 border-blue-200",
    en_cours: "bg-yellow-100 text-yellow-700 border-yellow-200",
    documents:
      "bg-purple-100 text-purple-700 border-purple-200",
    approuve: "bg-green-100 text-green-700 border-green-200",
    rejete: "bg-red-100 text-red-700 border-red-200",
  };
  return colors[status] || colors.nouveau;
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    haute: "text-red-600 font-semibold",
    moyenne: "text-orange-600 font-medium",
    basse: "text-gray-600",
  };
  return colors[priority] || colors.moyenne;
};