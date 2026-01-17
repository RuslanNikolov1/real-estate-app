import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Helper to create Supabase server client
async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
  return client;
}

// GET /api/reviews - Fetch reviews (approved for public, all for admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const status = searchParams.get('status') || 'approved';
    
    const offset = (page - 1) * limit;

    // Get current user
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    
    // Check if user is admin
    const isAdmin = user?.email === 'ruslannikolov1@gmail.com';

    // Build query - apply filters first, then order
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' });

    // Apply filters based on status and user role
    if (!isAdmin) {
      // Non-admin users can only see approved reviews
      query = query.eq('is_approved', true);
    } else {
      // Admin can filter by status
      if (status === 'approved') {
        query = query.eq('is_approved', true);
      } else if (status === 'pending') {
        query = query.eq('is_approved', false);
      }
      // 'all' means no filter
    }

    // Order by created_at descending (most recent first), then apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Get pending count for admin
    let pendingCount = 0;
    if (isAdmin) {
      const { count: pending } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);
      pendingCount = pending || 0;
    }

    const responsePayload = {
      reviews: reviews || [],
      total: count || 0,
      pending: pendingCount,
      page,
      limit,
    };
    // Cache approved reviews for longer (they don't change often)
    // Cache pending/all reviews for shorter (admin needs fresh data)
    const cacheTime = status === 'approved' ? 300 : 60;
    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': `public, s-maxage=${cacheTime}, stale-while-revalidate=${cacheTime * 2}`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerSupabaseClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { comment } = body;

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      );
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Create review - use service role to bypass RLS since we already verified user server-side
    const insertData = {
      user_id: user.id,
      user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      user_email: user.email,
      comment: comment.trim(),
      is_approved: false,
    };
    
    // Create a service role client to bypass RLS (safe because we verified user above)
    // Use createClient (not createServerClient) to properly use the service role key
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    const { data: review, error: insertError } = await serviceClient
      .from('reviews')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
