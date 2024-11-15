-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "hstore";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Create initial database if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'stock_management') THEN
        CREATE DATABASE stock_management;
    END IF;
END
$$;

-- Connect to the database
\c stock_management;

-- Create initial schemas if needed
CREATE SCHEMA IF NOT EXISTS audit;

-- Create audit function
CREATE OR REPLACE FUNCTION audit.create_audit_table(target_table text) RETURNS void AS $$
BEGIN
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS audit.%I_history (
            id SERIAL PRIMARY KEY,
            action VARCHAR(10) NOT NULL,
            changed_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
            changed_by VARCHAR(100),
            old_data JSONB,
            new_data JSONB
        )', target_table);
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit.audit_trigger() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.%s_history (action, changed_by, new_data)
        VALUES (TG_OP, current_user, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.%s_history (action, changed_by, old_data, new_data)
        VALUES (TG_OP, current_user, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.%s_history (action, changed_by, old_data)
        VALUES (TG_OP, current_user, row_to_json(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create indexes function
CREATE OR REPLACE FUNCTION public.create_indexes() RETURNS void AS $$
BEGIN
    -- Add any custom index creation here
    -- Example:
    -- CREATE INDEX IF NOT EXISTS idx_product_name ON public.stock_app_product(name);
END;
$$ LANGUAGE plpgsql;

-- Create basic database functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create search functions
CREATE OR REPLACE FUNCTION public.search_products(search_term text)
RETURNS TABLE (
    id integer,
    name text,
    sku text,
    description text,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.sku,
        p.description,
        ts_rank_cd(
            setweight(to_tsvector('english', p.name), 'A') ||
            setweight(to_tsvector('english', p.sku), 'B') ||
            setweight(to_tsvector('english', COALESCE(p.description, '')), 'C'),
            plainto_tsquery('english', search_term)
        ) as rank
    FROM 
        public.stock_app_product p
    WHERE 
        to_tsvector('english', p.name) @@ plainto_tsquery('english', search_term) OR
        to_tsvector('english', p.sku) @@ plainto_tsquery('english', search_term) OR
        to_tsvector('english', COALESCE(p.description, '')) @@ plainto_tsquery('english', search_term)
    ORDER BY 
        rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Create materialized views
CREATE MATERIALIZED VIEW IF NOT EXISTS stock_levels_summary AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.sku,
    COALESCE(s.quantity, 0) as current_stock,
    p.minimum_stock,
    CASE 
        WHEN COALESCE(s.quantity, 0) <= p.minimum_stock THEN true 
        ELSE false 
    END as needs_restock
FROM 
    public.stock_app_product p
LEFT JOIN 
    public.stock_app_stock s ON p.id = s.product_id
WITH DATA;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS stock_levels_summary_product_id_idx 
ON stock_levels_summary (product_id);

-- Create refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY stock_levels_summary;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA audit TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO postgres;
