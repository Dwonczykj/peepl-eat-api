SET sql_safe_updates=0;
update `vegi`.`product` set 
	status = 'active'
where 
	status is null;
SET sql_safe_updates=1;    

select * from `vegi`.`product`;