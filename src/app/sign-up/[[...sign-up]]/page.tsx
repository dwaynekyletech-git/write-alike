import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">WA</span>
            </div>
            <span className="font-semibold text-text-primary text-lg">Write Alike</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            Create your account
          </h1>
          <p className="text-text-secondary">
            Start writing with AI that learns your unique style
          </p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-accent-primary hover:bg-accent-hover',
              card: 'shadow-lg border border-border',
            }
          }}
          redirectUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  );
}