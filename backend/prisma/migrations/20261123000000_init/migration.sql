-- Initial schema for Scentory. Apply as a single transaction.
BEGIN;
CREATE TYPE "Concentration" AS ENUM ('EAU_DE_COLOGNE', 'EAU_DE_TOILETTE', 'EAU_DE_PARFUM', 'PARFUM', 'EXTRAIT_DE_PARFUM', 'OTHER');
CREATE TYPE "FragranceFamily" AS ENUM ('CITRUS', 'FLORAL', 'WOODY', 'AMBER', 'FRESH', 'GOURMAND', 'AROMATIC', 'LEATHER', 'CHYPRE', 'FOUGERE', 'OTHER');
CREATE TYPE "NoteCategory" AS ENUM ('CITRUS', 'FLORAL', 'WOODY', 'SPICY', 'FRUITY', 'SWEET', 'GREEN', 'MUSKY', 'RESINOUS', 'OTHER');
CREATE TYPE "NoteLayer" AS ENUM ('TOP', 'MIDDLE', 'BASE');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TABLE perfumes (
 id UUID PRIMARY KEY, name VARCHAR(120) NOT NULL, brand VARCHAR(100) NOT NULL,
 concentration "Concentration" NOT NULL, fragrance_family "FragranceFamily" NOT NULL,
 volume_ml INTEGER CHECK (volume_ml BETWEEN 1 AND 1000), description TEXT, image_url TEXT,
 purchase_price DECIMAL(14,2) CHECK (purchase_price >= 0), purchase_date DATE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE fragrance_notes (
 id UUID PRIMARY KEY, name VARCHAR(80) NOT NULL, name_key VARCHAR(80) NOT NULL UNIQUE,
 category "NoteCategory" NOT NULL, description TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE perfume_notes (
 perfume_id UUID NOT NULL REFERENCES perfumes(id) ON DELETE CASCADE ON UPDATE CASCADE,
 note_id UUID NOT NULL REFERENCES fragrance_notes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
 layer "NoteLayer" NOT NULL, PRIMARY KEY (perfume_id, note_id, layer)
);
CREATE TABLE collections (
 id UUID PRIMARY KEY, name VARCHAR(80) NOT NULL, name_key VARCHAR(80) NOT NULL UNIQUE,
 description TEXT, cover_image_url TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE collection_perfumes (
 collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE ON UPDATE CASCADE,
 perfume_id UUID NOT NULL REFERENCES perfumes(id) ON DELETE CASCADE ON UPDATE CASCADE,
 added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (collection_id, perfume_id)
);
CREATE TABLE reviews (
 id UUID PRIMARY KEY, perfume_id UUID NOT NULL UNIQUE REFERENCES perfumes(id) ON DELETE CASCADE ON UPDATE CASCADE,
 overall_rating SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
 longevity_rating SMALLINT CHECK (longevity_rating BETWEEN 1 AND 5),
 projection_rating SMALLINT CHECK (projection_rating BETWEEN 1 AND 5),
 review_text TEXT, tested_date DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE wishlist_items (
 id UUID PRIMARY KEY, name VARCHAR(120) NOT NULL, brand VARCHAR(100) NOT NULL,
 concentration "Concentration" NOT NULL, fragrance_family "FragranceFamily", image_url TEXT,
 estimated_price DECIMAL(14,2) CHECK (estimated_price >= 0), priority "Priority" NOT NULL DEFAULT 'MEDIUM', notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL
);
COMMIT;
