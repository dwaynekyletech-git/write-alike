import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createClient();
    const { data: document, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });

  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title && !content) {
      return NextResponse.json({ 
        error: 'Title or content is required' 
      }, { status: 400 });
    }

    const { id } = await params;
    const supabase = createClient();
    
    // Build update object with only provided fields
    const updateData: {
      updated_at: string;
      title?: string;
      content?: string;
    } = {
      updated_at: new Date().toISOString()
    };
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const { data: document, error } = await supabase
      .from('user_documents')
      .update(updateData)
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    return NextResponse.json({ document });

  } catch (error) {
    console.error('Document update error:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createClient();
    const { error } = await supabase
      .from('user_documents')
      .delete()
      .eq('id', id)
      .eq('clerk_user_id', userId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}