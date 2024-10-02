-- Create the situs_ogs table (Onchain Groups)
CREATE TABLE IF NOT EXISTS situs_ogs (
  id SERIAL PRIMARY KEY,
  og_name VARCHAR(255) NOT NULL UNIQUE,
  contract_address VARCHAR(42) NOT NULL UNIQUE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to create a table for each OG's accounts
CREATE OR REPLACE FUNCTION create_og_accounts_table(og_name VARCHAR) RETURNS void AS $$
DECLARE
  table_name VARCHAR;
BEGIN
  table_name := 'situs_accounts_' || replace(og_name, '.', '_');
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I (
      id SERIAL PRIMARY KEY,
      token_id NUMERIC(78, 0) NOT NULL UNIQUE,
      account_name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )', table_name);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_og_name ON situs_ogs(og_name);
CREATE INDEX IF NOT EXISTS idx_contract_address ON situs_ogs(contract_address);

-- Create a function to get accounts for a specific OG
CREATE OR REPLACE FUNCTION get_accounts_for_og(og_name VARCHAR) RETURNS TABLE (
  id INT,
  token_id NUMERIC(78, 0),
  account_name VARCHAR(255),
  created_at TIMESTAMP
) AS $$
DECLARE
  table_name VARCHAR;
BEGIN
  table_name := 'situs_accounts_' || replace(og_name, '.', '_');
  RETURN QUERY EXECUTE format('SELECT * FROM %I', table_name);
END;
$$ LANGUAGE plpgsql;