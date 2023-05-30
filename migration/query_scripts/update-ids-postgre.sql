-- Find_syntax ([A-Za-z_]+)(\n?)
-- Replace_syntxt alter table "$1" alter "id" add generated always as identity;\nselect setval(pg_get_serial_sequence('$1', 'id'), max("id")) from "$1";\n\n

-- select table_name from information_schema.tables
-- where table_schema = 'public'
-- order by table_name;

alter table discount alter id add generated always as identity;
select setval(pg_get_serial_sequence('discount', 'id'), max(id)) from discount;


alter table "account" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('account', 'id'), max("id")) from "account";

alter table "address" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('address', 'id'), max("id")) from "address";

alter table "archive" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('archive', 'id'), max("id")) from "archive";

alter table "categorygroup" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('categorygroup', 'id'), max("id")) from "categorygroup";

alter table "deliverypartner" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('deliverypartner', 'id'), max("id")) from "deliverypartner";

alter table "discount" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('discount', 'id'), max("id")) from "discount";

alter table "discount_orders__order_discounts" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('discount_orders__order_discounts', 'id'), max("id")) from "discount_orders__order_discounts";

alter table "escexplanation" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('escexplanation', 'id'), max("id")) from "escexplanation";

alter table "escrating" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('escrating', 'id'), max("id")) from "escrating";

alter table "escsource" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('escsource', 'id'), max("id")) from "escsource";

alter table "fulfilmentmethod" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('fulfilmentmethod', 'id'), max("id")) from "fulfilmentmethod";

alter table "like" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('like', 'id'), max("id")) from "like";

alter table "notification" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('notification', 'id'), max("id")) from "notification";

alter table "openinghours" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('openinghours', 'id'), max("id")) from "openinghours";

alter table "order" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('order', 'id'), max("id")) from "order";

alter table "orderitem" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('orderitem', 'id'), max("id")) from "orderitem";

alter table "orderitemoptionvalue" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('orderitemoptionvalue', 'id'), max("id")) from "orderitemoptionvalue";

alter table "postaldistrict" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('postaldistrict', 'id'), max("id")) from "postaldistrict";

alter table "postaldistrict_vendors__vendor_fulfilmentPostalDistricts" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('postaldistrict_vendors__vendor_fulfilmentPostalDistricts', 'id'), max("id")) from "postaldistrict_vendors__vendor_fulfilmentPostalDistricts";

alter table "product" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('product', 'id'), max("id")) from "product";

alter table "productcategory" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('productcategory', 'id'), max("id")) from "productcategory";

alter table "productoption" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('productoption', 'id'), max("id")) from "productoption";

alter table "productoptionvalue" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('productoptionvalue', 'id'), max("id")) from "productoptionvalue";

alter table "productsuggestion" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('productsuggestion', 'id'), max("id")) from "productsuggestion";

alter table "productsuggestionimage" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('productsuggestionimage', 'id'), max("id")) from "productsuggestionimage";

alter table "refund" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('refund', 'id'), max("id")) from "refund";

alter table "survey" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('survey', 'id'), max("id")) from "survey";

alter table "tablename" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('tablename', 'id'), max("id")) from "tablename";

alter table "transaction" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('transaction', 'id'), max("id")) from "transaction";

alter table "user" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('user', 'id'), max("id")) from "user";

alter table "vendor" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('vendor', 'id'), max("id")) from "vendor";

alter table "vendor_vendorCategories__vendorcategory_vendors" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('vendor_vendorCategories__vendorcategory_vendors', 'id'), max("id")) from "vendor_vendorCategories__vendorcategory_vendors";

alter table "vendorcategory" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('vendorcategory', 'id'), max("id")) from "vendorcategory";

alter table "waitinglist" alter "id" add generated always as identity;
select setval(pg_get_serial_sequence('waitinglist', 'id'), max("id")) from "waitinglist";

