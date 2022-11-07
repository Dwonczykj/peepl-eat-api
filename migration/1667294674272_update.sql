SET sql_safe_updates=0;
update `vegi`.`product` set 
	status = 'active'
where 
	status is null;
SET sql_safe_updates=1;

SET sql_safe_updates=0;
update `vegi`.`deliverypartner` set 
	type = ''
where 
	type is null;

update `vegi`.`deliverypartner` set 
	description = ''
where 
	description is null;

update `vegi`.`deliverypartner` set 
	walletAddress = ''
where 
	walletAddress is null;

update `vegi`.`deliverypartner` set 
	imageUrl = ''
where 
	imageUrl is null;
	
update `vegi`.`openinghours` set 
	logicId = ''
where 
	logicId is null;

update `vegi`.`order` set 
	deliveryAddressCity = ''
where 
	deliveryAddressCity is null;

update `vegi`.`order` set 
	deliveryId = ''
where 
	deliveryId is null;

update `vegi`.`order` set 
	completedFlag = ''
where 
	completedFlag is null;

update `vegi`.`order` set 
	completedOrderFeedback = ''
where 
	completedOrderFeedback is null;

update `vegi`.`user` set 
	vendorRole = 'none'
where 
	vendorRole is null;

update `vegi`.`user` set 
	deliveryPartnerRole = 'none'
where 
	deliveryPartnerRole is null;

update `vegi`.`user` set 
	fbUid = ''
where 
	fbUid is null;

update `vegi`.`user` set 
	firebaseSessionToken = ''
where 
	firebaseSessionToken is null;
update `vegi`.`user` set 
	secret = ''
where 
	secret is null;

SET sql_safe_updates=1;