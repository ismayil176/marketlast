-- Initial migration for QIYMET.AZ

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    brand TEXT,
    image_url TEXT,
    package_size TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prices table
CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    market_name TEXT NOT NULL,
    price REAL NOT NULL,
    promo_price REAL,
    currency TEXT DEFAULT 'AZN',
    stock_status TEXT DEFAULT 'unknown',
    confidence_level TEXT DEFAULT 'unknown',
    source_type TEXT DEFAULT 'online',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Metadata table for system tracking
CREATE TABLE IF NOT EXISTS system_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Initial metadata
INSERT OR IGNORE INTO system_metadata (key, value) VALUES ('last_refresh', 'Heç vaxt');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prices_product_id ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
