drop procedure if exists add_wifi_station_columns;

delimiter //
create procedure add_wifi_station_columns()
begin

if not exists (select * from information_schema.columns
    where column_name = 'tx_mcs' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `tx_mcs` TINYINT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'tx_nss' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `tx_nss` TINYINT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'tx_short_gi' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `tx_short_gi` BOOLEAN DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'tx_mhz' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `tx_mhz` SMALLINT DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'tx_phy' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `tx_phy` ENUM('legacy','ht','vht','he','eht') DEFAULT 'legacy';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'rx_mcs' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `rx_mcs` TINYINT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'rx_short_gi' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `rx_short_gi` BOOLEAN DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'rx_mhz' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `rx_mhz` SMALLINT DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'rx_phy' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `rx_phy` ENUM('legacy','ht','vht','he','eht') DEFAULT 'legacy';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'noise' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `noise` INT DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'connected_time' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `connected_time` INT DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'vlan' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `vlan` TINYINT DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'wme' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `wme` BOOLEAN DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'mfp' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `mfp` BOOLEAN DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'tdls' and table_name = 'ap_stations' and table_schema = 'rd') then
    alter table ap_stations add column `tdls` BOOLEAN DEFAULT NULL;
end if;


end//

delimiter ;
call add_wifi_station_columns;