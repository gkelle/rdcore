drop procedure if exists add_radstats;

delimiter //
create procedure add_radstats()
begin

if not exists (select * from information_schema.columns
    where table_name = 'radstats' and table_schema = DATABASE()) then  
    CREATE TABLE `radstats` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `hostname` varchar(255) NOT NULL DEFAULT '',
      `srvidentifier` varchar(255) NOT NULL DEFAULT '',
      `objidentifier` varchar(255) NOT NULL DEFAULT '',
      `objtype` varchar(255) NOT NULL,
      `requests` bigint(20) DEFAULT NULL,
      `responsetime`  decimal(12,6) DEFAULT NULL,
      `created` datetime DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    
end if;

end//

delimiter ;
call add_radstats;