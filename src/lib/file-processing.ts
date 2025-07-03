// Dynamic imports to avoid build-time issues
// import pdfParse from 'pdf-parse';
// import mammoth from 'mammoth';

export interface ProcessedDocument {
  filename: string;
  content: string;
  wordCount: number;
  fileType: 'pdf' | 'docx' | 'txt';
}

export async function processDocument(file: File): Promise<ProcessedDocument> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  let content: string;
  let fileType: 'pdf' | 'docx' | 'txt';

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    fileType = 'pdf';
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(buffer);
    content = pdfData.text;
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    fileType = 'docx';
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    content = result.value;
  } else if (
    file.type === 'text/plain' || 
    file.name.endsWith('.txt')
  ) {
    fileType = 'txt';
    content = buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
  }

  // Clean up the text
  content = cleanText(content);
  
  if (content.length < 100) {
    throw new Error('Document is too short for style analysis. Please upload documents with more content.');
  }

  const wordCount = countWords(content);

  return {
    filename: file.name,
    content,
    wordCount,
    fileType
  };
}

function cleanText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove page numbers and headers/footers (basic patterns)
    .replace(/^\d+\s*$/gm, '')
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, '')
    // Remove email addresses
    .replace(/[^\s]+@[^\s]+\.[^\s]+/g, '')
    // Remove excessive punctuation
    .replace(/[.]{3,}/g, '...')
    // Trim each line and remove empty lines
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

export interface StyleProfile {
  userId: string;
  analysisDate: string;
  documentCount: number;
  totalWordCount: number;
  
  // Writing characteristics
  averageSentenceLength: number;
  vocabularyComplexity: 'simple' | 'moderate' | 'complex';
  toneProfile: {
    formal: number;      // 0-1 scale
    conversational: number;
    technical: number;
    emotional: number;
  };
  
  // Structural patterns
  paragraphStyle: {
    averageLength: number;
    preferredStructure: 'short' | 'medium' | 'long';
  };
  
  // Language patterns
  commonPhrases: string[];
  preferredTransitions: string[];
  punctuationStyle: {
    semicolonUsage: 'rare' | 'moderate' | 'frequent';
    dashUsage: 'rare' | 'moderate' | 'frequent';
    exclamationUsage: 'rare' | 'moderate' | 'frequent';
  };
  
  // Topic preferences (extracted from content)
  topicalFocus: string[];
  
  // Raw analysis for AI context
  rawAnalysis: string;
}

export async function analyzeWritingStyle(
  documents: ProcessedDocument[],
  userId: string
): Promise<StyleProfile> {
  if (documents.length < 2) {
    throw new Error('Need at least 2 documents for style analysis');
  }

  const totalWordCount = documents.reduce((sum, doc) => sum + doc.wordCount, 0);
  const combinedText = documents.map(doc => doc.content).join('\n\n');

  // Basic structural analysis
  const sentences = combinedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const averageSentenceLength = sentences.reduce((sum, sentence) => {
    return sum + sentence.trim().split(/\s+/).length;
  }, 0) / sentences.length;

  const paragraphs = combinedText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const averageParagraphLength = paragraphs.reduce((sum, para) => {
    return sum + para.trim().split(/\s+/).length;
  }, 0) / paragraphs.length;

  // Basic punctuation analysis
  const semicolons = (combinedText.match(/;/g) || []).length;
  const dashes = (combinedText.match(/—|–/g) || []).length;
  const exclamations = (combinedText.match(/!/g) || []).length;
  const textLength = combinedText.length;

  return {
    userId,
    analysisDate: new Date().toISOString(),
    documentCount: documents.length,
    totalWordCount,
    
    averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
    vocabularyComplexity: getVocabularyComplexity(combinedText),
    
    toneProfile: {
      formal: 0.7, // These would be determined by AI analysis
      conversational: 0.4,
      technical: 0.3,
      emotional: 0.2,
    },
    
    paragraphStyle: {
      averageLength: Math.round(averageParagraphLength),
      preferredStructure: averageParagraphLength < 50 ? 'short' : 
                         averageParagraphLength < 100 ? 'medium' : 'long'
    },
    
    commonPhrases: extractCommonPhrases(combinedText),
    preferredTransitions: extractTransitions(combinedText),
    
    punctuationStyle: {
      semicolonUsage: semicolons / textLength * 1000 > 2 ? 'frequent' : 
                     semicolons / textLength * 1000 > 0.5 ? 'moderate' : 'rare',
      dashUsage: dashes / textLength * 1000 > 1 ? 'frequent' : 
                dashes / textLength * 1000 > 0.2 ? 'moderate' : 'rare',
      exclamationUsage: exclamations / textLength * 1000 > 3 ? 'frequent' : 
                       exclamations / textLength * 1000 > 1 ? 'moderate' : 'rare',
    },
    
    topicalFocus: extractTopics(combinedText),
    rawAnalysis: combinedText.substring(0, 3000) // First 3000 chars for AI context
  };
}

function getVocabularyComplexity(text: string): 'simple' | 'moderate' | 'complex' {
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  
  const longWords = words.filter(word => word.length > 6).length;
  const longWordRatio = longWords / words.length;
  
  if (lexicalDiversity > 0.6 && longWordRatio > 0.2) return 'complex';
  if (lexicalDiversity > 0.4 && longWordRatio > 0.1) return 'moderate';
  return 'simple';
}

function extractCommonPhrases(text: string): string[] {
  // Simple n-gram extraction for common phrases
  const sentences = text.split(/[.!?]+/);
  const phrases: { [key: string]: number } = {};
  
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().trim().split(/\s+/);
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ');
      if (phrase.length > 10) {
        phrases[phrase] = (phrases[phrase] || 0) + 1;
      }
    }
  });
  
  return Object.entries(phrases)
    .filter(([, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([phrase]) => phrase);
}

function extractTransitions(text: string): string[] {
  const commonTransitions = [
    'however', 'moreover', 'furthermore', 'nevertheless', 'therefore',
    'consequently', 'meanwhile', 'subsequently', 'additionally', 'similarly',
    'in contrast', 'on the other hand', 'as a result', 'for example',
    'in fact', 'indeed', 'specifically', 'particularly'
  ];
  
  const found: { [key: string]: number } = {};
  const lowerText = text.toLowerCase();
  
  commonTransitions.forEach(transition => {
    const matches = lowerText.match(new RegExp(`\\b${transition}\\b`, 'g'));
    if (matches) {
      found[transition] = matches.length;
    }
  });
  
  return Object.entries(found)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([transition]) => transition);
}

function extractTopics(text: string): string[] {
  // Very basic topic extraction - would be enhanced with AI
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4)
    .filter(word => !isCommonWord(word));
  
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);
}

function isCommonWord(word: string): boolean {
  const commonWords = new Set([
    'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know',
    'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come',
    'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take',
    'than', 'them', 'well', 'were', 'what', 'would', 'about', 'after', 'before',
    'could', 'first', 'other', 'right', 'their', 'think', 'which', 'being',
    'every', 'great', 'might', 'shall', 'still', 'those', 'under', 'while',
    'these', 'where', 'should', 'between', 'through', 'during', 'before',
    'after', 'above', 'below', 'again', 'further', 'then', 'once'
  ]);
  
  return commonWords.has(word);
}