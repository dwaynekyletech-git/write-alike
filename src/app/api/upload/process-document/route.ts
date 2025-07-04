import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { processDocument } from '@/lib/file-processing';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Process the document
    const processedDoc = await processDocument(file);

    // Store in database as a document with type 'sample'
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('user_documents')
      .insert({
        clerk_user_id: userId,
        title: processedDoc.filename,
        content: processedDoc.content,
        document_type: 'sample',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      text: processedDoc.content,
      wordCount: processedDoc.wordCount,
      fileType: processedDoc.fileType,
      id: data.id
    });

  } catch (error) {
    console.error('File processing error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}