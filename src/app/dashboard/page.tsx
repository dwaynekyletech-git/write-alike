import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-text-secondary mt-1">
            Create, edit, and manage your writing projects
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md">
            Upload Samples
          </Button>
          <Button variant="primary" size="md">
            New Document
          </Button>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-text-primary mb-2">
          Your documents will appear here
        </h3>
        <p className="text-text-secondary">
          Start by uploading writing samples or creating your first document.
        </p>
      </div>
    </div>
  );
}