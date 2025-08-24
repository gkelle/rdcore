drop procedure if exists add_admin_permissions;

delimiter //
create procedure add_admin_permissions()
begin

if not exists (select * from information_schema.columns
    where column_name = 'permissions' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `permissions` enum('admin','view','granular') DEFAULT 'admin';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'cloud_wide' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `cloud_wide` tinyint(1) NOT NULL DEFAULT '1';
end if;


if not exists (select * from information_schema.columns
    where column_name = 'cmp_permanent_users' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `cmp_permanent_users` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'cmp_vouchers' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `cmp_vouchers` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'cmp_dynamic_clients' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `cmp_dynamic_clients` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'cmp_nas' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `cmp_nas` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'cmp_profiles' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `cmp_profiles` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'cmp_realms' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `cmp_realms` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'cmp_meshes' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `cmp_meshes` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'cmp_ap_profiles' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `cmp_ap_profiles` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'cmp_other' and table_name = 'cloud_admins' and table_schema = DATABASE()) then
    alter table cloud_admins add column `cmp_other` tinyint(1) NOT NULL DEFAULT '1';
end if;


if not exists (select * from information_schema.columns
    where table_name = 'realm_admins' and table_schema = DATABASE()) then
        CREATE TABLE `realm_admins` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `realm_id` int(11) DEFAULT NULL,
          `user_id` int(11) DEFAULT NULL,
          `created` datetime NOT NULL,
          `modified` datetime NOT NULL,
          `permissions` enum('admin','view','granular') DEFAULT 'admin',
          PRIMARY KEY (`id`)
        );
end if;


end//

delimiter ;
call add_admin_permissions;

