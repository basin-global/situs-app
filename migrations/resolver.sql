-- @migration up
CREATE OR REPLACE FUNCTION get_resolver_data(search_term VARCHAR) 
RETURNS TABLE (
    -- Account info
    account_name VARCHAR,
    account_address VARCHAR,
    
    -- OG info
    og_name VARCHAR,
    og_address VARCHAR,
    og_type VARCHAR,
    
    -- Split info (if exists)
    split_address VARCHAR,
    split_type VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.account_name,
        sa.address as account_address,
        og.og_name,
        og.contract_address as og_address,
        og.contract_type as og_type,
        s.address as split_address,
        s.split_type
    FROM situs_accounts sa
    LEFT JOIN situs_ogs og ON sa.og_id = og.id
    LEFT JOIN splits s ON s.account_address = sa.address
    WHERE LOWER(sa.account_name) = LOWER(search_term);
END;
$$ LANGUAGE plpgsql;

-- @migration down
DROP FUNCTION IF EXISTS get_resolver_data(VARCHAR); 