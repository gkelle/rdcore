drop procedure if exists split_accounting;


delimiter //
create procedure split_accounting()
begin

-- Declare variables at the beginning
DECLARE index_exists INT DEFAULT 0;


if not exists (select * from information_schema.columns
    where table_name = 'radacct_history' and table_schema = DATABASE()) then

    CREATE TABLE radacct_history LIKE radacct;
    INSERT INTO radacct_history SELECT * FROM radacct;

end if;

SELECT COUNT(*)INTO index_exists FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'radacct_history' AND index_name = 'acctuniqueid';

-- If the index exists, drop it
IF index_exists > 0 THEN
    ALTER TABLE radacct_history DROP INDEX acctuniqueid;
END IF;


end//

delimiter ;
call split_accounting;


DELIMITER //

--We added to the trigger in 8.090_add_radacct_triggers.sql the action where if acctstoptime changes from NULL to a date it will be written into the radacct_history table

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS cleanup_radacct
ON SCHEDULE EVERY 1 HOUR
STARTS '2025-01-09 00:00:00'
DO
BEGIN
    DELETE FROM radacct
    WHERE acctstoptime IS NOT NULL;
END//
