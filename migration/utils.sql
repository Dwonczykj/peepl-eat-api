SET @tablename = 'orderitem';
SET @prod_db_name = 'vegiprod';
SET @dev_db_name = 'vegidev';

SELECT dev.table_name, dev.column_name, dev.column_type, dev.is_nullable
FROM information_schema.columns as dev
WHERE dev.table_name = @tablename and dev.TABLE_SCHEMA = @dev_db_name
    AND column_name NOT IN
    (
        SELECT prod.column_name
        FROM information_schema.columns as prod
        WHERE prod.table_name = @tablename and prod.TABLE_SCHEMA = @prod_db_name
    );
    
SELECT dev.table_name, dev.column_name, dev.is_nullable, prod.is_nullable
FROM information_schema.columns as dev 
LEFT JOIN information_schema.columns as prod
	on prod.table_name = dev.table_name and prod.column_name = dev.column_name and prod.TABLE_SCHEMA = @prod_db_name
WHERE dev.is_nullable <> prod.is_nullable and dev.TABLE_SCHEMA = @dev_db_name;

SELECT dev.column_name, dev.column_type, prod.column_type
FROM information_schema.columns as dev 
LEFT JOIN information_schema.columns as prod
	on prod.table_name = dev.table_name and prod.column_name = dev.column_name and prod.TABLE_SCHEMA = @prod_db_name
WHERE dev.column_type <> prod.column_type and dev.TABLE_SCHEMA = @dev_db_name;