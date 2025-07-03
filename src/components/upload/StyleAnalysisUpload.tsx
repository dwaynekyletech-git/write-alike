'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedText?: string;
  error?: string;
}

interface StyleAnalysisUploadProps {
  onAnalysisComplete?: (styleProfile: unknown) => void;
}

export function StyleAnalysisUpload({ onAnalysisComplete }: StyleAnalysisUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles
      .filter(file => 
        file.type === 'application/pdf' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'text/plain' ||
        file.name.endsWith('.pdf') || 
        file.name.endsWith('.docx') ||
        file.name.endsWith('.txt')
      )
      .map(file => ({
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending' as const
      }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Process each file
    newFiles.forEach(processFile);
  }, []);

  const processFile = async (uploadedFile: UploadedFile) => {
    setUploadedFiles(prev => 
      prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'processing' } : f)
    );

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);

      const response = await fetch('/api/upload/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const result = await response.json();

      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'completed', extractedText: result.text }
            : f
        )
      );
    } catch {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error', error: 'Failed to process file' }
            : f
        )
      );
    }
  };

  const analyzeStyle = async () => {
    const completedFiles = uploadedFiles.filter(f => f.status === 'completed' && f.extractedText);
    
    if (completedFiles.length < 2) {
      alert('Please upload at least 2 documents for style analysis');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/ai/analyze-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: completedFiles.map(f => ({
            filename: f.file.name,
            content: f.extractedText
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze style');
      }

      const styleProfile = await response.json();
      onAnalysisComplete?.(styleProfile);
    } catch {
      alert('Failed to analyze writing style. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: true
  });

  const completedCount = uploadedFiles.filter(f => f.status === 'completed').length;
  const canAnalyze = completedCount >= 2 && !isAnalyzing;

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Upload Your Writing Samples
          </h2>
          <p className="text-gray-600">
            Upload 3-10 of your documents (PDF or DOCX) so I can learn your unique writing style
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isDragActive ? (
              <p className="text-lg text-blue-600">Drop your files here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-700">
                  Drag and drop your files here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOCX, and TXT files
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uploaded Files ({completedCount}/{uploadedFiles.length} processed)
          </h3>
          
          <div className="space-y-3">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${uploadedFile.status === 'completed' ? 'bg-green-500' : ''}
                    ${uploadedFile.status === 'processing' ? 'bg-blue-500 animate-pulse' : ''}
                    ${uploadedFile.status === 'error' ? 'bg-red-500' : ''}
                    ${uploadedFile.status === 'pending' ? 'bg-gray-400' : ''}
                  `} />
                  <span className="text-sm font-medium text-gray-900">
                    {uploadedFile.file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 capitalize">
                    {uploadedFile.status === 'processing' ? 'Processing...' : uploadedFile.status}
                  </span>
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {completedCount < 2 && (
                  <span>Upload at least 2 documents to analyze your style</span>
                )}
                {completedCount >= 2 && (
                  <span className="text-green-600">Ready for style analysis!</span>
                )}
              </div>
              
              <Button
                onClick={analyzeStyle}
                disabled={!canAnalyze}
                className={`
                  ${canAnalyze 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                {isAnalyzing ? 'Analyzing Style...' : 'Analyze My Writing Style'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}