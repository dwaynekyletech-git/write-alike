-- AI Writing Assistant Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    style_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Documents Table
CREATE TABLE user_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    document_type TEXT NOT NULL CHECK (document_type IN ('sample', 'generated', 'draft')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing Samples Table
CREATE TABLE writing_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    processed_content TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx')),
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
CREATE INDEX idx_user_documents_clerk_user_id ON user_documents(clerk_user_id);
CREATE INDEX idx_user_documents_type ON user_documents(document_type);
CREATE INDEX idx_writing_samples_user_id ON writing_samples(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_samples ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = clerk_user_id);

-- Policies for user_documents
CREATE POLICY "Users can view own documents" ON user_documents
    FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own documents" ON user_documents
    FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own documents" ON user_documents
    FOR UPDATE USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can delete own documents" ON user_documents
    FOR DELETE USING (auth.uid()::text = clerk_user_id);

-- Policies for writing_samples
CREATE POLICY "Users can view own writing samples" ON writing_samples
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own writing samples" ON writing_samples
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own writing samples" ON writing_samples
    FOR DELETE USING (auth.uid()::text = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_documents_updated_at 
    BEFORE UPDATE ON user_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();