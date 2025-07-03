import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const { data: documents, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('clerk_user_id', userId)
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

    const supabase = createClient();
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