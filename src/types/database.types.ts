// src/types/database.types.ts
// Miroir strict du schéma PostgreSQL Supabase (Hetzner)

export type UserRole = "client" | "agent" | "admin" | "superadmin";

export type PropertyCategory = "Villas" | "Appartements" | "Terrains" | "Commercial";
export type PropertyStatus = "disponible" | "sous_offre" | "vendu" | "en_construction" | "bientot_disponible";

export type ProjectStatus = "planning" | "in_progress" | "review" | "completed" | "on_hold";
export type DocCategory = "identity" | "finance" | "land_title" | "other";
export type DocStatus = "en_attente" | "approuve" | "rejete";

export type DevisStatus = "nouveau" | "en_cours" | "documents" | "approuve" | "rejete";
export type DevisPriority = "haute" | "moyenne" | "basse";
export type DevisRequestType = "achat" | "location" | "information";
export type DevisFinancing = "oui" | "non" | "peut-etre";

export interface DevisRequest {
  id: string;
  created_at?: string;
  updated_at?: string;
  client_id?: string | null;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string;
  client_alternate_phone?: string | null;
  client_address: string;
  client_city: string;
  client_country: string;
  client_profession: string;
  client_company?: string | null;
  client_monthly_income?: string | null;
  property_id: string;
  property_name: string;
  property_price: number;
  request_type: DevisRequestType;
  financing_needed?: DevisFinancing | null;
  down_payment_amount?: number | null;
  visit_date?: string | null;
  visit_time?: string | null;
  number_of_persons?: number | null;
  message?: string | null;
  status: DevisStatus;
  priority: DevisPriority;
  assigned_to?: string | null;
  terms_accepted?: boolean;
  contact_accepted?: boolean;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  property_type?: string | null;
  budget?: string | null;
  message: string;
  created_at?: string;
  updated_at?: string;
  status: "nouveau" | "en_cours" | "traite" | "archive";
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  image?: string | null;
  beds?: number;
  baths?: number;
  sqft?: number;
  type: string;
  tag?: string | null;
  created_at?: string;
  status?: string | null;
  description?: string | null;
  images?: any;
  features?: string[];
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  url: string;
  type: string;
  size?: string | null;
  created_at?: string;
  status?: string | null;
  admin_comment?: string | null;
  category?: DocCategory | string | null;
  storage_path?: string | null;
  iv?: string | null;
  signature?: string | null;
}

export type AppointmentStatus = "planifie" | "termine" | "annule";
export type AppointmentType = "visite" | "notaire" | "reunion" | "remise_cles";

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  appointment_date: string;
  appointment_time: string;
  location: string;
  type?: AppointmentType | string | null;
  status?: AppointmentStatus | string | null;
  created_at?: string;
  agent_name?: string | null;
  date?: string | null;
  time?: string | null;
  property_name?: string | null;
  cancel_url?: string | null;
  reschedule_url?: string | null;
}

export type TransactionStatus = "en_attente" | "complete" | "echoue";
export type TransactionType = "acompte" | "mensualite" | "solde" | "frais" | "paiement";

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  status: TransactionStatus | string;
  date_transaction?: string;
  created_at?: string;
  property_name?: string | null;
  transaction_type: TransactionType | string;
  invoice_url?: string | null;
}

export type NotificationType = "info" | "success" | "warning" | "payment" | "document";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
  type?: NotificationType | string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  property_name: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  city?: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  client_id: string;
  agent_id?: string | null;
  subject: string;
  status: "open" | "closed" | "archived";
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_email?: string;
  agent_name?: string;
  unread_count?: number;
  last_message?: string;
  last_message_at?: string;
}

export interface EncryptedMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "client" | "agent" | "admin" | "superadmin";
  content_encrypted: string;
  created_at: string;
  is_read: boolean;
  iv?: string | null;
  signature?: string | null;
  sender_public_key?: any;
  decrypted_content?: string;
  is_verified?: boolean;
}

// ─── Tables Cryptographiques E2EE ───────────────────────────────────────────

export interface UserPublicKey {
  id?: string;
  user_id: string;
  ecdh_pub_key: JsonWebKey;
  ecdsa_pub_key: JsonWebKey;
  created_at?: string;
}

export interface DocumentAccessKey {
  id?: string;
  document_id: string;
  recipient_id: string;
  encrypted_aes_key: string;
  ephemeral_pub_key: JsonWebKey;
  created_at?: string;
}

export interface MessageAccessKey {
  id?: string;
  message_id: string;
  recipient_id: string;
  encrypted_aes_key: string;
  ephemeral_pub: JsonWebKey;
  created_at?: string;
}
