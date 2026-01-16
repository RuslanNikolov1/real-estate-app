import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { deleteMultipleFromCloudinary } from '@/lib/cloudinary-server';

// Vercel serverless function configuration
export const runtime = 'nodejs';
export const maxDuration = 30;

// Helper to create Supabase server client for auth
async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

// DELETE /api/properties/pending/[id] - Reject pending property (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.email !== 'ruslannikolov1@gmail.com') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch the pending property to get image public_ids for cleanup
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: pendingProperty, error: fetchError } = await supabaseAdmin
      .from('pending_properties')
      .select('image_public_ids, broker_image')
      .eq('id', id)
      .single();

    if (fetchError || !pendingProperty) {
      return NextResponse.json(
        { error: 'Pending property not found' },
        { status: 404 }
      );
    }

    // Delete pending property from database
    const { error: deleteError } = await supabaseAdmin
      .from('pending_properties')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting pending property:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete pending property' },
        { status: 500 }
      );
    }

    // Cleanup Cloudinary images (don't fail if cleanup fails)
    try {
      const publicIdsToDelete: string[] = [];
      
      // Add property images
      if (pendingProperty.image_public_ids && Array.isArray(pendingProperty.image_public_ids)) {
        publicIdsToDelete.push(...pendingProperty.image_public_ids);
      }
      
      // Add broker image if exists
      if (pendingProperty.broker_image) {
        // Extract public_id from broker_image URL or use a pattern
        // broker_image is stored as URL, but we need public_id
        // For now, we'll skip broker image cleanup as we don't have the public_id
        // If needed, we should store broker_image_public_id in the database
      }

      if (publicIdsToDelete.length > 0) {
        await deleteMultipleFromCloudinary(publicIdsToDelete);
      }
    } catch (cleanupError) {
      // Log but don't fail the request if cleanup fails
      console.error('Error cleaning up Cloudinary images:', cleanupError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/properties/pending/[id]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
