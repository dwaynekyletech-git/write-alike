import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client (for frontend)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Client-side client function (for frontend)
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Server-side client with service role key (bypasses RLS)
export function createServerClient() {
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          clerk_user_id: string;
          style_data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          style_data?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          style_data?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_documents: {
        Row: {
          id: string;
          clerk_user_id: string;
          title: string;
          content: string;
          document_type: 'sample' | 'generated' | 'draft';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          title: string;
          content: string;
          document_type: 'sample' | 'generated' | 'draft';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          title?: string;
          content?: string;
          document_type?: 'sample' | 'generated' | 'draft';
          updated_at?: string;
        };
      };
      writing_samples: {
        Row: {
          id: string;
          clerk_user_id: string;
          original_filename: string;
          processed_content: string;
          file_type: 'pdf' | 'docx' | 'txt';
          word_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          original_filename: string;
          processed_content: string;
          file_type: 'pdf' | 'docx' | 'txt';
          word_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          original_filename?: string;
          processed_content?: string;
          file_type?: 'pdf' | 'docx';
          word_count?: number;
        };
      };
    };
  };
}