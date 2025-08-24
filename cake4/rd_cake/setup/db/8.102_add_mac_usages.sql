drop procedure if exists add_mac_usages;

delimiter //
create procedure add_mac_usages()
begin

if not exists (select * from information_schema.columns
    where table_name = 'mac_usages' and table_schema = DATABASE()) then  
    CREATE TABLE `mac_usages` (
      `id` int(10) NOT NULL AUTO_INCREMENT,
      `mac` varchar(17) NOT NULL,
      `username` varchar(255) NOT NULL DEFAULT '',
      `data_used` bigint(20) DEFAULT NULL,
      `data_cap` bigint(20) DEFAULT NULL,
      `time_used` int(12) DEFAULT NULL,
      `time_cap` int(12) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    
end if;


end//

delimiter ;
call add_mac_usages;
