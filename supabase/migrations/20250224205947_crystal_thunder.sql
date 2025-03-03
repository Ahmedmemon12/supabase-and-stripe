/*
  # Delete all users and related data

  This migration safely removes all users and their related data through cascading deletes.
  The database structure remains intact.
*/

-- Delete all users which will cascade to related tables
DELETE FROM auth.users;

-- Reset the user_id sequence
ALTER SEQUENCE auth.users_id_seq RESTART;