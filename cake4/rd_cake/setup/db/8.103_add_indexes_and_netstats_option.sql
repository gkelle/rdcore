drop procedure if exists add_indexes_and_netstats_option;

delimiter //
create procedure add_indexes_and_netstats_option()
begin

IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'permanent_users'
      AND index_name = 'idx_username'
) THEN
    ALTER TABLE permanent_users ADD UNIQUE INDEX idx_username (username);
END IF;

IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'vouchers'
      AND index_name = 'idx_name'
) THEN
    ALTER TABLE vouchers ADD UNIQUE INDEX idx_name (name);
END IF;

IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'devices'
      AND index_name = 'idx_name'
) THEN
    ALTER TABLE devices ADD UNIQUE INDEX idx_name (name);
END IF;

if not exists (select * from information_schema.columns
    where column_name = 'collect_network_stats' and table_name = 'ap_profile_exits' and table_schema = DATABASE()) then
    alter table ap_profile_exits add column `collect_network_stats` BOOLEAN NOT NULL DEFAULT FALSE;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'collect_network_stats' and table_name = 'mesh_exits' and table_schema = DATABASE()) then
    alter table mesh_exits add column `collect_network_stats` BOOLEAN NOT NULL DEFAULT FALSE;
end if;


end//

delimiter ;
call add_indexes_and_netstats_option;
