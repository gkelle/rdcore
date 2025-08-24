drop procedure if exists multiwan_stats;
drop procedure if exists InsertWanTrafficStats;

delimiter //
create procedure multiwan_stats()
begin


if not exists (select * from information_schema.columns
    where table_name = 'wan_traffic_stats' and table_schema = DATABASE()) then

    CREATE TABLE wan_traffic_stats (
        id int(11) NOT NULL AUTO_INCREMENT,
        ap_id int(11) DEFAULT NULL,
        node_id int(11) DEFAULT NULL,
        mwan_interface_id int(11) DEFAULT NULL,
        ipv4_mask INT DEFAULT NULL,             -- Allows NULL
        ipv4_address VARCHAR(45) DEFAULT NULL,  -- Supports IPv6 addresses
        ipv6_mask INT DEFAULT NULL,             -- Allows NULL
        ipv6_address VARCHAR(45) DEFAULT NULL,  -- Supports IPv6 addresses
        tx_bytes BIGINT NOT NULL,           -- Raw transmitted bytes from the device
        rx_bytes BIGINT NOT NULL,           -- Raw received bytes from the device
        delta_tx_bytes BIGINT NOT NULL,     -- Delta for transmitted bytes
        delta_rx_bytes BIGINT NOT NULL,     -- Delta for received bytes
        tx_packets BIGINT NOT NULL,         -- Raw transmitted packets from the device
        rx_packets BIGINT NOT NULL,         -- Raw received packets from the device
        delta_tx_packets BIGINT NOT NULL,   -- Delta for transmitted packets
        delta_rx_packets BIGINT NOT NULL,   -- Delta for received packets
        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    );

   

end if;

if not exists (select * from information_schema.columns
    where table_name = 'wan_lte_stats' and table_schema = DATABASE()) then

     CREATE TABLE wan_lte_stats (
        id int NOT NULL AUTO_INCREMENT,
        ap_id int DEFAULT NULL,
        node_id int DEFAULT NULL,
        mwan_interface_id int DEFAULT NULL,
        mcc int     DEFAULT NULL,
        mnc int     DEFAULT NULL,
        rsrp int    DEFAULT NULL,
        rsrq int    DEFAULT NULL,
        rssi int    DEFAULT NULL,
        snr int     DEFAULT NULL,
        type char(64) NOT NULL,
        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    );

end if;


if not exists (select * from information_schema.columns
    where table_name = 'wan_wifi_stats' and table_schema = DATABASE()) then

     CREATE TABLE wan_wifi_stats (
        id int NOT NULL AUTO_INCREMENT,
        ap_id int DEFAULT NULL,
        node_id int DEFAULT NULL,
        mwan_interface_id int DEFAULT NULL,
        rx_packets BIGINT NOT NULL,
        tx_packets BIGINT NOT NULL,
        `signal`  int DEFAULT NULL, 
        bitrate int DEFAULT NULL,
        txpower int DEFAULT NULL,
        tx_rate int DEFAULT NULL,
        channel int DEFAULT NULL,
        quality int DEFAULT NULL,
        rx_rate int DEFAULT NULL,
        noise   int DEFAULT NULL,
        ssid char(124) NOT NULL,
        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    );

end if;

if not exists (select * from information_schema.columns
    where table_name = 'wan_mwan3_status' and table_schema = DATABASE()) then
     CREATE TABLE wan_mwan3_status (
        id int NOT NULL AUTO_INCREMENT,
        ap_id int DEFAULT NULL,
        node_id int DEFAULT NULL,
        mwan3_status text NOT NULL,
        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    );

end if;

end//

DELIMITER $$

CREATE PROCEDURE InsertWanTrafficStats(
    IN in_ap_id INT,
    IN in_node_id INT,
    IN in_mwan_interface_id INT,
    IN in_ipv4_mask INT,             -- Allows NULL
    IN in_ipv4_address VARCHAR(45),  -- Supports IPv6 addresses
    IN in_ipv6_mask INT,             -- Allows NULL
    IN in_ipv6_address VARCHAR(45),  -- Supports IPv6 addresses
    IN in_tx_bytes BIGINT,
    IN in_rx_bytes BIGINT,
    IN in_tx_packets BIGINT,
    IN in_rx_packets BIGINT
)
BEGIN
    DECLARE prev_tx_bytes BIGINT;
    DECLARE prev_rx_bytes BIGINT;
    DECLARE prev_tx_packets BIGINT;
    DECLARE prev_rx_packets BIGINT;

    -- Fetch the most recent record for the given identifiers
    SELECT tx_bytes, rx_bytes, tx_packets, rx_packets 
    INTO prev_tx_bytes, prev_rx_bytes, prev_tx_packets, prev_rx_packets
    FROM wan_traffic_stats
    WHERE (ap_id = in_ap_id OR in_ap_id IS NULL)
      AND (node_id = in_node_id OR in_node_id IS NULL)
      AND mwan_interface_id = in_mwan_interface_id
    ORDER BY created DESC
    LIMIT 1;

    -- Handle resets (when current values are less than previous values)
    IF prev_tx_bytes IS NULL OR in_tx_bytes < prev_tx_bytes THEN
        -- Use the previous totals directly, and the deltas will reflect the raw values
        SET prev_tx_bytes = 0;
        SET prev_rx_bytes = 0;
        SET prev_tx_packets = 0;
        SET prev_rx_packets = 0;
    END IF;

    -- Insert the new record with calculated deltas and updated totals
    INSERT INTO wan_traffic_stats (
        ap_id,
        node_id,
        mwan_interface_id,
        ipv4_mask,
        ipv4_address,
        ipv6_mask,
        ipv6_address,
        tx_bytes,
        rx_bytes,
        delta_tx_bytes,
        delta_rx_bytes,
        tx_packets,
        rx_packets,
        delta_tx_packets,
        delta_rx_packets,
        created,
        modified
    ) VALUES (
        in_ap_id,
        in_node_id,
        in_mwan_interface_id,
        in_ipv4_mask,
        in_ipv4_address,
        in_ipv6_mask,
        in_ipv6_address,
        in_tx_bytes,
        in_rx_bytes,
        GREATEST(in_tx_bytes - prev_tx_bytes, 0),
        GREATEST(in_rx_bytes - prev_rx_bytes, 0),
        in_tx_packets,
        in_rx_packets,
        GREATEST(in_tx_packets - prev_tx_packets, 0),
        GREATEST(in_rx_packets - prev_rx_packets, 0),
        NOW(),
        NOW()
    );
END$$

DELIMITER ;


delimiter ;
call multiwan_stats;

DELIMITER //

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS trim_wan_stats
ON SCHEDULE EVERY 1 HOUR
STARTS '2024-11-22 00:00:00'
DO
BEGIN
    
    -- Delete wan_traffic_stats older than 2 hour
    DELETE FROM wan_traffic_stats
    WHERE created < NOW() - INTERVAL 2 HOUR;

    DELETE FROM wan_wifi_stats
    WHERE created < NOW() - INTERVAL 2 HOUR;

    DELETE FROM wan_lte_stats
    WHERE created < NOW() - INTERVAL 2 HOUR;

END//

DELIMITER ;



DELIMITER ;
