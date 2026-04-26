USE game_vault;

DROP PROCEDURE IF EXISTS add_or_update_rating;

DELIMITER //

CREATE PROCEDURE add_or_update_rating (
    IN p_user_id INT,
    IN p_game_id INT,
    IN p_score DECIMAL(3, 1),
    IN p_review_body TEXT,
    IN p_is_spoiler BOOLEAN
)
BEGIN
    DECLARE v_rating_id INT;

    -- if score and review text are not provided, then error
    IF p_score IS NULL AND (p_review_body IS NULL OR TRIM(p_review_body) = '') THEN
        SIGNAL SQLSTATE '45000' -- signal custom error
            SET MESSAGE_TEXT = 'rating must include numeric score and/or review text';
    END IF;

    -- check if user already has a rating for this game
    SELECT rating_id
    INTO v_rating_id
    FROM ratings
    WHERE user_id = p_user_id
      AND game_id = p_game_id;

    IF v_rating_id IS NULL THEN
        -- if no existing rating, create it
        INSERT INTO ratings (user_id, game_id)
        VALUES (p_user_id, p_game_id);

        SET v_rating_id = LAST_INSERT_ID();
    ELSE
        -- if rating already exists, update timestamp
        UPDATE ratings
        SET posted_at = CURRENT_TIMESTAMP
        WHERE rating_id = v_rating_id;
    END IF;

    -- if score was provided, insert/update it
    IF p_score IS NOT NULL THEN
        INSERT INTO numeric_scores (rating_id, score)
        VALUES (v_rating_id, p_score)
        ON DUPLICATE KEY UPDATE score = VALUES(score);
    END IF;

    -- if review text was provided, insert/update it
    IF p_review_body IS NOT NULL AND TRIM(p_review_body) <> '' THEN
        INSERT INTO review_texts (rating_id, review_body, is_spoiler)
        VALUES (
            v_rating_id,
            p_review_body,
            COALESCE(p_is_spoiler, FALSE)
        )
        ON DUPLICATE KEY UPDATE
            review_body = VALUES(review_body),
            is_spoiler = VALUES(is_spoiler);
    END IF;
END //

DELIMITER ;

-- Example procedure call
-- CALL add_or_update_rating(
--     2,
--     36,
--     9.0,
--     'Excellent world design and challenging combat.',
--     FALSE
-- );
