# AI Writing Assistant - Project Context

## Project Overview
An AI-powered writing assistant that learns individual writing styles from uploaded papers and provides personalized content generation and editing assistance. The core innovation is maintaining the user's authentic voice while providing intelligent writing improvements.

## Core Value Proposition
**Problem**: Generic AI writing tools don't match individual writing styles, making content feel inauthentic.
**Solution**: Personalized AI that learns from user's existing writing and maintains their unique voice in all assistance.

## Key Features

### 1. Style Learning Engine
- Upload 5-10 writing samples (PDF/DOCX)
- AI extracts patterns: tone, vocabulary, sentence structure, argumentation style
- Creates comprehensive style profile stored as JSONB in database

### 2. Style-Consistent Content Generation  
- User provides topic/prompt
- AI generates draft matching their writing patterns
- Opens in rich text editor for refinement

### 3. Interactive Editing Assistant (Primary Feature)
- Highlight any text in editor
- Ask natural language questions: "Make this stronger", "Fix this transition"
- AI provides revisions that maintain user's authentic style
- Accept/reject suggestions with preview

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **UI**: React 18 with TypeScript
- **Editor**: Lexical (Meta's rich text editor)
- **Styling**: Tailwind CSS
- **Authentication**: Clerk (handles auth + user management)

### Backend Stack
- **Database**: Supabase (PostgreSQL + real-time features)
- **AI**: OpenAI GPT-4 or Anthropic Claude API
- **File Processing**: PDF/DOCX parsing for style analysis
- **MCP Server**: Real-time AI assistance during editing

### Database Schema
```sql
-- Core tables in Supabase
user_profiles (
    id UUID PRIMARY KEY,
    clerk_user_id TEXT UNIQUE NOT NULL,
    style_data JSONB, -- Extracted writing patterns
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

user_documents (
    id UUID PRIMARY KEY,
    clerk_user_id TEXT NOT NULL,
    title TEXT,
    content TEXT,
    document_type TEXT, -- 'sample' | 'generated' | 'draft'
    created_at TIMESTAMP
);

writing_samples (
    id UUID PRIMARY KEY,
    user_profile_id UUID REFERENCES user_profiles(id),
    original_filename TEXT,
    processed_content TEXT,
    file_type TEXT,
    created_at TIMESTAMP
);
```

## MCP Server Integration

### Required MCP Tools
```typescript
// Primary editing tool
revise_text_in_style(
    highlighted_text: string,
    user_query: string, 
    user_id: string
) -> { revised_text: string, explanation: string }

// Style analysis tool  
analyze_writing_style(
    documents: string[],
    user_id: string
) -> { style_profile: StyleProfile }

// Content generation tool
generate_content(
    topic: string,
    style_profile: StyleProfile,
    user_id: string
) -> { generated_content: string }
```

### Authentication Flow
1. Clerk handles user auth and provides JWT tokens
2. Frontend sends requests with Clerk token to Next.js API routes
3. API routes verify token and extract userId
4. API forwards authenticated requests to MCP server
5. MCP server uses userId to fetch style profiles from Supabase

## File Structure
```
ai-writing-assistant/
├── README.md
├── claude.md (this file)
├── next.config.js
├── package.json
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── new-document/page.tsx
│   └── api/
│       ├── ai/
│       │   ├── analyze-style/route.ts
│       │   ├── generate-content/route.ts
│       │   └── revise-text/route.ts
│       ├── documents/route.ts
│       └── upload/route.ts
├── components/
│   ├── editor/
│   │   ├── DocumentEditor.tsx       # Main Lexical editor
│   │   ├── AIQueryPlugin.tsx        # Handles text selection + AI queries  
│   │   ├── RevisionDialog.tsx       # Shows AI suggestions
│   │   ├── ToolbarPlugin.tsx        # Editor formatting tools
│   │   └── SavePlugin.tsx           # Auto-save functionality
│   ├── upload/
│   │   ├── StyleAnalysisUpload.tsx  # File upload for writing samples
│   │   └── FileProcessor.tsx        # PDF/DOCX processing
│   ├── dashboard/
│   │   ├── DocumentList.tsx         # User's documents
│   │   └── StyleProfile.tsx         # Display learned style
│   └── ui/                          # Reusable UI components
├── lib/
│   ├── supabase.ts                  # Database client
│   ├── openai.ts                    # AI API client  
│   ├── clerk.ts                     # Auth helpers
│   ├── file-processing.ts           # PDF/DOCX parsing
│   └── mcp-client.ts                # MCP server communication
├── types/
│   ├── index.ts                     # Shared TypeScript types
│   ├── style-profile.ts             # Writing style data structures
│   └── document.ts                  # Document-related types
├── mcp-server/                      # MCP server implementation
│   ├── server.ts                    # Main MCP server
│   ├── tools/                       # MCP tool implementations
│   └── package.json
└── styles/
    └── globals.css                  # Tailwind + custom styles
```

## Key Implementation Details

### Text Selection & AI Query Flow
1. User highlights text in Lexical editor
2. `AIQueryPlugin` detects selection and shows floating query box
3. User types natural language request
4. Frontend sends to `/api/ai/revise-text` with Clerk token
5. API verifies user and forwards to MCP server
6. MCP server fetches user's style profile from Supabase
7. AI generates style-consistent revision
8. `RevisionDialog` shows original vs revised with accept/reject

### Style Analysis Process
1. User uploads 5-10 writing samples
2. `FileProcessor` extracts text from PDF/DOCX files
3. `/api/ai/analyze-style` sends content to MCP server
4. MCP server uses AI to extract writing patterns
5. Style profile saved to `user_profiles.style_data` in Supabase

### Document Generation
1. User provides topic/prompt on new document page
2. System fetches their style profile
3. MCP server generates content using style profile as context
4. New document opens in editor for refinement

## Critical Success Factors

### User Experience
- **Seamless Selection**: Text highlighting should feel native, query box appears instantly
- **Fast AI Responses**: < 3 second response time for revisions
- **Style Accuracy**: Generated content should authentically match user's voice
- **Non-Intrusive Interface**: AI assistance enhances rather than interrupts writing flow

### Technical Performance  
- **Real-time Editing**: No lag in editor interactions
- **Efficient MCP Communication**: Minimize API calls during editing
- **Reliable File Processing**: Handle various PDF/DOCX formats robustly
- **Scalable Architecture**: Support multiple concurrent users

## Development Phases

### Phase 1: Core Infrastructure (Week 1-2)
- Set up Next.js with Clerk authentication
- Configure Supabase database with schema
- Implement basic file upload and processing
- Create MCP server foundation

### Phase 2: Style Learning (Week 3)
- Build file processing for PDF/DOCX
- Implement AI-powered style analysis
- Create style profile storage and retrieval
- Add basic dashboard for uploaded samples

### Phase 3: Editor Foundation (Week 4-5)
- Integrate Lexical rich text editor
- Implement text selection detection
- Build AI query interface components
- Create document save/load functionality

### Phase 4: AI Integration (Week 6-7)
- Connect editor to MCP server
- Implement revision generation and preview
- Add content generation for new documents
- Refine style consistency algorithms

### Phase 5: Polish & Testing (Week 8)
- Add comprehensive error handling
- Implement responsive design
- Performance optimization
- User testing and feedback integration

## Environment Variables Needed
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Provider
OPENAI_API_KEY=
# OR
ANTHROPIC_API_KEY=

# MCP Server
MCP_SERVER_URL=http://localhost:3001
```

## Success Metrics
- **User Retention**: > 70% of users return after uploading style samples
- **AI Acceptance Rate**: > 60% of AI suggestions accepted by users  
- **Style Accuracy**: Users rate AI-generated content as "sounds like me" > 80% of time
- **Performance**: < 3s response time for AI queries, < 1s for editor interactions

## Notes for Claude Code
- Prioritize the text selection + AI query feature as the core differentiator
- Ensure all AI responses are contextually aware of the user's writing style
- Focus on creating a smooth, Word-like editing experience
- Handle edge cases gracefully (no style profile yet, API failures, etc.)
- Keep the MVP scope focused but extensible for future features