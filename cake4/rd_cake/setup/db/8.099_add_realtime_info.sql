drop procedure if exists add_realtime_info;

delimiter //
create procedure add_realtime_info()
begin

if not exists (select * from information_schema.columns
    where table_name = 'mikrotik_pppoe_stats' and table_schema = DATABASE()) then
     CREATE TABLE `mikrotik_pppoe_stats` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `permanent_user_id` int(11) DEFAULT NULL,
        `mt_id` varchar(24) NOT NULL,
        `name` varchar(255) NOT NULL,
        `mtu` INT UNSIGNED DEFAULT 0,
        `actual_mtu` INT UNSIGNED DEFAULT 0,
        `last_link_up_time` varchar(64) NOT NULL,
        `link_downs` INT UNSIGNED DEFAULT 0, 
        `rx_byte` BIGINT UNSIGNED DEFAULT 0,
        `tx_byte` BIGINT UNSIGNED DEFAULT 0,
        `rx_packet` BIGINT UNSIGNED DEFAULT 0,
        `tx_packet` BIGINT UNSIGNED DEFAULT 0,
        `rx_drop` INT UNSIGNED DEFAULT 0, 
        `tx_drop` INT UNSIGNED DEFAULT 0, 
        `tx_queue_drop` INT UNSIGNED DEFAULT 0, 
        `rx_error` INT UNSIGNED DEFAULT 0, 
        `tx_error` INT UNSIGNED DEFAULT 0,  
        `fp_rx_byte` BIGINT UNSIGNED DEFAULT 0,
        `fp_tx_byte` BIGINT UNSIGNED DEFAULT 0,
        `fp_rx_packet` BIGINT UNSIGNED DEFAULT 0,
        `fp_tx_packet` BIGINT UNSIGNED DEFAULT 0,
        `dynamic` tinyint(1) NOT NULL DEFAULT 1,
        `running` tinyint(1) NOT NULL DEFAULT 1,
        `disabled`tinyint(1) NOT NULL DEFAULT 0,
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;


end//

delimiter ;

call add_realtime_info;
