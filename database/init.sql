-- =========================================
-- MSF CONGO - Base de Données MySQL
-- =========================================
-- Database: msf_congo
-- Encoding: UTF8MB4
-- Collation: utf8mb4_unicode_ci
-- =========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================
-- TABLE: clients
-- Base de données clients
-- =========================================
CREATE TABLE IF NOT EXISTS `clients` (
  `id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Informations Personnelles
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `alternate_phone` VARCHAR(20) DEFAULT NULL,
  
  -- Adresse
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT 'Pointe-Noire',
  `country` VARCHAR(100) DEFAULT 'Congo-Brazzaville',
  
  -- Informations Professionnelles
  `profession` VARCHAR(100) DEFAULT NULL,
  `company` VARCHAR(200) DEFAULT NULL,
  `monthly_income_range` VARCHAR(50) DEFAULT NULL,
  
  -- Statut
  `status` ENUM('prospect', 'client', 'vip', 'archived') DEFAULT 'prospect',
  `source` VARCHAR(100) DEFAULT 'website',
  
  -- Assignation
  `assigned_agent_id` VARCHAR(36) DEFAULT NULL,
  
  -- Notes
  `notes` TEXT DEFAULT NULL,
  
  -- Metadata
  `total_requests` INT DEFAULT 0,
  `total_purchases` INT DEFAULT 0,
  `total_spent` DECIMAL(15, 2) DEFAULT 0.00,
  `last_contact_date` TIMESTAMP NULL DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_agent` (`assigned_agent_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- TABLE: documents
-- Documents justificatifs clients
-- =========================================
CREATE TABLE IF NOT EXISTS `documents` (
  `id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relations
  `client_id` VARCHAR(36) NOT NULL,
  `request_id` VARCHAR(36) DEFAULT NULL,
  
  -- Document Info
  `document_type` VARCHAR(50) NOT NULL COMMENT 'id_card, proof_income, bank_statement, etc.',
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` TEXT NOT NULL,
  `file_size` INT DEFAULT NULL COMMENT 'Taille en bytes',
  `file_mime_type` VARCHAR(100) DEFAULT NULL,
  
  -- Validation
  `status` ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  `validated_by` VARCHAR(36) DEFAULT NULL COMMENT 'ID admin validateur',
  `validated_at` TIMESTAMP NULL DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  
  -- Metadata
  `expiry_date` DATE DEFAULT NULL,
  `is_sensitive` BOOLEAN DEFAULT FALSE,
  
  PRIMARY KEY (`id`),
  KEY `idx_client` (`client_id`),
  KEY `idx_request` (`request_id`),
  KEY `idx_type` (`document_type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_documents_client` 
    FOREIGN KEY (`client_id`) 
    REFERENCES `clients` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- TABLE: proprietes
-- Catalogue des propriétés
-- =========================================
CREATE TABLE IF NOT EXISTS `proprietes` (
  `id` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Informations Générales
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  
  -- Localisation
  `project_slug` VARCHAR(100) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT 'Pointe-Noire',
  `neighborhood` VARCHAR(100) DEFAULT NULL,
  
  -- Caractéristiques
  `type` VARCHAR(50) NOT NULL COMMENT 'villa, appartement, studio, penthouse',
  `bedrooms` INT DEFAULT NULL,
  `bathrooms` INT DEFAULT NULL,
  `surface` DECIMAL(10, 2) DEFAULT NULL COMMENT 'm²',
  `land_surface` DECIMAL(10, 2) DEFAULT NULL COMMENT 'm² terrain',
  `floor` INT DEFAULT NULL,
  
  -- Prix (en FCFA)
  `price` DECIMAL(15, 2) NOT NULL,
  `price_per_sqm` DECIMAL(10, 2) DEFAULT NULL,
  `rental_price` DECIMAL(15, 2) DEFAULT NULL,
  
  -- Disponibilité
  `status` ENUM('disponible', 'reserve', 'vendu', 'loue', 'construction') DEFAULT 'disponible',
  `availability_date` DATE DEFAULT NULL,
  
  -- Médias
  `main_image` TEXT DEFAULT NULL,
  `images` JSON DEFAULT NULL COMMENT 'Array URLs images',
  `video_url` TEXT DEFAULT NULL,
  `virtual_tour_url` TEXT DEFAULT NULL,
  
  -- Équipements
  `amenities` JSON DEFAULT NULL COMMENT 'Array équipements',
  
  -- SEO & Stats
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

-- =========================================
-- TABLE: demandes
-- Demandes de devis clients
-- =========================================
CREATE TABLE IF NOT EXISTS `demandes` (
  `id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relation Client
  `client_id` VARCHAR(36) NOT NULL,
  
  -- Propriété
  `property_id` VARCHAR(100) NOT NULL,
  `property_name` VARCHAR(255) DEFAULT NULL,
  `property_price` DECIMAL(15, 2) DEFAULT NULL,
  
  -- Type de Demande
  `request_type` ENUM('achat', 'location', 'visite', 'information') NOT NULL,
  
  -- Financement
  `financing_needed` ENUM('oui', 'non') DEFAULT 'non',
  `down_payment` DECIMAL(15, 2) DEFAULT NULL,
  `loan_amount` DECIMAL(15, 2) DEFAULT NULL,
  
  -- Visite
  `visit_date` DATE DEFAULT NULL,
  `visit_time` VARCHAR(10) DEFAULT NULL,
  `number_of_persons` INT DEFAULT 1,
  
  -- Statut
  `status` ENUM('nouveau', 'en_cours', 'approuve', 'rejete', 'termine') DEFAULT 'nouveau',
  `priority` ENUM('basse', 'normale', 'haute', 'urgente') DEFAULT 'normale',
  
  -- Assignation
  `assigned_to` VARCHAR(36) DEFAULT NULL,
  
  -- Messages
  `client_message` TEXT DEFAULT NULL,
  `admin_notes` TEXT DEFAULT NULL,
  
  -- Metadata
  `source` VARCHAR(100) DEFAULT 'website',
  `referral_code` VARCHAR(50) DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  KEY `idx_client` (`client_id`),
  KEY `idx_property` (`property_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_assigned` (`assigned_to`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_demandes_client` 
    FOREIGN KEY (`client_id`) 
    REFERENCES `clients` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- TABLE: transactions
-- Historique des transactions
-- =========================================
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relations
  `client_id` VARCHAR(36) NOT NULL,
  `demande_id` VARCHAR(36) DEFAULT NULL,
  `property_id` VARCHAR(100) DEFAULT NULL,
  
  -- Transaction Info
  `type` ENUM('acompte', 'mensualite', 'solde', 'frais') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'FCFA',
  
  -- Paiement
  `payment_method` VARCHAR(50) DEFAULT NULL COMMENT 'mobile_money, virement, carte_bancaire',
  `payment_provider` VARCHAR(50) DEFAULT NULL COMMENT 'airtel, mtn, visa, etc.',
  `transaction_reference` VARCHAR(100) DEFAULT NULL,
  
  -- Statut
  `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  
  -- Metadata
  `receipt_url` TEXT DEFAULT NULL,
  `admin_notes` TEXT DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_reference` (`transaction_reference`),
  KEY `idx_client` (`client_id`),
  KEY `idx_demande` (`demande_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_transactions_client` 
    FOREIGN KEY (`client_id`) 
    REFERENCES `clients` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- TABLE: activities
-- Journal d'activité (logs)
-- =========================================
CREATE TABLE IF NOT EXISTS `activities` (
  `id` BIGINT AUTO_INCREMENT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relations
  `client_id` VARCHAR(36) DEFAULT NULL,
  `demande_id` VARCHAR(36) DEFAULT NULL,
  `admin_id` VARCHAR(36) DEFAULT NULL,
  
  -- Activité
  `action` VARCHAR(100) NOT NULL COMMENT 'client_created, document_uploaded, etc.',
  `entity_type` VARCHAR(50) DEFAULT NULL COMMENT 'client, demande, document, etc.',
  `entity_id` VARCHAR(36) DEFAULT NULL,
  
  -- Détails
  `description` TEXT DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  
  -- Context
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  KEY `idx_client` (`client_id`),
  KEY `idx_demande` (`demande_id`),
  KEY `idx_admin` (`admin_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- DONNÉES DE TEST
-- =========================================

-- Client de test #1
INSERT INTO `clients` (
  `id`, `first_name`, `last_name`, `email`, `phone`, 
  `address`, `city`, `profession`, `company`, `status`, `source`
) VALUES (
  'client-001', 
  'Jean', 
  'Dupont', 
  'jean.dupont@email.com', 
  '+242 06 458 86 18',
  'Avenue de l''Indépendance, Quartier Tié-Tié',
  'Pointe-Noire',
  'Entrepreneur',
  'Dupont Trading Sarl',
  'prospect',
  'website'
);

-- Client de test #2
INSERT INTO `clients` (
  `id`, `first_name`, `last_name`, `email`, `phone`, 
  `city`, `profession`, `company`, `status`, `source`
) VALUES (
  'client-002', 
  'Marie', 
  'Okemba', 
  'm.okemba@company.cg', 
  '+242 05 587 73 24',
  'Pointe-Noire',
  'Cadre',
  'Total E&P',
  'client',
  'referral'
);

-- Propriété de test #1
INSERT INTO `proprietes` (
  `id`, `name`, `slug`, `type`, `bedrooms`, `bathrooms`, 
  `surface`, `price`, `status`, `featured`, `project_slug`
) VALUES (
  'tchikobo-villa-5', 
  'Villa Tchikobo Prestige', 
  'villa-tchikobo-prestige',
  'villa',
  5,
  4,
  450.00,
  295200000.00,
  'disponible',
  TRUE,
  'tchikobo-beach-residence'
);

-- Propriété de test #2
INSERT INTO `proprietes` (
  `id`, `name`, `slug`, `type`, `bedrooms`, `bathrooms`, 
  `surface`, `price`, `status`, `featured`
) VALUES (
  'appartement-royal-3b', 
  'Appartement Royal 3B', 
  'appartement-royal-3b',
  'appartement',
  3,
  2,
  120.00,
  75000000.00,
  'disponible',
  FALSE
);

-- Demande de test #1
INSERT INTO `demandes` (
  `id`, `client_id`, `property_id`, `property_name`, `property_price`,
  `request_type`, `financing_needed`, `down_payment`, 
  `status`, `priority`, `client_message`
) VALUES (
  'REQ-001',
  'client-001',
  'tchikobo-villa-5',
  'Villa Tchikobo Prestige',
  295200000.00,
  'achat',
  'oui',
  50000000.00,
  'nouveau',
  'haute',
  'Très intéressé par cette propriété. Disponible pour visite cette semaine.'
);

-- Demande de test #2
INSERT INTO `demandes` (
  `id`, `client_id`, `property_id`, `property_name`, `property_price`,
  `request_type`, `financing_needed`, `status`, `priority`
) VALUES (
  'REQ-002',
  'client-002',
  'appartement-royal-3b',
  'Appartement Royal 3B',
  75000000.00,
  'visite',
  'non',
  'en_cours',
  'normale'
);

-- Activité de test
INSERT INTO `activities` (
  `client_id`, `action`, `entity_type`, `entity_id`, `description`
) VALUES (
  'client-001',
  'demande_created',
  'demande',
  'REQ-001',
  'Nouvelle demande de devis créée pour Villa Tchikobo Prestige'
);

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- FIN DE L'INITIALISATION
-- =========================================
SELECT 'MSF Congo Database initialized successfully!' AS status;
