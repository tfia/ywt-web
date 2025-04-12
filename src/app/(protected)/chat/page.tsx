'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { compressToken } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const { getToken } = useAuthStore();
  const [chatUrl, setChatUrl] = useState<string>('');
  
  useEffect(() => {
    const token = getToken();
    if (token) {
      const compressedToken = compressToken(token);
      const baseUrl = process.env.NEXT_PUBLIC_DIFY_CHAT_URL || 'https://dify.ai';
      setChatUrl(`${baseUrl}?tok=${compressedToken}`);
    }
  }, [getToken]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> 返回控制台
          </Button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {chatUrl ? (
            <iframe
              src={chatUrl}
              style={{ width: '100%', height: '100%', minHeight: '700px' }}
              allow="microphone"
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-[700px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
