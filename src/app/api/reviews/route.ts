import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Helper to create Supabase server client
async function createServerSupabaseClient() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:createClient:6',message:'createClient entry',data:{hasSupabaseUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasAnonKey:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  const cookieStore = await cookies();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:createClient:8',message:'cookies retrieved',data:{cookieCount:cookieStore.getAll().length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:createClient:30',message:'createClient exit',data:{clientCreated:!!client},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  return client;
}

// GET /api/reviews - Fetch reviews (approved for public, all for admin)
export async function GET(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:GET:33',message:'GET handler entry',data:{url:request.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const status = searchParams.get('status') || 'approved';
    
    const offset = (page - 1) * limit;

    // Get current user
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:GET:getUser',message:'getUser result',data:{hasUser:!!user,userEmail:user?.email,userId:user?.id,getUserError:getUserError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Check if user is admin
    const isAdmin = user?.email === 'ruslannikolov1@gmail.com';
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:GET:adminCheck',message:'admin check',data:{userEmail:user?.email,expectedEmail:'ruslannikolov1@gmail.com',isAdmin},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:GET:before-query',message:'before query construction',data:{isAdmin,status,page,limit,offset},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:GET:before-execute',message:'before query execution',data:{isAdmin,status,hasQuery:!!query},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const { data: reviews, error, count } = await query;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:GET:queryResult',message:'query result',data:{hasError:!!error,errorCode:error?.code,errorMessage:error?.message,errorDetails:error?.details,reviewsCount:reviews?.length,count,isAdmin,status,reviews:reviews},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (error) {
      console.error('Error fetching reviews:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:GET:73',message:'query error details',data:{errorCode:error.code,errorMessage:error.message,errorDetails:error.details,errorHint:error.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:GET:response',message:'Sending response',data:{reviewsCount:responsePayload.reviews.length,total:responsePayload.total,pending:responsePayload.pending,reviews:responsePayload.reviews},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:GET:catch',message:'GET catch block',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  // #region agent log
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieHeaderNames = cookieHeader.split(';').map(c => c.trim().split('=')[0]).filter(Boolean);
  fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:POST:entry',message:'POST handler entry',data:{url:request.url,hasHeaders:!!request.headers,cookieHeaderLength:cookieHeader.length,cookieHeaderNames:cookieHeaderNames,hasSupabaseInHeader:cookieHeaderNames.some(n=>n.includes('sb-')||n.includes('supabase'))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const cookieStore = await cookies();
    // #region agent log
    const allCookies = cookieStore.getAll();
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:POST:cookies',message:'cookies retrieved',data:{cookieCount:allCookies.length,cookieNames:allCookies.map(c=>c.name),hasAuthCookie:allCookies.some(c=>c.name.includes('auth')||c.name.includes('supabase')||c.name.includes('sb-'))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const supabase = await createServerSupabaseClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:POST:112',message:'POST getUser result',data:{hasUser:!!user,userEmail:user?.email,userId:user?.id,authErrorCode:authError?.code,authErrorMessage:authError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    if (authError || !user) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:POST:115',message:'POST unauthorized',data:{authErrorCode:authError?.code,authErrorMessage:authError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
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
    // #region agent log
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0;
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:POST:139',message:'before insert',data:{userId:insertData.user_id,userEmail:insertData.user_email,commentLength:insertData.comment.length,hasServiceKey,keyLength},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:POST:148',message:'insert result',data:{hasError:!!insertError,errorCode:insertError?.code,errorMessage:insertError?.message,errorDetails:insertError?.details,errorHint:insertError?.hint,hasReview:!!review},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reviews/route.ts:POST:catch',message:'POST catch block',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
