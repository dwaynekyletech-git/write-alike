import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('type');

    const supabase = createServerClient();
    let query = supabase
      .from('user_documents')
      .select('*')
      .eq('clerk_user_id', userId);

    // Add document type filter if specified
    if (documentType && documentType !== 'all') {
      query = query.eq('document_type', documentType);
    }

    const { data: documents, error } = await query
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    return NextResponse.json({ documents });

  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, documentType = 'draft' } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ 
        error: 'Title and content are required' 
      }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: document, error } = await supabase
      .from('user_documents')
      .insert({
        clerk_user_id: userId,
        title,
        content,
        document_type: documentType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
    }

    return NextResponse.json({ document });

  } catch (error) {
    console.error('Document save error:', error);
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, content } = await request.json();

    if (!id) {
      return NextResponse.json({ 
        error: 'Document ID is required' 
      }, { status: 400 });
    }

    if (!title && !content) {
      return NextResponse.json({ 
        error: 'Title or content is required for update' 
      }, { status: 400 });
    }

    const supabase = createServerClient();
    
    // Build update object with only provided fields
    const updateData: { title?: string; content?: string; updated_at: string } = {
      updated_at: new Date().toISOString()
    };
    
    if (title) updateData.title = title;
    if (content) updateData.content = content;

    const { data: document, error } = await supabase
      .from('user_documents')
      .update(updateData)
      .eq('id', id)
      .eq('clerk_user_id', userId) // Ensure user owns the document
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ document });

  } catch (error) {
    console.error('Document update error:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'Document ID is required' 
      }, { status: 400 });
    }

    const supabase = createServerClient();
    
    const { error } = await supabase
      .from('user_documents')
      .delete()
      .eq('id', id)
      .eq('clerk_user_id', userId); // Ensure user owns the document

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