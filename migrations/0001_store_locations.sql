-- Migration for Store Locations
CREATE TABLE IF NOT EXISTS store_locations (
    id TEXT PRIMARY KEY,
    market_name TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    address TEXT,
    city TEXT DEFAULT 'Bakı',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    place_id TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed realistic Baku branches
INSERT OR IGNORE INTO store_locations (id, market_name, branch_name, address, latitude, longitude) VALUES 
('araz-28may', 'Araz', '28 May Filialı', '28 May küç. 23', 40.3798, 49.8486),
('araz-nizami', 'Araz', 'Nizami Filialı', 'Nizami küç. 10', 40.3758, 49.8356),
('araz-elmler', 'Araz', 'Elmlər Filialı', 'Bəxtiyar Vahabzadə küç.', 40.3728, 49.8156),
('bazarstore-portbaku', 'Bazarstore', 'Port Baku Filialı', 'Neftçilər pr. 151', 40.3772, 49.8668),
('bazarstore-ganclik', 'Bazarstore', 'Gənclik Mall', 'Fətəli Xan Xoyski pr.', 40.4001, 49.8521),
('bravo-koroglu', 'Bravo', 'Koroğlu Hipermarket', 'Heydər Əliyev pr.', 40.4205, 49.9172),
('bravo-20jan', 'Bravo', '20 Yanvar Filialı', 'Tbilisi pr.', 40.4032, 49.8122),
('bolmart-sahil', 'Bolmart', 'Sahil Filialı', 'Üzeyir Hacıbəyov küç.', 40.3742, 49.8542);
