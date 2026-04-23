/**
 * MSF CONGO - Types TypeScript stricts pour les tables Supabase
 *
 * Schéma de la base de données :
 * - favorites : propriétés favorites des utilisateurs
 * - notifications : notifications système
 * - transactions : historique des transactions immobilières
 * - documents : documents liés aux transactions
 * - appointments : rendez-vous de visite
 * - devis_requests : demandes de devis client
 */

// Table: favorites
export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

// Table: notifications
export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'payment' | 'document' | 'appointment' | 'warning';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Table: transactions
export interface Transaction {
  id: string;
  user_id: string;
  property_id: string;
  property_name: string;
  transaction_type: 'purchase' | 'sale' | 'rental' | 'reservation';
  amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'in_progress';
  date: string;
  created_at: string;
  updated_at: string;
}

// ─── Catégories de documents sécurisés ───────────────────────────────────────
export type DocCategory = 'identity' | 'finance' | 'land_title' | 'other';

// Table: documents
export interface Document {
  id: string;
  user_id: string;
  transaction_id?: string;
  name: string;
  type: string;           // mime-type du fichier
  url: string;            // conservé pour rétrocompat (vide pour bucket privé)
  storage_path: string;   // chemin réel dans le bucket msf-private-docs
  category: DocCategory;  // catégorie sécurisée pour filtrage admin
  size: number;           // en bytes
  uploaded_at: string;
  created_at: string;
}

// Table: appointments
export interface Appointment {
  id: string;
  user_id: string;
  property_id: string;
  property_name: string;
  type: 'visit' | 'consultation' | 'signature';
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  agent_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Table: devis_requests
export interface DevisRequest {
  id: string;
  client_id?: string;
  client_email: string;
  client_first_name: string;
  client_last_name: string;
  client_phone: string;
  property_id: string;
  property_name: string;
  property_price: number;
  request_type: 'achat' | 'location' | 'information';
  status: 'nouveau' | 'en_cours' | 'documents' | 'approuve' | 'rejete';
  message?: string;
  created_at: string;
  updated_at: string;
}

// Statistiques pour le Dashboard
export interface DashboardStats {
  activeRequests: number;
  favoriteProperties: number;
  scheduledVisits: number;
  documentsCount: number;
}

// Types d'aide pour l'UI
export type NotificationIcon = 'info' | 'success' | 'payment' | 'document' | 'appointment' | 'warning';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'in_progress';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';