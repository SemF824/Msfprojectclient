# 🗄️ Schéma Base de Données - MSF Congo

## 📊 Tables Nécessaires

### 1. **clients** - Base Clients

```sql
CREATE TABLE clients (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Informations Personnelles
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  
  -- Adresse
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Congo-Brazzaville',
  
  -- Informations Professionnelles
  profession VARCHAR(100),
  company VARCHAR(200),
  monthly_income_range VARCHAR(50),
  
  -- Statut
  status ENUM('prospect', 'client', 'vip', 'archived') DEFAULT 'prospect',
  source VARCHAR(100), -- 'website', 'referral', 'social_media', etc.
  
  -- Assignation
  assigned_agent_id VARCHAR(36),
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  total_requests INT DEFAULT 0,
  total_purchases INT DEFAULT 0,
  total_spent DECIMAL(15, 2) DEFAULT 0,
  last_contact_date TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_status (status),
  INDEX idx_assigned_agent (assigned_agent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2. **documents** - Documents Clients

```sql
CREATE TABLE documents (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relation
  client_id VARCHAR(36) NOT NULL,
  request_id VARCHAR(36), -- Optionnel, lié à une demande spécifique
  
  -- Document Info
  document_type VARCHAR(50) NOT NULL, -- 'id_card', 'proof_income', 'bank_statement', etc.
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- URL ou chemin du fichier
  file_size INT, -- en bytes
  file_mime_type VARCHAR(100),
  
  -- Validation
  status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  validated_by VARCHAR(36), -- ID de l'admin qui a validé
  validated_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Metadata
  expiry_date DATE, -- Pour documents avec date d'expiration
  is_sensitive BOOLEAN DEFAULT false,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_client (client_id),
  INDEX idx_type (document_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3. **demandes** - Demandes de Devis

```sql
CREATE TABLE demandes (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relation Client
  client_id VARCHAR(36) NOT NULL,
  
  -- Propriété
  property_id VARCHAR(100) NOT NULL,
  property_name VARCHAR(255),
  property_price DECIMAL(15, 2),
  
  -- Type de Demande
  request_type ENUM('achat', 'location', 'visite', 'information') NOT NULL,
  
  -- Financement
  financing_needed ENUM('oui', 'non') DEFAULT 'non',
  down_payment DECIMAL(15, 2),
  loan_amount DECIMAL(15, 2),
  
  -- Visite
  visit_date DATE,
  visit_time VARCHAR(10),
  number_of_persons INT DEFAULT 1,
  
  -- Statut
  status ENUM('nouveau', 'en_cours', 'approuve', 'rejete', 'termine') DEFAULT 'nouveau',
  priority ENUM('basse', 'normale', 'haute', 'urgente') DEFAULT 'normale',
  
  -- Assignation
  assigned_to VARCHAR(36), -- ID de l'agent
  
  -- Messages
  client_message TEXT,
  admin_notes TEXT,
  
  -- Metadata
  source VARCHAR(100),
  referral_code VARCHAR(50),
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_client (client_id),
  INDEX idx_property (property_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_assigned (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 4. **proprietes** - Catalogue Propriétés

```sql
CREATE TABLE proprietes (
  id VARCHAR(100) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Informations Générales
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  
  -- Localisation
  project_slug VARCHAR(100), -- Ex: 'tchikobo-beach-residence'
  address TEXT,
  city VARCHAR(100) DEFAULT 'Pointe-Noire',
  neighborhood VARCHAR(100),
  
  -- Caractéristiques
  type VARCHAR(50) NOT NULL, -- 'villa', 'appartement', 'studio', 'penthouse'
  bedrooms INT,
  bathrooms INT,
  surface DECIMAL(10, 2), -- m²
  land_surface DECIMAL(10, 2), -- m² terrain
  floor INT,
  
  -- Prix
  price DECIMAL(15, 2) NOT NULL,
  price_per_sqm DECIMAL(10, 2),
  rental_price DECIMAL(15, 2), -- Prix location si applicable
  
  -- Disponibilité
  status ENUM('disponible', 'reserve', 'vendu', 'loue', 'construction') DEFAULT 'disponible',
  availability_date DATE,
  
  -- Médias
  main_image TEXT,
  images JSON, -- Array d'URLs
  video_url TEXT,
  virtual_tour_url TEXT,
  
  -- Équipements (JSON Array)
  amenities JSON, -- ['piscine', 'garage', 'jardin', etc.]
  
  -- SEO
  featured BOOLEAN DEFAULT false,
  views INT DEFAULT 0,
  requests INT DEFAULT 0,
  
  INDEX idx_slug (slug),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_project (project_slug),
  INDEX idx_price (price),
  INDEX idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5. **transactions** - Historique Transactions

```sql
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relations
  client_id VARCHAR(36) NOT NULL,
  demande_id VARCHAR(36),
  property_id VARCHAR(100),
  
  -- Transaction Info
  type ENUM('acompte', 'mensualite', 'solde', 'frais') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'FCFA',
  
  -- Paiement
  payment_method VARCHAR(50), -- 'mobile_money', 'virement', 'carte_bancaire'
  payment_provider VARCHAR(50), -- 'airtel', 'mtn', 'visa', etc.
  transaction_reference VARCHAR(100) UNIQUE,
  
  -- Statut
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  
  -- Metadata
  receipt_url TEXT,
  admin_notes TEXT,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE SET NULL,
  INDEX idx_client (client_id),
  INDEX idx_status (status),
  INDEX idx_reference (transaction_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6. **activities** - Journal d'Activité

```sql
CREATE TABLE activities (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relations
  client_id VARCHAR(36),
  demande_id VARCHAR(36),
  admin_id VARCHAR(36),
  
  -- Activité
  action VARCHAR(100) NOT NULL, -- 'client_created', 'document_uploaded', 'request_approved', etc.
  entity_type VARCHAR(50), -- 'client', 'demande', 'document', etc.
  entity_id VARCHAR(36),
  
  -- Détails
  description TEXT,
  metadata JSON, -- Données additionnelles
  
  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  INDEX idx_client (client_id),
  INDEX idx_demande (demande_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7. **admins** - Utilisateurs Admin

```sql
CREATE TABLE admins (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Authentification (Supabase gère auth)
  supabase_user_id VARCHAR(36) UNIQUE,
  
  -- Informations
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  
  -- Rôle
  role ENUM('super_admin', 'admin', 'agent', 'accountant') DEFAULT 'agent',
  
  -- Permissions (JSON)
  permissions JSON,
  
  -- Statut
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  
  -- Metadata
  avatar_url TEXT,
  last_login TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔗 Relations

```
clients (1) -----> (N) demandes
clients (1) -----> (N) documents
clients (1) -----> (N) transactions

demandes (N) -----> (1) clients
demandes (N) -----> (1) proprietes
demandes (1) -----> (N) documents
demandes (1) -----> (N) transactions

documents (N) -----> (1) clients
documents (N) -----> (1) demandes (optionnel)

transactions (N) -----> (1) clients
transactions (N) -----> (1) demandes (optionnel)

activities → clients, demandes, admins (tracking)
```

---

## 📋 Indexes Recommandés

```sql
-- Performance queries fréquentes
CREATE INDEX idx_clients_status_date ON clients(status, created_at);
CREATE INDEX idx_demandes_status_priority ON demandes(status, priority);
CREATE INDEX idx_documents_client_status ON documents(client_id, status);
CREATE INDEX idx_transactions_client_date ON transactions(client_id, created_at);

-- Full-text search (si nécessaire)
CREATE FULLTEXT INDEX idx_clients_search ON clients(first_name, last_name, email);
CREATE FULLTEXT INDEX idx_proprietes_search ON proprietes(name, description, address);
```

---

## 📊 Exemples de Données

### Client

```json
{
  "id": "client-001",
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@email.com",
  "phone": "+242 06 458 86 18",
  "address": "Avenue de l'Indépendance, Quartier Tié-Tié",
  "city": "Pointe-Noire",
  "profession": "Entrepreneur",
  "company": "Dupont Trading Sarl",
  "status": "prospect",
  "source": "website"
}
```

### Document

```json
{
  "id": "doc-001",
  "client_id": "client-001",
  "document_type": "id_card",
  "file_name": "CNI_Jean_Dupont.pdf",
  "file_path": "https://storage.supabase.co/...",
  "status": "pending"
}
```

### Demande

```json
{
  "id": "REQ-001",
  "client_id": "client-001",
  "property_id": "tchikobo-villa-5",
  "request_type": "achat",
  "financing_needed": "oui",
  "down_payment": 50000000,
  "status": "nouveau",
  "priority": "haute"
}
```

---

## 🚀 Prochaines Étapes

### Option A : Supabase PostgreSQL (Recommandé)

**Avantages :**
- ✅ Déjà configuré dans l'environnement
- ✅ Auth intégrée
- ✅ Storage intégré
- ✅ Edge Functions disponibles
- ✅ Temps réel (subscriptions)
- ✅ Hosted, pas de maintenance

**Implémentation :**
1. Créer les tables dans Supabase UI
2. Configurer Row Level Security (RLS)
3. Créer les API routes dans le serveur
4. Tester en local

---

### Option B : MySQL Local

**Avantages :**
- ✅ Contrôle total
- ✅ Pas de coûts SaaS (local)
- ✅ Familier si vous connaissez MySQL

**Inconvénients :**
- ❌ Setup plus complexe
- ❌ Pas d'auth intégrée
- ❌ Pas de storage intégré
- ❌ Migration nécessaire pour prod

**Setup Docker :**
```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: msf_congo
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  phpmyadmin:
    image: phpmyadmin:latest
    ports:
      - "8080:80"
    environment:
      PMA_HOST: mysql

volumes:
  mysql_data:
```

---

### Option C : Hybrid (Local MySQL → Production Supabase)

**Workflow :**
1. Développer en local avec MySQL
2. Utiliser Prisma/TypeORM pour abstraction
3. Migrer vers Supabase PostgreSQL pour production
4. Adapter uniquement les spécificités SQL

---

## 📝 Recommandation

**Je recommande Option A (Supabase PostgreSQL)** car :

1. ✅ Déjà intégré dans votre stack
2. ✅ Pas de setup local complexe
3. ✅ Même DB en dev et prod
4. ✅ PostgreSQL est très similaire à MySQL
5. ✅ Auth + Storage + Edge Functions inclus
6. ✅ Free tier généreux

**Conversion MySQL → PostgreSQL facile :**
- `AUTO_INCREMENT` → `SERIAL` ou `GENERATED ALWAYS AS IDENTITY`
- `ENUM` → Types personnalisés ou `VARCHAR` avec CHECK
- `JSON` → `JSONB` (plus performant)

---

Voulez-vous que je :
1. **Crée le setup Supabase PostgreSQL** (recommandé)
2. **Crée le setup MySQL local avec Docker**
3. **Les deux en parallèle** pour comparer

Dites-moi votre préférence ! 🚀
