import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Module-level singleton for serverless environments
// In serverless, each function invocation gets its own module scope,
// but we still want to avoid multiple instantiations within the same invocation
let supabaseAdminClient: SupabaseClient | null = null;

/**
 * Get Supabase admin client with service role key
 * Uses module-level singleton pattern optimized for serverless environments
 * This ensures one instance per function invocation (avoiding multiple instantiations)
 * 
 * This client bypasses Row Level Security (RLS) and should only be used server-side
 * Never expose the service role key to the client
 */
export function getSupabaseAdminClient(): SupabaseClient {
  // Return cached client if it exists (within same function invocation)
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  // Create new client instance
  supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // Serverless-optimized configuration
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'real-estate-app@serverless',
      },
    },
  });

  return supabaseAdminClient;
}
