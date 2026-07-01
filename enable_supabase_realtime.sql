-- Supabase Realtime replication configuration script
-- 
-- Copy and run these SQL statements in your Supabase Console SQL Editor
-- to enable real-time socket broadcasts for notifications and gate scan syncs.

-- 1. Enable Realtime for the 'notifications' table
-- This allows users to receive live toast alerts and sound signals on new notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 2. Enable Realtime for the 'attendance' table
-- This allows multiple gate coordinators to sync attendance counts dynamically
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
