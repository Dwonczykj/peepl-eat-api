select * from vegi.user;

Update vegi.user set phoneNoCountry = 7905532512 where id = 3; 

select * from vegi.notification as t order by t.id desc;



select * from vegi.vendor where id = 17;
select * from vegi.fulfilmentmethod where id = 34;

select * from vegi.productoptionvalue;

-- Update vegi.productoptionvalue set productBarCode = '4902778914038' where id = 11;
-- Update vegi.product set vendor = 17 where id = 1;

select * from vegi.postaldistrict;


select p.id, p.*, po.name as `Product Option Name`
	, p.name as `Product Name`
    , p.imageUrl
    , po.isRequired
    , pov.name as 'Product Option Val Name'
    , pov.description as 'Product Option Val Description'
    ,  pov.isAvailable as 'Product Option Val Is Avail'
    , pov.priceModifier as 'Product Option Val Price Modifier'
    , pc.name as `Product Category (in Vendor)`
    , vc.name as `vegi Category`
from vegi.productoption po 
left join vegi.productoptionvalue pov on pov.option = po.id 
left join vegi.product p on p.id = po.product 
left join vegi.productcategory pc on pc.id = p.category 
left join vegi.categorygroup vc on vc.id = pc.categoryGroup
left join vegi.escrating escr on escr.productPublicId = pov.productBarCode
left join vegi.escexplanation escexp on escr.id = escexp.escrating
where pov.id = 11
;


SELECT p.* FROM vegi.productoption po 
left join vegi.productoptionvalue pov on pov.option = po.id 
left join vegi.product p on p.id = po.product 
WHERE p.vendor = 17 AND pov.productBarCode = '4902778914038';

select * from vegi.fulfilmentmethod where id = 33;
select * from vegi.address where id = 2;

SELECT 
	FROM_UNIXTIME(ROUND(t.updatedAt / 1000), '%Y %D %M %h:%i:%s %x') as UpdatedAtDate,
    CURRENT_TIMESTAMP() as ctime, UNIX_TIMESTAMP(CURRENT_TIMESTAMP()) as cUtime, 
    ROUND(t.updatedAt / 1000) as convTStamp,
	t.* 
    from vegi.user as t;
    
SELECT UNIX_TIMESTAMP(CURRENT_TIMESTAMP());
SELECT FROM_UNIXTIME(UNIX_TIMESTAMP(CURRENT_TIMESTAMP()), '%Y %D %M %h:%i:%s %x');

select * from vegi.productsuggestion;
select * from vegi.productsuggestionimage;

use vegi;
-- ALTER TABLE `vegi`.`account` 
-- ADD COLUMN `isVendor` tinyint(1) DEFAULT 0 AFTER `verified`
-- ;

SELECT * FROM `vegi`.`account`;
select * from vegi.vendor;





