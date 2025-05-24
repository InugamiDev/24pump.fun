-- Insert default social causes
INSERT INTO "SocialCause" (id, name, description, "receivingWalletAddress", "isActive", "createdAt", "updatedAt")
VALUES 
  ('clicause1', 'Education', 'Supporting educational initiatives and student scholarships', 'ACKHmVRAbhMPiSJLCztUkuSrKSt6UwWR43RZmvEPXEKQ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clicause2', 'Environmental Conservation', 'Protecting nature and fighting climate change', 'BNx6MiKJhAecWXkwgfJ5k9FR5wZRE3zLxgAGxuTBfKVr', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clicause3', 'Healthcare Access', 'Improving access to quality healthcare services', 'CuLNJ9DdszEkUjCAeDY5jPGcqzyEg8dkMVWn4ovaDwXx', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);