// src/types/database.types.ts
export type UserRole = "client" | "agent" | "admin" | "superadmin";

export type PropertyCategory = "Villas" | "Appartements" | "Terrains" | "Commercial";
export type PropertyStatus = "disponible" | "sous_offre" | "vendu" | "en_construction" | "bientot_disponible";

export type ProjectStatus = "planning" | "in_progress" | "review" | "completed" | "on_hold";
export type DocCategory = "identity" | "finance" | "land_title" | "other";
export type DocStatus = "en_attente" | "approuve" | "rejete";

export type DevisStatus = "nouveau" | "en_cours" | "traite" | "annule";
export type DevisPriority = "basse" | "normale" | "haute" | "urgente";

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  category: PropertyCategory;
  type: string;
  status: PropertyStatus;
  surface: number;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  description: string;
  images: string[];
  featured: boolean;
  virtual_tour_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  storage_path: string;
  category: DocCategory;
  status: DocStatus;
  created_at: string;
  updated_at?: string;
  admin_comment?: string;
  iv?: string;
  signature?: string;
}

export interface ClientRequest {
  id: string;
  client_id: string;
  type: string;
  details: Record<string, any>;
  status: "en_attente" | "traitee" | "rejetee";
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  client_id: string;
  start_date: string;
  end_date?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
}

export type NotificationIcon = "info" | "success" | "payment" | "document" | "appointment" | "warning";
export type TransactionStatus = "pending" | "completed" | "cancelled" | "in_progress";
export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled";

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
  iv?: string | null;
  signature?: string | null;
  is_read: boolean;
  created_at: string;
  decrypted_content?: string;
  is_verified?: boolean;
}

// ─── Tables E2EE ─────────────────────────────────────────────────────────────
export interface UserPublicKey {
  user_id: string;
  ecdh_pub: JsonWebKey;
  ecdsa_pub: JsonWebKey;
  created_at: string;
}

export interface DocumentAccessKey {
  id: string;
  document_id: string;
  recipient_id: string;
  encrypted_aes_key: string;
  ephemeral_pub: JsonWebKey;
  created_at: string;
}

export interface MessageAccessKey {
  id: string;
  message_id: string;
  recipient_id: string;
  encrypted_aes_key: string;
  ephemeral_pub: JsonWebKey;
  created_at: string;
}