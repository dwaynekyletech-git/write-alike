import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

// Schema for the style analysis response
const styleAnalysisSchema = z.object({
  writingCharacteristics: z.object({
    averageSentenceLength: z.number().describe('Average number of words per sentence'),
    vocabularyComplexity: z.enum(['simple', 'moderate', 'complex']).describe('Overall vocabulary sophistication'),
    sentenceVariety: z.enum(['low', 'moderate', 'high']).describe('Variety in sentence structures'),
  }),
  toneProfile: z.object({
    formal: z.number().min(0).max(1).describe('Formality level (0-1)'),
    conversational: z.number().min(0).max(1).describe('Conversational tone (0-1)'),
    technical: z.number().min(0).max(1).describe('Technical language usage (0-1)'),
    emotional: z.number().min(0).max(1).describe('Emotional expressiveness (0-1)'),
    authoritative: z.number().min(0).max(1).describe('Authoritative tone (0-1)'),
  }),
  structuralPatterns: z.object({
    paragraphStyle: z.enum(['short', 'medium', 'long']).describe('Preferred paragraph length'),
    transitionUsage: z.enum(['minimal', 'moderate', 'frequent']).describe('How often transitions are used'),
    listingPreference: z.enum(['rare', 'occasional', 'frequent']).describe('Tendency to use lists or bullet points'),
  }),
  languagePatterns: z.object({
    punctuationStyle: z.object({
      semicolonUsage: z.enum(['rare', 'moderate', 'frequent']),
      dashUsage: z.enum(['rare', 'moderate', 'frequent']),
      exclamationUsage: z.enum(['rare', 'moderate', 'frequent']),
    }),
    preferredTransitions: z.array(z.string()).describe('Commonly used transition phrases'),
    characteristicPhrases: z.array(z.string()).describe('Phrases or expressions that are distinctive to this writer'),
  }),
  contentThemes: z.object({
    primaryTopics: z.array(z.string()).describe('Main subject areas the writer focuses on'),
    approachStyle: z.enum(['analytical', 'narrative', 'persuasive', 'descriptive', 'mixed']).describe('Primary writing approach'),
    evidenceStyle: z.enum(['data-driven', 'anecdotal', 'theoretical', 'experiential', 'mixed']).describe('How writer supports arguments'),
  }),
  uniqueCharacteristics: z.object({
    strengths: z.array(z.string()).describe('Notable writing strengths'),
    distinctiveFeatures: z.array(z.string()).describe('What makes this writing style unique'),
    voiceDescription: z.string().describe('Overall description of the writer\'s voice in 2-3 sentences'),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documents } = await request.json();
    
    if (!documents || !Array.isArray(documents) || documents.length < 2) {
      return NextResponse.json({ 
        error: 'At least 2 documents are required for style analysis' 
      }, { status: 400 });
    }

    // Combine all document content
    const combinedContent = documents.map((doc: { filename: string; content: string }) => 
      `=== ${doc.filename} ===\n${doc.content}\n\n`
    ).join('');

    // Truncate if too long (keep within API limits)
    const maxLength = 15000; // Approximately 4000 tokens
    const contentToAnalyze = combinedContent.length > maxLength 
      ? combinedContent.substring(0, maxLength) + '...\n[Content truncated for analysis]'
      : combinedContent;

    // Use AI to analyze the writing style
    const { object: styleAnalysis } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: styleAnalysisSchema,
      prompt: `
        Analyze the following writing samples to extract a comprehensive style profile. 
        Focus on identifying patterns that can be used to generate new content in the same voice.
        
        Look for:
        1. Sentence structure and length patterns
        2. Vocabulary choices and complexity
        3. Tone and formality level
        4. Paragraph organization
        5. Transition and connecting phrases
        6. Punctuation habits
        7. Content approach and themes
        8. Unique characteristics that define this writer's voice
        
        Writing samples:
        ${contentToAnalyze}
        
        Provide detailed analysis that captures what makes this writing distinctive and can be replicated.
      `,
    });

    // Calculate some basic metrics
    const totalWords = documents.reduce((sum: number, doc: { content?: string }) => {
      return sum + (doc.content?.split(/\s+/).length || 0);
    }, 0);

    // Create the complete style profile
    const styleProfile = {
      userId,
      analysisDate: new Date().toISOString(),
      documentCount: documents.length,
      totalWordCount: totalWords,
      
      // AI-generated analysis
      writingCharacteristics: styleAnalysis.writingCharacteristics,
      toneProfile: styleAnalysis.toneProfile,
      structuralPatterns: styleAnalysis.structuralPatterns,
      languagePatterns: styleAnalysis.languagePatterns,
      contentThemes: styleAnalysis.contentThemes,
      uniqueCharacteristics: styleAnalysis.uniqueCharacteristics,
      
      // Store sample content for future reference
      sampleContent: combinedContent.substring(0, 2000), // First 2000 chars as reference
    };

    // Store the style profile in database
    const supabase = createServerClient();
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        clerk_user_id: userId,
        style_data: styleProfile,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'clerk_user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save style profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      styleProfile,
      message: 'Writing style analyzed successfully!'
    });

  } catch (error) {
    console.error('Style analysis error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to analyze writing style' }, { status: 500 });
  }
}