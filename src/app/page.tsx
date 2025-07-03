import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">WA</span>
              </div>
              <span className="font-semibold text-text-primary text-lg">Write Alike</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost" size="md">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="primary" size="md">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-text-primary mb-6">
            AI Writing Assistant That{' '}
            <span className="text-accent-primary">Learns Your Style</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Upload your writing samples and let AI learn your unique voice. 
            Generate content, edit with AI assistance, and maintain your authentic style.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/sign-up">
              <Button variant="primary" size="lg">
                Start Writing
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Style Learning
              </h3>
              <p className="text-text-secondary">
                Upload your writing samples and AI extracts your unique tone, vocabulary, and patterns.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                AI Editing
              </h3>
              <p className="text-text-secondary">
                Highlight any text and ask AI to improve it while maintaining your authentic voice.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Content Generation
              </h3>
              <p className="text-text-secondary">
                Provide a topic and AI generates full content matching your writing style.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
