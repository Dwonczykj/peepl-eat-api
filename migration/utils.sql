SET @tablename = 'orderitem';
SET @prod_db_name = 'vegiprod';
SET @dev_db_name = 'vegidev';

SELECT 
	-- NOW() - INTERVAL 20 DAY as BEFORE_DATE, 
    FROM_UNIXTIME(ROUND(product.createdAt / 1000), '%Y-%m-%d %h:%i:%s') as CreatedAtDate,
    product.* 
    FROM vegi.product product 
    WHERE -- product.createdAt <= (NOW() - INTERVAL 20 DAY)
    ROUND(product.createdAt / 1000) >= UNIX_TIMESTAMP('2022-05-01')
    ORDER BY product.createdAt asc;
	
SELECT 
	FROM_UNIXTIME(ROUND(t.updatedAt / 1000), '%Y %D %M %h:%i:%s %x') as UpdatedAtDate,
    CURRENT_TIMESTAMP() as ctime, UNIX_TIMESTAMP(CURRENT_TIMESTAMP()) as cUtime, 
    ROUND(t.updatedAt / 1000) as convTStamp,
	t.* 
    from vegi.user as t;

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


-- Get Unique Keys
WITH prod_constraints (table_schema, table_name, index_name, columns, constraint_type) AS (
	select stat.table_schema,
			   stat.table_name,
			   stat.index_name,
			   group_concat(stat.column_name
					order by stat.seq_in_index separator ', ') as columns,
			   tco.constraint_type
		from information_schema.statistics stat
		join information_schema.table_constraints tco
			 on stat.table_schema = tco.table_schema
			 and stat.table_name = tco.table_name
			 and stat.index_name = tco.constraint_name
		where stat.non_unique = 0 and stat.table_schema = @prod_db_name
			  -- and stat.table_schema not in ('information_schema', 'sys',
		--                                     'performance_schema', 'mysql')
		group by stat.table_schema,
				 stat.table_name,
				 stat.index_name,
				 tco.constraint_type
		order by stat.table_schema,
				 stat.table_name
), dev_constraints (table_schema, table_name, index_name, columns, constraint_type) AS (
	select stat.table_schema,
			   stat.table_name,
			   stat.index_name,
			   group_concat(stat.column_name
					order by stat.seq_in_index separator ', ') as columns,
			   tco.constraint_type
		from information_schema.statistics stat
		join information_schema.table_constraints tco
			 on stat.table_schema = tco.table_schema
			 and stat.table_name = tco.table_name
			 and stat.index_name = tco.constraint_name
		where stat.non_unique = 0 and stat.table_schema = @dev_db_name
			  -- and stat.table_schema not in ('information_schema', 'sys',
		--                                     'performance_schema', 'mysql')
		group by stat.table_schema,
				 stat.table_name,
				 stat.index_name,
				 tco.constraint_type
		order by stat.table_schema,
				 stat.table_name
)
SELECT prod_constraints.table_schema as prod_database_name, dev_constraints.table_schema as dev_database_name,
		prod_constraints.table_name,
		prod_constraints.index_name as prod_index_name, dev_constraints.index_name as dev_index_name,
		prod_constraints.columns as prod_columns, dev_constraints.columns as dev_columns,
		prod_constraints.constraint_type, dev_constraints.constraint_type 
	from prod_constraints
	left outer join dev_constraints
    on prod_constraints.table_name = dev_constraints.table_name and 
		prod_constraints.index_name = dev_constraints.index_name
	where dev_constraints.index_name is null or 
		dev_constraints.columns <> prod_constraints.columns or 
        dev_constraints.constraint_type <> prod_constraints.constraint_type
        
UNION

SELECT prod_constraints.table_schema as prod_database_name, dev_constraints.table_schema as dev_database_name,
		dev_constraints.table_name,
		prod_constraints.index_name as prod_index_name, dev_constraints.index_name as dev_index_name,
		prod_constraints.columns as prod_columns, dev_constraints.columns as dev_columns,
		prod_constraints.constraint_type, dev_constraints.constraint_type 
	from prod_constraints
	right outer join dev_constraints
    on prod_constraints.table_name = dev_constraints.table_name and 
		prod_constraints.index_name = dev_constraints.index_name
	where prod_constraints.index_name is null or 
		dev_constraints.columns <> prod_constraints.columns or 
        dev_constraints.constraint_type <> prod_constraints.constraint_type
;