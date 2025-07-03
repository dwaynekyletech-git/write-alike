import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from './supabase';

export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  return userId;
}

export async function getOrCreateUserProfile(clerkUserId: string) {
  // Check if user profile exists
  const { data: existingProfile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error, which is expected for new users
    throw error;
  }

  if (existingProfile) {
    return existingProfile;
  }

  // Create new user profile
  const { data: newProfile, error: insertError } = await supabase
    .from('user_profiles')
    .insert([
      {
        clerk_user_id: clerkUserId,
        style_data: {}
      }
    ])
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return newProfile;
}

export async function getUserDocuments(clerkUserId: string, documentType?: string) {
  let query = supabase
    .from('user_documents')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .order('updated_at', { ascending: false });

  if (documentType) {
    query = query.eq('document_type', documentType);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export async function createDocument(clerkUserId: string, title: string, content: string, documentType: 'sample' | 'generated' | 'draft') {
  const { data, error } = await supabase
    .from('user_documents')
    .insert([
      {
        clerk_user_id: clerkUserId,
        title,
        content,
        document_type: documentType
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateDocument(documentId: string, updates: { title?: string; content?: string }) {
  const { data, error } = await supabase
    .from('user_documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}