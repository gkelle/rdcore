drop procedure if exists add_nlbw_stats;

delimiter //
create procedure add_nlbw_stats()
begin

if not exists (select * from information_schema.columns
    where table_name = 'nlbw_stats_ap' and table_schema = DATABASE()) then  
    CREATE TABLE nlbw_stats_ap (
      -- Keep AI first for performance, include `created` in PK to allow partitioning by created 
      id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      created    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      family     ENUM('4','6')   NOT NULL DEFAULT '4',
      proto      VARCHAR(8)      NOT NULL DEFAULT '',
      port       INT UNSIGNED    NOT NULL DEFAULT 0,
      mac        CHAR(17)        NOT NULL,             -- e.g. 'aa:bb:cc:dd:ee:ff'
      ip         VARCHAR(45)     NOT NULL,             -- IPv4/IPv6
      conns      BIGINT UNSIGNED NOT NULL DEFAULT 0,

      rx_bytes   BIGINT UNSIGNED NOT NULL DEFAULT 0,
      rx_pkts    BIGINT UNSIGNED NOT NULL DEFAULT 0,
      tx_bytes   BIGINT UNSIGNED NOT NULL DEFAULT 0,
      tx_pkts    BIGINT UNSIGNED NOT NULL DEFAULT 0,

      layer7     VARCHAR(255)    NOT NULL DEFAULT '',
      l3if       VARCHAR(16)     NOT NULL DEFAULT '',
      l3dev      VARCHAR(16)     NOT NULL DEFAULT '',
      exit_id    INT UNSIGNED    NOT NULL DEFAULT 0,
      exit_type  VARCHAR(16)     NOT NULL DEFAULT '',

      -- Primary key includes `created` so we can partition by `created` (MySQL requirement)
      PRIMARY KEY (id, created),

      -- Cover the “find previous row” lookup used by the trigger
      KEY ix_flow_key_created (family, mac, ip, proto, port, exit_id, layer7, id, created),

      -- Time filter
      KEY ix_created (created)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

end if;

end//

delimiter ;
call add_nlbw_stats;
