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

// Import from existing Supabase info
import { projectId, publicAnonKey } from '/utils/supabase/info';

export const supabaseConfig = {
  url: `https://${projectId}.supabase.co`,
  anonKey: publicAnonKey,
  
  // Tables partagées
  tables: {
    // Demandes de devis (partagée client + admin)
    devisRequests: 'devis_requests',
    
    // Utilisateurs clients
    users: 'users',
    
    // Propriétés
    properties: 'kv_store_3c1961a2', // Using KV store
    
    // Documents
    documents: 'documents',
    
    // Transactions
    transactions: 'transactions',
    
    // Notes internes (admin uniquement)
    adminNotes: 'admin_notes',
    
    // Timeline/historique
    timeline: 'timeline_events'
  },
  
  // Buckets de stockage
  storage: {
    documents: 'make-3c1961a2-documents',
    properties: 'make-3c1961a2-properties',
    avatars: 'make-3c1961a2-avatars'
  },
  
  // Rôles utilisateurs
  roles: {
    client: 'client',
    admin: 'admin',
    agent: 'agent',
    superadmin: 'superadmin'
  }
};

// Types TypeScript pour les données
export interface DevisRequest {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Client info
  client_id?: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string;
  client_alternate_phone?: string;
  client_address: string;
  client_city: string;
  client_country: string;
  client_profession: string;
  client_company?: string;
  client_monthly_income?: string;
  
  // Property info
  property_id: string;
  property_name: string;
  property_price: number;
  
  // Request details
  request_type: 'achat' | 'location' | 'information';
  financing_needed: 'oui' | 'non' | 'peut-etre';
  down_payment_amount?: number;
  
  // Visit
  visit_date?: string;
  visit_time?: string;
  number_of_persons?: number;
  
  // Message
  message?: string;
  
  // Status
  status: 'nouveau' | 'en_cours' | 'documents' | 'approuve' | 'rejete';
  priority: 'haute' | 'moyenne' | 'basse';
  assigned_to?: string;
  
  // Metadata
  terms_accepted: boolean;
  contact_accepted: boolean;
}

export interface Document {
  id: string;
  request_id: string;
  name: string;
  type: string;
  size: number;
  storage_path: string;
  uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected';
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
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    nouveau: 'bg-blue-100 text-blue-700 border-blue-200',
    en_cours: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    documents: 'bg-purple-100 text-purple-700 border-purple-200',
    approuve: 'bg-green-100 text-green-700 border-green-200',
    rejete: 'bg-red-100 text-red-700 border-red-200'
  };
  return colors[status] || colors.nouveau;
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    haute: 'text-red-600 font-semibold',
    moyenne: 'text-orange-600 font-medium',
    basse: 'text-gray-600'
  };
  return colors[priority] || colors.moyenne;
};
