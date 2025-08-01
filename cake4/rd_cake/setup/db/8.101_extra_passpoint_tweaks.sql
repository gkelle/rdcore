drop procedure if exists extra_passpoint_tweaks;

delimiter //
create procedure extra_passpoint_tweaks()
begin

if not exists (select * from information_schema.columns
    where column_name = 'passpoint_profile_id' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `passpoint_profile_id` int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'passpoint_profile_id' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `passpoint_profile_id` int(11) DEFAULT NULL;
end if;


end//

delimiter ;
call extra_passpoint_tweaks;
