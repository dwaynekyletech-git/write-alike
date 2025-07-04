import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

// Schema for the text revision response
const textRevisionSchema = z.object({
  revisedText: z.string().describe('The improved version of the text'),
  explanation: z.string().describe('Brief explanation of what was changed and why'),
  confidence: z.number().min(0).max(1).describe('Confidence level in the revision (0-1)'),
  changes: z.array(z.object({
    type: z.enum(['grammar', 'style', 'clarity', 'tone', 'structure', 'word_choice']),
    description: z.string().describe('What specific change was made')
  })).describe('List of specific changes made')
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { selectedText, query } = await request.json();
    
    if (!selectedText || !query) {
      return NextResponse.json({ 
        error: 'Both selectedText and query are required' 
      }, { status: 400 });
    }

    // Fetch user's style profile from database
    const supabase = createServerClient();
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('style_data')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Continue without style profile if not available
    }

    // Extract style information for AI context
    const styleProfile = userProfile?.style_data;
    let styleContext = '';
    
    if (styleProfile) {
      const { toneProfile, writingCharacteristics, languagePatterns, uniqueCharacteristics } = styleProfile;
      
      styleContext = `
IMPORTANT: Maintain the user's authentic writing style based on their profile:

Writing Characteristics:
- Average sentence length: ${writingCharacteristics?.averageSentenceLength || 'moderate'}
- Vocabulary complexity: ${writingCharacteristics?.vocabularyComplexity || 'moderate'}
- Sentence variety: ${writingCharacteristics?.sentenceVariety || 'moderate'}

Tone Profile:
- Formality level: ${toneProfile?.formal || 0.5}
- Conversational tone: ${toneProfile?.conversational || 0.5}
- Technical language: ${toneProfile?.technical || 0.5}
- Emotional expressiveness: ${toneProfile?.emotional || 0.5}
- Authoritative tone: ${toneProfile?.authoritative || 0.5}

Language Patterns:
- Punctuation style: ${JSON.stringify(languagePatterns?.punctuationStyle || {})}
- Common transitions: ${languagePatterns?.preferredTransitions?.join(', ') || 'standard transitions'}
- Characteristic phrases: ${languagePatterns?.characteristicPhrases?.join(', ') || 'none identified'}

Voice Description: ${uniqueCharacteristics?.voiceDescription || 'No specific voice profile available'}

The revision should sound like it was written by the same person, maintaining their natural voice and writing patterns.
      `;
    } else {
      styleContext = `
No specific style profile available for this user. Make improvements while maintaining a natural, consistent voice.
      `;
    }

    // Use AI to revise the text
    const { object: revision } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: textRevisionSchema,
      prompt: `
You are a skilled writing assistant helping a user improve their text. Your task is to revise the selected text according to their specific request while maintaining their authentic writing voice.

${styleContext}

User's Request: "${query}"

Original Text: "${selectedText}"

Instructions:
1. Address the user's specific request (${query})
2. Maintain the user's authentic writing style and voice
3. Only make necessary changes - don't over-edit
4. Keep the same general meaning and intent
5. If the text is already good, make minimal improvements
6. Ensure the revision flows naturally with the user's writing patterns

Provide:
- The revised text that addresses their request
- A brief explanation of what was changed
- Your confidence level in the revision
- Specific changes made categorized by type

Focus on being helpful while preserving the user's unique voice and style.
      `,
    });

    return NextResponse.json({
      success: true,
      originalText: selectedText,
      revisedText: revision.revisedText,
      explanation: revision.explanation,
      confidence: revision.confidence,
      changes: revision.changes,
      query: query
    });

  } catch (error) {
    console.error('Text revision error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to revise text' }, { status: 500 });
  }
}