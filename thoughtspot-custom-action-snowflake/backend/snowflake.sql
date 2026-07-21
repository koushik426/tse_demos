-- Landing table for ThoughtSpot custom-action payloads.
-- Schema-flexible: the VARIANT column accepts any column set the answer
-- produces, so no DDL changes are needed when the answer changes.
--
-- Adjust database/schema to match your .env (SF_DATABASE / SF_SCHEMA).

CREATE TABLE IF NOT EXISTS TS_CUSTOM_ACTION_EVENTS (
  ACTION_ID    STRING,
  PAYLOAD      VARIANT,
  CAPTURED_AT  TIMESTAMP_NTZ
);

-- Example: query the flattened rows back out.
--   SELECT
--     ACTION_ID,
--     CAPTURED_AT,
--     f.key   AS column_name,
--     f.value AS column_value
--   FROM TS_CUSTOM_ACTION_EVENTS,
--        LATERAL FLATTEN(input => PAYLOAD) f
--   ORDER BY CAPTURED_AT DESC;

-- ---------------------------------------------------------------------------
-- Alternative: strongly-typed table (uncomment + map columns in server.js).
-- CREATE TABLE IF NOT EXISTS TS_CUSTOM_ACTION_EVENTS_TYPED (
--   ACTION_ID    STRING,
--   ACCOUNT      STRING,
--   CADENCE      STRING,
--   -- ...one column per expected field...
--   CAPTURED_AT  TIMESTAMP_NTZ
-- );
