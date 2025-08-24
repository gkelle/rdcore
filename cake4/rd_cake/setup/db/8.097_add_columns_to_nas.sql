drop procedure if exists add_columns_to_nas;

delimiter //
create procedure add_columns_to_nas()
begin

if not exists (select * from information_schema.columns
    where column_name = 'auth_port' and table_name = 'nas' and table_schema = DATABASE()) then
    alter table nas add column `auth_port` INT DEFAULT 1812 NOT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'acct_port' and table_name = 'nas' and table_schema = DATABASE()) then
    alter table nas add column `acct_port` INT DEFAULT 1813 NOT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'coa_port' and table_name = 'nas' and table_schema = DATABASE()) then
    alter table nas add column `coa_port` INT DEFAULT 3799 NOT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'retries' and table_name = 'nas' and table_schema = DATABASE()) then
    alter table nas add column `retries` INT DEFAULT 0 NOT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'timeout' and table_name = 'nas' and table_schema = DATABASE()) then
    alter table nas add column `timeout` INT DEFAULT 5 NOT NULL;
end if;

end//

delimiter ;
call add_columns_to_nas;