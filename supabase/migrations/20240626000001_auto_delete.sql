-- Add trigger to set expires_at on message insert
CREATE OR REPLACE FUNCTION set_message_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Default: 24 hours if undelivered
  NEW.expires_at := NOW() + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_message_expiration
BEFORE INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION set_message_expiration();

-- Function to update expiration upon delivery
CREATE OR REPLACE FUNCTION update_message_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_delivered = TRUE AND OLD.is_delivered = FALSE THEN
    NEW.delivered_at := NOW();
    NEW.expires_at := NOW() + INTERVAL '1 hour';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_on_delivery
BEFORE UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION update_message_on_delivery();

-- Cron-like cleanup function (to be called by Supabase Cron or Edge Function)
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM messages WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
