import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { DocumentGrid } from '@/components/dashboard/DocumentGrid';

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
          <Link href="/dashboard/upload-samples">
            <Button variant="secondary" size="md">
              Upload Samples
            </Button>
          </Link>
          <Link href="/dashboard/new-document">
            <Button variant="primary" size="md">
              New Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Documents Grid */}
      <DocumentGrid userId={userId} />
    </div>
  );
}