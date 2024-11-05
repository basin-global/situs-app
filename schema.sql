-- Create the situs_ogs table (Onchain Groups)
CREATE TABLE IF NOT EXISTS situs_ogs (
  id SERIAL PRIMARY KEY,
  og_name VARCHAR(255) NOT NULL UNIQUE,
  contract_address VARCHAR(42) NOT NULL UNIQUE
);

-- Function to create a table for each OG's accounts
CREATE OR REPLACE FUNCTION create_og_accounts_table(og_name VARCHAR) RETURNS void AS $$
DECLARE
  table_name VARCHAR;
BEGIN
  table_name := 'situs_accounts_' || replace(og_name, '.', '_');
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I (
      token_id INTEGER PRIMARY KEY,
      account_name VARCHAR(255) NOT NULL UNIQUE,
      tba_address VARCHAR(42) NOT NULL
    )', table_name);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_og_name ON situs_ogs(og_name);
CREATE INDEX IF NOT EXISTS idx_contract_address ON situs_ogs(contract_address);

-- Create a function to get accounts for a specific OG
CREATE OR REPLACE FUNCTION get_accounts_for_og(og_name VARCHAR) RETURNS TABLE (
  token_id INTEGER,
  account_name VARCHAR(255),
  tba_address VARCHAR(42)
) AS $$
DECLARE
  table_name VARCHAR;
BEGIN
  table_name := 'situs_accounts_' || replace(og_name, '.', '_');
  RETURN QUERY EXECUTE format('SELECT token_id, account_name, tba_address FROM %I', table_name);
END;
$$ LANGUAGE plpgsql;
