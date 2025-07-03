// Core types for the AI Writing Assistant

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  createdAt: string;
}

export interface StyleProfile {
  id: string;
  userId: string;
  vocabulary: string[];
  toneIndicators: string[];
  sentenceStructure: string;
  writingPatterns: string[];
  extractedAt: string;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  documentType: 'sample' | 'generated' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface WritingSample {
  id: string;
  userProfileId: string;
  originalFilename: string;
  processedContent: string;
  fileType: 'pdf' | 'docx' | 'txt';
  createdAt: string;
}

export interface AIRevisionRequest {
  highlightedText: string;
  userQuery: string;
  userId: string;
  contextBefore?: string;
  contextAfter?: string;
}

export interface AIRevisionResponse {
  revisedText: string;
  explanation: string;
  confidence: number;
}