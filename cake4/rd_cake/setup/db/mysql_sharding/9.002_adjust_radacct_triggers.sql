DROP TRIGGER IF EXISTS manage_user_stats_after_insert;

-- Check if the 'manage_user_stats_after_insert' trigger exists, and create it if it doesn't
DELIMITER //

CREATE TRIGGER manage_user_stats_after_insert
AFTER INSERT ON radacct
FOR EACH ROW
BEGIN
    DECLARE latest_user_stats_id INT;
    DECLARE creation_time_difference INT;
    DECLARE new_acctinputoctets BIGINT DEFAULT 0;
    DECLARE new_acctoutputoctets BIGINT DEFAULT 0;
    -- 30 minute slots
    DECLARE stats_interval INT DEFAULT 30;

    -- Calculate new data
    SET new_acctinputoctets  = NEW.acctinputoctets;
    SET new_acctoutputoctets = NEW.acctoutputoctets;

    -- Find the latest entry in user_stats for the given radacct_id
    SELECT id, TIMESTAMPDIFF(MINUTE, created, NOW())
    INTO latest_user_stats_id, creation_time_difference
    FROM user_stats
    WHERE radacct_id = NEW.radacctid AND group_id = NEW.group_id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- There is no latest_user_stats add it
    IF latest_user_stats_id IS NULL THEN
        INSERT INTO user_stats (
            radacct_id,
            username,
            realm,
            nasipaddress,
            nasidentifier,
            framedipaddress,
            callingstationid,
            timestamp,
            created,
            acctinputoctets,
            acctoutputoctets,
            groupname,
            group_id
        )
        VALUES (
            NEW.radacctid,
            NEW.username,
            NEW.realm,
            NEW.nasipaddress,
            NEW.nasidentifier,
            NEW.framedipaddress,
            NEW.callingstationid,
            NOW(),
            NOW(),
            new_acctinputoctets,
            new_acctoutputoctets,
            NEW.groupname,
            NEW.group_id
        );   
    END IF;

    IF latest_user_stats_id IS NOT NULL AND creation_time_difference <= stats_interval THEN   
        -- Update the existing entry if it's within stats_interval minutes of creation
        UPDATE user_stats
        SET acctinputoctets = acctinputoctets + (new_acctinputoctets - (SELECT SUM(acctinputoctets) FROM user_stats WHERE radacct_id = NEW.radacctid AND group_id = NEW.group_id)),
            acctoutputoctets = acctoutputoctets + (new_acctoutputoctets - (SELECT SUM(acctoutputoctets) FROM user_stats WHERE radacct_id = NEW.radacctid AND group_id = NEW.group_id)),
            timestamp = NOW()
        WHERE id = latest_user_stats_id;        
    END IF;
    
    IF latest_user_stats_id IS NOT NULL AND creation_time_difference > stats_interval THEN 
    
        SET new_acctinputoctets  = new_acctinputoctets - (SELECT SUM(acctinputoctets) FROM user_stats WHERE radacct_id = NEW.radacctid AND group_id = NEW.group_id);
        SET new_acctoutputoctets = new_acctoutputoctets - (SELECT SUM(acctoutputoctets) FROM user_stats WHERE radacct_id = NEW.radacctid AND group_id = NEW.group_id);
      
        INSERT INTO user_stats (
            radacct_id,
            username,
            realm,
            nasipaddress,
            nasidentifier,
            framedipaddress,
            callingstationid,
            timestamp,
            created,
            acctinputoctets,
            acctoutputoctets,
            groupname,
            group_id
        )
        VALUES (
            NEW.radacctid,
            NEW.username,
            NEW.realm,
            NEW.nasipaddress,
            NEW.nasidentifier,
            NEW.framedipaddress,
            NEW.callingstationid,
            NOW(),
            NOW(),
            new_acctinputoctets,
            new_acctoutputoctets,
            NEW.groupname,
            NEW.group_id
        );    
    END IF;
       
END //

DELIMITER ;


DROP TRIGGER IF EXISTS manage_user_stats_after_update;

-- Check if the 'manage_user_stats_after_update' trigger exists, and create it if it doesn't
DELIMITER //

CREATE TRIGGER manage_user_stats_after_update
AFTER UPDATE ON radacct
FOR EACH ROW
BEGIN
    DECLARE latest_user_stats_id INT;
    DECLARE creation_time_difference INT;
    DECLARE updated_acctinputoctets BIGINT DEFAULT 0;
    DECLARE updated_acctoutputoctets BIGINT DEFAULT 0;
    -- 30 minute slots
    DECLARE stats_interval INT DEFAULT 30;

    -- Calculate updated data
    SET updated_acctinputoctets = NEW.acctinputoctets;
    SET updated_acctoutputoctets = NEW.acctoutputoctets;

    -- Find the latest entry in user_stats for the given radacct_id
    SELECT id, TIMESTAMPDIFF(MINUTE, created, NOW())
    INTO latest_user_stats_id, creation_time_difference
    FROM user_stats
    WHERE radacct_id = NEW.radacctid AND group_id = NEW.group_id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    IF latest_user_stats_id IS NULL THEN
        INSERT INTO user_stats (
            radacct_id,
            username,
            realm,
            nasipaddress,
            nasidentifier,
            framedipaddress,
            callingstationid,
            timestamp,
            created,
            acctinputoctets,
            acctoutputoctets,
            groupname,
            group_id
        )
        VALUES (
            NEW.radacctid,
            NEW.username,
            NEW.realm,
            NEW.nasipaddress,
            NEW.nasidentifier,
            NEW.framedipaddress,
            NEW.callingstationid,
            NOW(),
            NOW(),
            updated_acctinputoctets,
            updated_acctoutputoctets,
            NEW.groupname,
            NEW.group_id
        );
    
    END IF;

    IF latest_user_stats_id IS NOT NULL AND creation_time_difference <= stats_interval THEN 

        -- Update the existing entry if it's within 10 minutes of creation
        UPDATE user_stats
        SET acctinputoctets = acctinputoctets + (updated_acctinputoctets - (SELECT SUM(acctinputoctets) FROM user_stats WHERE radacct_id = NEW.radacctid AND group_id = NEW.group_id)),
            acctoutputoctets = acctoutputoctets + (updated_acctoutputoctets - (SELECT SUM(acctoutputoctets) FROM user_stats WHERE radacct_id = NEW.radacctid AND group_id = NEW.group_id)),
            timestamp = NOW()
        WHERE id = latest_user_stats_id;
        
    END IF;
    
    IF latest_user_stats_id IS NOT NULL AND creation_time_difference > stats_interval THEN
    
        SET updated_acctinputoctets  = updated_acctinputoctets - (SELECT SUM(acctinputoctets) FROM user_stats WHERE radacct_id = NEW.radacctid AND group_id = NEW.group_id);
        SET updated_acctoutputoctets = updated_acctoutputoctets - (SELECT SUM(acctoutputoctets) FROM user_stats WHERE radacct_id = NEW.radacctid AND group_id = NEW.group_id); 

        -- Create a new entry if the last one is older than 10 minutes from creation
        INSERT INTO user_stats (
            radacct_id,
            username,
            realm,
            nasipaddress,
            nasidentifier,
            framedipaddress,
            callingstationid,
            timestamp,
            created,
            acctinputoctets,
            acctoutputoctets,
            groupname,
            group_id
        )
        VALUES (
            NEW.radacctid,
            NEW.username,
            NEW.realm,
            NEW.nasipaddress,
            NEW.nasidentifier,
            NEW.framedipaddress,
            NEW.callingstationid,
            NOW(),
            NOW(),
            updated_acctinputoctets,
            updated_acctoutputoctets,
            NEW.groupname,
            NEW.group_id
        );
    END IF;

     -- Check if acctstoptime has changed from NULL to NOT NULL
    IF OLD.acctstoptime IS NULL AND NEW.acctstoptime IS NOT NULL THEN
        -- Insert the updated row into radacct_history
        INSERT INTO radacct_history 
        SELECT * FROM radacct WHERE radacctid = NEW.radacctid AND group_id = NEW.group_id;
    END IF;

END //
