-- Database initialization script for SCPI Simulator
-- This script runs when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS scpi_simulator;

-- Switch to the database
\c scpi_simulator;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS scpi;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create enum types
CREATE TYPE scpi.scpi_type AS ENUM ('comete', 'activimmo');
CREATE TYPE scpi.investment_type AS ENUM ('pleine_propriete', 'nue_propriete');
CREATE TYPE scpi.savings_frequency AS ENUM ('mensuelle', 'trimestrielle', 'semestrielle');

-- Create SCPI configuration table
CREATE TABLE IF NOT EXISTS scpi.scpi_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scpi_type scpi.scpi_type NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    price_per_share DECIMAL(10,2) NOT NULL,
    minimum_investment DECIMAL(12,2) NOT NULL,
    annual_yield DECIMAL(5,4) NOT NULL,
    capital_appreciation DECIMAL(5,4) NOT NULL,
    supported_investment_types scpi.investment_type[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create simulation history table (for future analytics)
CREATE TABLE IF NOT EXISTS analytics.simulation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255),
    scpi_type scpi.scpi_type NOT NULL,
    investment_type scpi.investment_type NOT NULL,
    investment_amount DECIMAL(12,2) NOT NULL,
    duration_years INTEGER NOT NULL,
    programmed_savings_amount DECIMAL(10,2),
    programmed_savings_frequency scpi.savings_frequency,
    dividend_reinvestment_rate DECIMAL(3,2),
    total_invested DECIMAL(12,2) NOT NULL,
    final_capital_value DECIMAL(12,2) NOT NULL,
    total_dividends_received DECIMAL(12,2) NOT NULL,
    annual_yield DECIMAL(5,2) NOT NULL,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_simulation_history_scpi_type ON analytics.simulation_history(scpi_type);
CREATE INDEX IF NOT EXISTS idx_simulation_history_investment_type ON analytics.simulation_history(investment_type);
CREATE INDEX IF NOT EXISTS idx_simulation_history_created_at ON analytics.simulation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_simulation_history_session_id ON analytics.simulation_history(session_id);

-- Insert default SCPI configurations
INSERT INTO scpi.scpi_config (
    scpi_type, name, price_per_share, minimum_investment, 
    annual_yield, capital_appreciation, supported_investment_types
) VALUES 
    (
        'comete', 
        'SCPI Comète', 
        250.00, 
        5000.00, 
        0.0450, 
        0.0250, 
        ARRAY['pleine_propriete', 'nue_propriete']::scpi.investment_type[]
    ),
    (
        'activimmo', 
        'SCPI ActivImmo', 
        610.00, 
        6100.00, 
        0.0550, 
        0.0300, 
        ARRAY['pleine_propriete', 'nue_propriete']::scpi.investment_type[]
    )
ON CONFLICT (scpi_type) DO UPDATE SET
    name = EXCLUDED.name,
    price_per_share = EXCLUDED.price_per_share,
    minimum_investment = EXCLUDED.minimum_investment,
    annual_yield = EXCLUDED.annual_yield,
    capital_appreciation = EXCLUDED.capital_appreciation,
    supported_investment_types = EXCLUDED.supported_investment_types,
    updated_at = CURRENT_TIMESTAMP;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_scpi_config_updated_at 
    BEFORE UPDATE ON scpi.scpi_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create application user with limited privileges
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'scpi_app_user') THEN
        CREATE ROLE scpi_app_user WITH LOGIN PASSWORD 'app_user_password';
    END IF;
END
$$;

-- Grant privileges to application user
GRANT USAGE ON SCHEMA scpi TO scpi_app_user;
GRANT USAGE ON SCHEMA analytics TO scpi_app_user;
GRANT SELECT ON scpi.scpi_config TO scpi_app_user;
GRANT INSERT, SELECT ON analytics.simulation_history TO scpi_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA scpi TO scpi_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA analytics TO scpi_app_user;

-- Create read-only user for analytics
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'scpi_readonly') THEN
        CREATE ROLE scpi_readonly WITH LOGIN PASSWORD 'readonly_password';
    END IF;
END
$$;

-- Grant read-only privileges
GRANT USAGE ON SCHEMA scpi TO scpi_readonly;
GRANT USAGE ON SCHEMA analytics TO scpi_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA scpi TO scpi_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO scpi_readonly;

-- Create view for analytics
CREATE OR REPLACE VIEW analytics.simulation_summary AS
SELECT 
    scpi_type,
    investment_type,
    COUNT(*) as simulation_count,
    AVG(investment_amount) as avg_investment_amount,
    AVG(duration_years) as avg_duration_years,
    AVG(annual_yield) as avg_annual_yield,
    DATE_TRUNC('day', created_at) as simulation_date
FROM analytics.simulation_history
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY scpi_type, investment_type, DATE_TRUNC('day', created_at)
ORDER BY simulation_date DESC;

-- Grant access to the view
GRANT SELECT ON analytics.simulation_summary TO scpi_readonly;

-- Insert some sample data for testing (optional)
-- This will be commented out in production
/*
INSERT INTO analytics.simulation_history (
    session_id, scpi_type, investment_type, investment_amount, duration_years,
    total_invested, final_capital_value, total_dividends_received, annual_yield,
    user_agent, ip_address
) VALUES 
    ('test-session-1', 'comete', 'pleine_propriete', 5000, 8, 5000, 6200, 1800, 4.5, 'Test User Agent', '127.0.0.1'),
    ('test-session-2', 'activimmo', 'nue_propriete', 6100, 10, 6100, 8200, 0, 3.0, 'Test User Agent', '127.0.0.1');
*/

-- Create database health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Database is healthy at ' || CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA scpi GRANT SELECT ON TABLES TO scpi_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT SELECT ON TABLES TO scpi_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT INSERT, SELECT ON TABLES TO scpi_app_user;

COMMIT;
