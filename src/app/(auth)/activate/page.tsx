'use client';

import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { authApi } from '@/lib/api';

// Define activation form schema
const activationSchema = z.object({
  code: z.string().min(1, '激活码不能为空')
});

type ActivationFormData = z.infer<typeof activationSchema>;

// Separate component that uses URL parameters safely
function ActivateForm() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Safely access window only on the client side
  useEffect(() => {
    // Parse the username from the URL only on the client side
    const searchParams = new URLSearchParams(window.location.search);
    const usernameParam = searchParams.get('username');
    setUsername(usernameParam);
    
    if (!usernameParam) {
      toast.error('缺少用户名参数');
      router.push('/register');
    }
  }, [router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ActivationFormData>({
    resolver: zodResolver(activationSchema)
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const onSubmit = async (data: ActivationFormData) => {
    if (!username) return;
    
    setIsVerifying(true);
    try {
      await authApi.verifyEmail(username, data.code);
      toast.success('账号激活成功，请登录');
      router.push('/login');
    } catch (err) {
      toast.error('激活失败', {
        description: `${err}`
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Show loading state while username is being determined
  if (!username && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">正在加载...</p>
      </div>
    );
  }

  if (!isLoading && isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">激活账户</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            请输入发送到您邮箱的激活码来激活您的账户
          </p>
        </div>
        
        <Card className="p-6 shadow-lg dark:border-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="username">用户名</Label>
              <FormInput
                id="username"
                type="text"
                value={username || ''}
                disabled
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="code">激活码</Label>
              <FormInput
                id="code"
                type="text"
                {...register('code')}
                className="mt-1"
                error={errors.code?.message}
                placeholder="请输入邮件中的激活码"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isVerifying}
            >
              {isSubmitting || isVerifying ? '激活中...' : '激活账户'}
            </Button>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                className="text-sm"
                onClick={() => router.push('/register')}
              >
                返回注册
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="text-sm"
                onClick={() => router.push('/login')}
              >
                去登录
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

// Main component with Suspense
export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">加载中...</p>
      </div>
    }>
      <ActivateForm />
    </Suspense>
  );
}
