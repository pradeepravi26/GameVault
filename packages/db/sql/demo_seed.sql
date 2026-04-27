USE game_vault;

-- ---------------------------------------------------------------------------
-- Demo seed: users, reviews (stars + text), collections, games-in-collection,
-- and collection likes. Intended to run after schema + advanced + metadata_seed.
--
-- Login: seeded accounts below, password: password123
-- (same scrypt format as apps/api: salt:hex(scrypt(password, salt, 64))).
--
-- Re-runnable: removes prior rows for these usernames first.
-- ---------------------------------------------------------------------------

DELETE cg
FROM collection_games cg
    INNER JOIN collections c ON c.collection_id = cg.collection_id
    INNER JOIN users u ON u.user_id = c.user_id
WHERE
    u.username IN (
        'morgan_ellis',
        'riley_chen',
        'jordan_brooks',
        'casey_nguyen',
        'taylor_reed',
        'avery_patel',
        'quinn_murphy',
        'skylar_foster',
        'reese_okonkwo',
        'cameron_dsouza'
    );

DELETE cl
FROM collection_likes cl
    INNER JOIN collections c ON c.collection_id = cl.collection_id
    INNER JOIN users u ON u.user_id = c.user_id
WHERE
    u.username IN (
        'morgan_ellis',
        'riley_chen',
        'jordan_brooks',
        'casey_nguyen',
        'taylor_reed',
        'avery_patel',
        'quinn_murphy',
        'skylar_foster',
        'reese_okonkwo',
        'cameron_dsouza'
    );

DELETE cl
FROM collection_likes cl
    INNER JOIN users u ON u.user_id = cl.user_id
WHERE
    u.username IN (
        'morgan_ellis',
        'riley_chen',
        'jordan_brooks',
        'casey_nguyen',
        'taylor_reed',
        'avery_patel',
        'quinn_murphy',
        'skylar_foster',
        'reese_okonkwo',
        'cameron_dsouza'
    );

DELETE c
FROM collections c
    INNER JOIN users u ON u.user_id = c.user_id
WHERE
    u.username IN (
        'morgan_ellis',
        'riley_chen',
        'jordan_brooks',
        'casey_nguyen',
        'taylor_reed',
        'avery_patel',
        'quinn_murphy',
        'skylar_foster',
        'reese_okonkwo',
        'cameron_dsouza'
    );

DELETE r
FROM ratings r
    INNER JOIN users u ON u.user_id = r.user_id
WHERE
    u.username IN (
        'morgan_ellis',
        'riley_chen',
        'jordan_brooks',
        'casey_nguyen',
        'taylor_reed',
        'avery_patel',
        'quinn_murphy',
        'skylar_foster',
        'reese_okonkwo',
        'cameron_dsouza'
    );

DELETE FROM users
WHERE
    username IN (
        'morgan_ellis',
        'riley_chen',
        'jordan_brooks',
        'casey_nguyen',
        'taylor_reed',
        'avery_patel',
        'quinn_murphy',
        'skylar_foster',
        'reese_okonkwo',
        'cameron_dsouza'
    );

-- Shared password hash for password123 (see apps/api/src/lib/auth.ts)
INSERT INTO
    users (username, password_hash, first_name, last_name)
VALUES
    (
        'morgan_ellis',
        'e117cb0ecf31263e62c8c6c49eeb2580:9499d1b7fefb6e7dfdcfdf1106a229ddeb682f98973afa7060c163e980e210feefef2ec2cae7afe52e5ee8e410270d9f53a5ccae3d6b841c8d3275a2f77802e0',
        'Morgan',
        'Ellis'
    ),
    (
        'riley_chen',
        'e117cb0ecf31263e62c8c6c49eeb2580:9499d1b7fefb6e7dfdcfdf1106a229ddeb682f98973afa7060c163e980e210feefef2ec2cae7afe52e5ee8e410270d9f53a5ccae3d6b841c8d3275a2f77802e0',
        'Riley',
        'Chen'
    ),
    (
        'jordan_brooks',
        'e117cb0ecf31263e62c8c6c49eeb2580:9499d1b7fefb6e7dfdcfdf1106a229ddeb682f98973afa7060c163e980e210feefef2ec2cae7afe52e5ee8e410270d9f53a5ccae3d6b841c8d3275a2f77802e0',
        'Jordan',
        'Brooks'
    ),
    (
        'casey_nguyen',
        'e117cb0ecf31263e62c8c6c49eeb2580:9499d1b7fefb6e7dfdcfdf1106a229ddeb682f98973afa7060c163e980e210feefef2ec2cae7afe52e5ee8e410270d9f53a5ccae3d6b841c8d3275a2f77802e0',
        'Casey',
        'Nguyen'
    ),
    (
        'taylor_reed',
        'e117cb0ecf31263e62c8c6c49eeb2580:9499d1b7fefb6e7dfdcfdf1106a229ddeb682f98973afa7060c163e980e210feefef2ec2cae7afe52e5ee8e410270d9f53a5ccae3d6b841c8d3275a2f77802e0',
        'Taylor',
        'Reed'
    ),
    (
        'avery_patel',
        'e117cb0ecf31263e62c8c6c49eeb2580:9499d1b7fefb6e7dfdcfdf1106a229ddeb682f98973afa7060c163e980e210feefef2ec2cae7afe52e5ee8e410270d9f53a5ccae3d6b841c8d3275a2f77802e0',
        'Avery',
        'Patel'
    ),
    (
        'quinn_murphy',
        'e117cb0ecf31263e62c8c6c49eeb2580:9499d1b7fefb6e7dfdcfdf1106a229ddeb682f98973afa7060c163e980e210feefef2ec2cae7afe52e5ee8e410270d9f53a5ccae3d6b841c8d3275a2f77802e0',
        'Quinn',
        'Murphy'
    ),
    (
        'skylar_foster',
        'e117cb0ecf31263e62c8c6c49eeb2580:9499d1b7fefb6e7dfdcfdf1106a229ddeb682f98973afa7060c163e980e210feefef2ec2cae7afe52e5ee8e410270d9f53a5ccae3d6b841c8d3275a2f77802e0',
        'Skylar',
        'Foster'
    ),
    (
        'reese_okonkwo',
        'e117cb0ecf31263e62c8c6c49eeb2580:9499d1b7fefb6e7dfdcfdf1106a229ddeb682f98973afa7060c163e980e210feefef2ec2cae7afe52e5ee8e410270d9f53a5ccae3d6b841c8d3275a2f77802e0',
        'Reese',
        'Okonkwo'
    ),
    (
        'cameron_dsouza',
        'e117cb0ecf31263e62c8c6c49eeb2580:9499d1b7fefb6e7dfdcfdf1106a229ddeb682f98973afa7060c163e980e210feefef2ec2cae7afe52e5ee8e410270d9f53a5ccae3d6b841c8d3275a2f77802e0',
        'Cameron',
        'Dsouza'
    );

DROP PROCEDURE IF EXISTS seed_demo_collections;

DROP PROCEDURE IF EXISTS seed_demo_reviews;

DROP PROCEDURE IF EXISTS seed_demo_likes;

DELIMITER //

CREATE PROCEDURE seed_demo_collections ()
BEGIN
    DECLARE uid INT;

    DECLARE uname VARCHAR(50);

    DECLARE digit INT;

    DECLARE cid INT;

    DECLARE i INT;

    DECLARE g INT;

    DECLARE max_game INT;

    DECLARE done INT DEFAULT FALSE;

    DECLARE ucur CURSOR FOR
        SELECT
            user_id,
            username
        FROM users
        WHERE
            username IN (
                'morgan_ellis',
                'riley_chen',
                'jordan_brooks',
                'casey_nguyen',
                'taylor_reed',
                'avery_patel',
                'quinn_murphy',
                'skylar_foster',
                'reese_okonkwo',
                'cameron_dsouza'
            )
        ORDER BY
            username;

    DECLARE CONTINUE HANDLER FOR NOT FOUND
        SET done = TRUE;

    SELECT
        COALESCE(MAX(game_id), 1) INTO max_game
    FROM games;

    OPEN ucur;

    user_loop: LOOP
        FETCH ucur INTO uid, uname;

        IF done THEN
            LEAVE user_loop;
        END IF;

        SET digit = CASE uname
            WHEN 'morgan_ellis' THEN 0
            WHEN 'riley_chen' THEN 1
            WHEN 'jordan_brooks' THEN 2
            WHEN 'casey_nguyen' THEN 3
            WHEN 'taylor_reed' THEN 4
            WHEN 'avery_patel' THEN 5
            WHEN 'quinn_murphy' THEN 6
            WHEN 'skylar_foster' THEN 7
            WHEN 'reese_okonkwo' THEN 8
            WHEN 'cameron_dsouza' THEN 9
        END;

        INSERT INTO
            collections (collection_name, user_id)
        VALUES
            (CONCAT(uname, ' - Backlog'), uid);

        SET cid = LAST_INSERT_ID();

        SET i = 1;

        WHILE i <= 20 DO
            SET g = LEAST(max_game, GREATEST(1, digit * 88 + i));

            INSERT IGNORE INTO
                collection_games (collection_id, game_id)
            VALUES
                (cid, g);

            SET i = i + 1;
        END WHILE;

        INSERT INTO
            collections (collection_name, user_id)
        VALUES
            (CONCAT(uname, ' - Favorites'), uid);

        SET cid = LAST_INSERT_ID();

        SET i = 1;

        WHILE i <= 14 DO
            SET g = LEAST(max_game, GREATEST(1, digit * 88 + i + 400));

            INSERT IGNORE INTO
                collection_games (collection_id, game_id)
            VALUES
                (cid, g);

            SET i = i + 1;
        END WHILE;
    END LOOP;

    CLOSE ucur;
END //

CREATE PROCEDURE seed_demo_reviews ()
BEGIN
    DECLARE g INT DEFAULT 1;

    DECLARE max_game INT;

    DECLARE reviewer INT;

    DECLARE score DECIMAL(3, 1);

    -- Use a numeric loop, not a cursor + NOT FOUND handler. MySQL propagates
    -- NOT FOUND from SELECT ... INTO inside add_or_update_rating (no prior
    -- rating row) to the caller's CONTINUE HANDLER, which stopped this
    -- procedure after the first game.
    SELECT
        COALESCE(MAX(game_id), 0) INTO max_game
    FROM games;

    WHILE g <= max_game DO
        SELECT
            user_id INTO reviewer
        FROM users
        WHERE
            username = CASE (g MOD 10)
                WHEN 0 THEN 'morgan_ellis'
                WHEN 1 THEN 'riley_chen'
                WHEN 2 THEN 'jordan_brooks'
                WHEN 3 THEN 'casey_nguyen'
                WHEN 4 THEN 'taylor_reed'
                WHEN 5 THEN 'avery_patel'
                WHEN 6 THEN 'quinn_murphy'
                WHEN 7 THEN 'skylar_foster'
                WHEN 8 THEN 'reese_okonkwo'
                WHEN 9 THEN 'cameron_dsouza'
            END
        LIMIT
            1;

        SET score = LEAST(10.0, 6.0 + (g MOD 41) / 10.0);

        CALL add_or_update_rating(
            reviewer,
            g,
            score,
            CONCAT(
                'Seeded demo review for game ',
                g,
                '. Useful for browsing the catalog, collections, and review UI.'
            ),
            FALSE
        );

        SET g = g + 1;
    END WHILE;
END //

CREATE PROCEDURE seed_demo_likes ()
BEGIN
    DECLARE cid INT;

    DECLARE owner_uid INT;

    DECLARE done INT DEFAULT FALSE;

    DECLARE ccur CURSOR FOR
        SELECT
            c.collection_id,
            c.user_id
        FROM collections c
            INNER JOIN users u ON u.user_id = c.user_id
        WHERE
            u.username IN (
                'morgan_ellis',
                'riley_chen',
                'jordan_brooks',
                'casey_nguyen',
                'taylor_reed',
                'avery_patel',
                'quinn_murphy',
                'skylar_foster',
                'reese_okonkwo',
                'cameron_dsouza'
            );

    DECLARE CONTINUE HANDLER FOR NOT FOUND
        SET done = TRUE;

    OPEN ccur;

    like_loop: LOOP
        FETCH ccur INTO cid, owner_uid;

        IF done THEN
            LEAVE like_loop;
        END IF;

        INSERT IGNORE INTO collection_likes (collection_id, user_id)
        SELECT
            cid,
            u.user_id
        FROM users u
        WHERE
            u.username IN (
                'morgan_ellis',
                'riley_chen',
                'jordan_brooks',
                'casey_nguyen',
                'taylor_reed',
                'avery_patel',
                'quinn_murphy',
                'skylar_foster',
                'reese_okonkwo',
                'cameron_dsouza'
            )
            AND u.user_id <> owner_uid
        ORDER BY
            u.user_id
        LIMIT
            4;
    END LOOP;

    CLOSE ccur;
END //

DELIMITER ;

CALL seed_demo_collections();

CALL seed_demo_reviews();

CALL seed_demo_likes();

DROP PROCEDURE seed_demo_collections;

DROP PROCEDURE seed_demo_reviews;

DROP PROCEDURE seed_demo_likes;
