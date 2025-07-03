'use client';

import { StyleAnalysisUpload } from '@/components/upload/StyleAnalysisUpload';

export default function UploadSamplesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Set Up Your Writing Style
        </h1>
        <p className="text-lg text-gray-600">
          Upload 3-10 of your writing samples so I can learn your unique voice and style.
          The more samples you provide, the better I can replicate your writing patterns.
        </p>
      </div>

      <StyleAnalysisUpload 
        onAnalysisComplete={() => {
          // Redirect to dashboard or show success message
          window.location.href = '/dashboard';
        }}
      />

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          What makes good writing samples?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">✅ Best samples include:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Recent writing (last 2 years)</li>
              <li>• Documents you wrote personally</li>
              <li>• Different types of content (emails, reports, articles)</li>
              <li>• At least 500 words per document</li>
              <li>• Your natural, unedited voice</li>
              <li>• Formats: PDF, DOCX, or TXT files</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">❌ Avoid these samples:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Heavily edited or collaborative documents</li>
              <li>• Templates or form letters</li>
              <li>• Very short documents (&lt;200 words)</li>
              <li>• Documents with lots of technical jargon only</li>
              <li>• Content written by others</li>
              <li>• Old .doc format (please convert to .docx or .txt)</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">Privacy Notice</p>
              <p className="text-sm text-blue-700 mt-1">
                Your documents are processed securely and used only to create your personal writing style profile. 
                We don&apos;t share your content with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}