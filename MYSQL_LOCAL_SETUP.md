# 🐬 Setup MySQL Local - MSF Congo

## 🎯 Objectif

Configurer une base de données MySQL locale pour le développement, avec :
- Base de données `msf_congo`
- Toutes les tables (clients, documents, demandes, etc.)
- Interface phpMyAdmin pour gestion visuelle
- API backend pour connexion depuis l'app

---

## 📋 Prérequis

### Option 1 : Docker (Recommandé)

```bash
# Vérifier si Docker est installé
docker --version

# Si pas installé, télécharger depuis :
# https://www.docker.com/products/docker-desktop
```

### Option 2 : Installation Directe

```bash
# Windows : Télécharger XAMPP ou WAMP
# Mac : Télécharger MAMP
# Linux : sudo apt install mysql-server
```

---

## 🐳 SETUP AVEC DOCKER (Recommandé)

### Étape 1 : Créer docker-compose.yml

Créez un fichier `docker-compose.yml` à la racine du projet :

```yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: msf_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: msf_root_2024
      MYSQL_DATABASE: msf_congo
      MYSQL_USER: msf_admin
      MYSQL_PASSWORD: msf_admin_2024
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - msf_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # phpMyAdmin - Interface Web
  phpmyadmin:
    image: phpmyadmin:latest
    container_name: msf_phpmyadmin
    restart: unless-stopped
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
      PMA_USER: msf_admin
      PMA_PASSWORD: msf_admin_2024
    ports:
      - "8080:80"
    depends_on:
      - mysql
    networks:
      - msf_network

volumes:
  mysql_data:
    driver: local

networks:
  msf_network:
    driver: bridge
```

### Étape 2 : Créer le Script SQL Initial

Créez le fichier `/database/init.sql` :

```sql
-- MSF Congo - Initialisation Base de Données
-- Base : msf_congo
-- Encodage : UTF8MB4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- TABLE: clients
-- ========================================
CREATE TABLE IF NOT EXISTS `clients` (
  `id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Informations Personnelles
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `alternate_phone` VARCHAR(20),
  
  -- Adresse
  `address` TEXT,
  `city` VARCHAR(100),
  `country` VARCHAR(100) DEFAULT 'Congo-Brazzaville',
  
  -- Informations Professionnelles
  `profession` VARCHAR(100),
  `company` VARCHAR(200),
  `monthly_income_range` VARCHAR(50),
  
  -- Statut
  `status` ENUM('prospect', 'client', 'vip', 'archived') DEFAULT 'prospect',
  `source` VARCHAR(100),
  
  -- Assignation
  `assigned_agent_id` VARCHAR(36),
  
  -- Notes
  `notes` TEXT,
  
  -- Metadata
  `total_requests` INT DEFAULT 0,
  `total_purchases` INT DEFAULT 0,
  `total_spent` DECIMAL(15, 2) DEFAULT 0,
  `last_contact_date` TIMESTAMP NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_agent` (`assigned_agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLE: documents
-- ========================================
CREATE TABLE IF NOT EXISTS `documents` (
  `id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relation
  `client_id` VARCHAR(36) NOT NULL,
  `request_id` VARCHAR(36),
  
  -- Document Info
  `document_type` VARCHAR(50) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` TEXT NOT NULL,
  `file_size` INT,
  `file_mime_type` VARCHAR(100),
  
  -- Validation
  `status` ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  `validated_by` VARCHAR(36),
  `validated_at` TIMESTAMP NULL,
  `rejection_reason` TEXT,
  
  -- Metadata
  `expiry_date` DATE,
  `is_sensitive` BOOLEAN DEFAULT FALSE,
  
  PRIMARY KEY (`id`),
  KEY `idx_client` (`client_id`),
  KEY `idx_type` (`document_type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_documents_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLE: demandes
-- ========================================
CREATE TABLE IF NOT EXISTS `demandes` (
  `id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relation Client
  `client_id` VARCHAR(36) NOT NULL,
  
  -- Propriété
  `property_id` VARCHAR(100) NOT NULL,
  `property_name` VARCHAR(255),
  `property_price` DECIMAL(15, 2),
  
  -- Type de Demande
  `request_type` ENUM('achat', 'location', 'visite', 'information') NOT NULL,
  
  -- Financement
  `financing_needed` ENUM('oui', 'non') DEFAULT 'non',
  `down_payment` DECIMAL(15, 2),
  `loan_amount` DECIMAL(15, 2),
  
  -- Visite
  `visit_date` DATE,
  `visit_time` VARCHAR(10),
  `number_of_persons` INT DEFAULT 1,
  
  -- Statut
  `status` ENUM('nouveau', 'en_cours', 'approuve', 'rejete', 'termine') DEFAULT 'nouveau',
  `priority` ENUM('basse', 'normale', 'haute', 'urgente') DEFAULT 'normale',
  
  -- Assignation
  `assigned_to` VARCHAR(36),
  
  -- Messages
  `client_message` TEXT,
  `admin_notes` TEXT,
  
  -- Metadata
  `source` VARCHAR(100),
  `referral_code` VARCHAR(50),
  
  PRIMARY KEY (`id`),
  KEY `idx_client` (`client_id`),
  KEY `idx_property` (`property_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_assigned` (`assigned_to`),
  CONSTRAINT `fk_demandes_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLE: proprietes
-- ========================================
CREATE TABLE IF NOT EXISTS `proprietes` (
  `id` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Informations Générales
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT,
  
  -- Localisation
  `project_slug` VARCHAR(100),
  `address` TEXT,
  `city` VARCHAR(100) DEFAULT 'Pointe-Noire',
  `neighborhood` VARCHAR(100),
  
  -- Caractéristiques
  `type` VARCHAR(50) NOT NULL,
  `bedrooms` INT,
  `bathrooms` INT,
  `surface` DECIMAL(10, 2),
  `land_surface` DECIMAL(10, 2),
  `floor` INT,
  
  -- Prix
  `price` DECIMAL(15, 2) NOT NULL,
  `price_per_sqm` DECIMAL(10, 2),
  `rental_price` DECIMAL(15, 2),
  
  -- Disponibilité
  `status` ENUM('disponible', 'reserve', 'vendu', 'loue', 'construction') DEFAULT 'disponible',
  `availability_date` DATE,
  
  -- Médias
  `main_image` TEXT,
  `images` JSON,
  `video_url` TEXT,
  `virtual_tour_url` TEXT,
  
  -- Équipements
  `amenities` JSON,
  
  -- SEO
  `featured` BOOLEAN DEFAULT FALSE,
  `views` INT DEFAULT 0,
  `requests` INT DEFAULT 0,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_slug` (`slug`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_project` (`project_slug`),
  KEY `idx_price` (`price`),
  KEY `idx_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLE: transactions
-- ========================================
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relations
  `client_id` VARCHAR(36) NOT NULL,
  `demande_id` VARCHAR(36),
  `property_id` VARCHAR(100),
  
  -- Transaction Info
  `type` ENUM('acompte', 'mensualite', 'solde', 'frais') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'FCFA',
  
  -- Paiement
  `payment_method` VARCHAR(50),
  `payment_provider` VARCHAR(50),
  `transaction_reference` VARCHAR(100),
  
  -- Statut
  `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  
  -- Metadata
  `receipt_url` TEXT,
  `admin_notes` TEXT,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_reference` (`transaction_reference`),
  KEY `idx_client` (`client_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_transactions_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLE: activities
-- ========================================
CREATE TABLE IF NOT EXISTS `activities` (
  `id` BIGINT AUTO_INCREMENT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relations
  `client_id` VARCHAR(36),
  `demande_id` VARCHAR(36),
  `admin_id` VARCHAR(36),
  
  -- Activité
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50),
  `entity_id` VARCHAR(36),
  
  -- Détails
  `description` TEXT,
  `metadata` JSON,
  
  -- Context
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  
  PRIMARY KEY (`id`),
  KEY `idx_client` (`client_id`),
  KEY `idx_demande` (`demande_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DONNÉES DE TEST
-- ========================================

-- Client de test
INSERT INTO `clients` (`id`, `first_name`, `last_name`, `email`, `phone`, `address`, `city`, `profession`, `company`, `status`, `source`) VALUES
('client-001', 'Jean', 'Dupont', 'jean.dupont@email.com', '+242 06 458 86 18', 'Avenue de l''Indépendance, Quartier Tié-Tié', 'Pointe-Noire', 'Entrepreneur', 'Dupont Trading Sarl', 'prospect', 'website');

-- Propriété de test
INSERT INTO `proprietes` (`id`, `name`, `slug`, `type`, `bedrooms`, `bathrooms`, `surface`, `price`, `status`, `featured`) VALUES
('tchikobo-villa-5', 'Villa Tchikobo Prestige', 'villa-tchikobo-prestige', 'villa', 5, 4, 450, 295200000, 'disponible', TRUE);

-- Demande de test
INSERT INTO `demandes` (`id`, `client_id`, `property_id`, `property_name`, `property_price`, `request_type`, `financing_needed`, `down_payment`, `status`, `priority`) VALUES
('REQ-001', 'client-001', 'tchikobo-villa-5', 'Villa Tchikobo Prestige', 295200000, 'achat', 'oui', 50000000, 'nouveau', 'haute');

SET FOREIGN_KEY_CHECKS = 1;
```

### Étape 3 : Démarrer les Conteneurs

```bash
# Créer le dossier database
mkdir database

# Copier le init.sql dans database/

# Lancer Docker
docker-compose up -d

# Vérifier que tout tourne
docker-compose ps

# Voir les logs
docker-compose logs -f mysql
```

### Étape 4 : Accéder à phpMyAdmin

```
URL : http://localhost:8080
Serveur : mysql
Utilisateur : msf_admin
Mot de passe : msf_admin_2024
```

---

## 🔌 CONNEXION BACKEND

### Étape 5 : Installer le Driver MySQL

```bash
npm install mysql2
```

### Étape 6 : Créer /database/mysql.ts

```typescript
import mysql from 'mysql2/promise';

// Configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'msf_admin',
  password: process.env.MYSQL_PASSWORD || 'msf_admin_2024',
  database: process.env.MYSQL_DATABASE || 'msf_congo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de connexions
export const pool = mysql.createPool(dbConfig);

// Helper: Query
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// Helper: Insérer
export async function insert(
  table: string,
  data: Record<string, any>
): Promise<string> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const [result] = await pool.execute(sql, values);
  return (result as any).insertId;
}

// Helper: Mettre à jour
export async function update(
  table: string,
  id: string,
  data: Record<string, any>
): Promise<void> {
  const entries = Object.entries(data);
  const sets = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  
  const sql = `UPDATE ${table} SET ${sets} WHERE id = ?`;
  await pool.execute(sql, [...values, id]);
}

// Helper: Supprimer
export async function remove(
  table: string,
  id: string
): Promise<void> {
  const sql = `DELETE FROM ${table} WHERE id = ?`;
  await pool.execute(sql, [id]);
}

// Tester la connexion
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    console.log('✅ MySQL connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
}
```

### Étape 7 : Créer les API Routes

**Exemple : /api/clients**

```typescript
// Dans /supabase/functions/server/routes/clients.ts
import { Hono } from 'npm:hono';
import { query, insert, update, remove } from '../../../database/mysql';
import { v4 as uuidv4 } from 'npm:uuid';

const clients = new Hono();

// GET /clients - Liste tous les clients
clients.get('/', async (c) => {
  try {
    const rows = await query('SELECT * FROM clients ORDER BY created_at DESC');
    return c.json({ success: true, data: rows });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /clients/:id - Détail client
clients.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const rows = await query('SELECT * FROM clients WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return c.json({ success: false, error: 'Client not found' }, 404);
    }
    
    return c.json({ success: true, data: rows[0] });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /clients - Créer client
clients.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    const clientData = {
      id: uuidv4(),
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email,
      phone: body.phone,
      address: body.address || null,
      city: body.city || 'Pointe-Noire',
      profession: body.profession || null,
      company: body.company || null,
      status: 'prospect',
      source: body.source || 'website'
    };
    
    await insert('clients', clientData);
    
    return c.json({ success: true, data: clientData }, 201);
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /clients/:id - Modifier client
clients.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    await update('clients', id, body);
    
    return c.json({ success: true, message: 'Client updated' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /clients/:id - Supprimer client
clients.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await remove('clients', id);
    
    return c.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default clients;
```

---

## 🧪 TESTER LA CONNEXION

### Test 1 : Vérifier MySQL

```bash
# Se connecter au conteneur
docker exec -it msf_mysql mysql -u msf_admin -p

# Taper le mot de passe : msf_admin_2024

# Vérifier les tables
USE msf_congo;
SHOW TABLES;

# Voir les données
SELECT * FROM clients;
SELECT * FROM proprietes;
SELECT * FROM demandes;
```

### Test 2 : API Backend

```bash
# Test GET clients
curl http://localhost:8000/api/clients

# Test POST client
curl -X POST http://localhost:8000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marie",
    "lastName": "Okemba",
    "email": "marie@email.com",
    "phone": "+242 05 587 73 24"
  }'
```

---

## 📋 COMMANDES UTILES

```bash
# Démarrer MySQL
docker-compose up -d

# Arrêter MySQL
docker-compose down

# Voir les logs
docker-compose logs -f mysql

# Redémarrer
docker-compose restart

# Supprimer tout (ATTENTION: perte de données)
docker-compose down -v

# Backup base de données
docker exec msf_mysql mysqldump -u msf_admin -pmsf_admin_2024 msf_congo > backup.sql

# Restaurer backup
docker exec -i msf_mysql mysql -u msf_admin -pmsf_admin_2024 msf_congo < backup.sql
```

---

## ✅ AVANTAGES MYSQL LOCAL

1. ✅ **Développement offline** - Pas besoin d'internet
2. ✅ **Contrôle total** - Backup, restauration, config
3. ✅ **Performance** - Pas de latence réseau
4. ✅ **Gratuit** - Aucun coût
5. ✅ **phpMyAdmin** - Interface visuelle intuitive

---

## 🚀 MIGRATION VERS PRODUCTION

### Option 1 : MySQL SaaS (PlanetScale, AWS RDS)

```typescript
// Changer uniquement les variables d'environnement
MYSQL_HOST=your-db.planetscale.com
MYSQL_USER=production_user
MYSQL_PASSWORD=prod_password
MYSQL_DATABASE=msf_congo_prod
```

### Option 2 : Migration vers PostgreSQL (Supabase)

```bash
# Exporter de MySQL
mysqldump -u msf_admin -p msf_congo > export.sql

# Convertir SQL avec pgloader
pgloader mysql://user:pass@localhost/msf_congo postgresql://user:pass@supabase/msf_congo
```

---

Voulez-vous que je crée maintenant :

1. ✅ **Les fichiers Docker** (docker-compose.yml + init.sql)
2. ✅ **Le module de connexion MySQL** (/database/mysql.ts)
3. ✅ **Les routes API complètes** (clients, demandes, documents)
4. ✅ **Les tests Postman/Thunder Client**

Dites-moi ce que vous voulez en premier ! 🚀
