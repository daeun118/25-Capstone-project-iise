import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all emotion tags (predefined + used custom tags)
    const { data: tags, error } = await supabase
      .from('emotion_tags')
      .select('*')
      .order('is_predefined', { ascending: false })
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('Error fetching emotion tags:', error);
      return NextResponse.json(
        { error: 'Failed to fetch emotion tags' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if tag already exists
    const { data: existingTag } = await supabase
      .from('emotion_tags')
      .select('*')
      .eq('name', trimmedName)
      .single();

    if (existingTag) {
      // Return existing tag if it already exists
      return NextResponse.json({ tag: existingTag });
    }

    // Create new custom tag
    const { data: newTag, error } = await supabase
      .from('emotion_tags')
      .insert({
        name: trimmedName,
        is_predefined: false,
        usage_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating emotion tag:', error);
      return NextResponse.json(
        { error: 'Failed to create emotion tag' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tag: newTag });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
