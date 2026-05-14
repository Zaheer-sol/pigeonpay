import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up database schema...');

  try {
    // Create OTP Sessions table
    await supabase.from('otp_sessions').select('id').limit(1);
    console.log('✓ otp_sessions table already exists');
  } catch (error: any) {
    if (error.message?.includes('does not exist')) {
      console.log('Creating otp_sessions table...');
      const { error: createError } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS otp_sessions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id text NOT NULL UNIQUE,
            phone text NOT NULL,
            otp text NOT NULL,
            expires_at timestamptz NOT NULL,
            created_at timestamptz DEFAULT now()
          );

          ALTER TABLE otp_sessions ENABLE ROW LEVEL SECURITY;

          CREATE POLICY IF NOT EXISTS "Anyone can create OTP sessions"
            ON otp_sessions FOR INSERT
            WITH CHECK (true);

          CREATE POLICY IF NOT EXISTS "Anyone can read OTP sessions"
            ON otp_sessions FOR SELECT
            USING (true);

          CREATE POLICY IF NOT EXISTS "Anyone can delete own OTP sessions"
            ON otp_sessions FOR DELETE
            USING (true);
        `
      });

      if (createError) {
        console.error('Error creating table:', createError);
      } else {
        console.log('✓ otp_sessions table created successfully');
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }

  console.log('Database setup complete!');
}

setupDatabase().catch(console.error);
