'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RegisterFormData, registerSchema } from '@/lib/utils';
import { authApi, getApiErrorMessage } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (!isLoading && isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password
      });
      toast.success('注册成功，请查收激活邮件');
      router.push(`/activate?username=${data.username}`);
    } catch (error) {
      toast.error('注册失败', {
        description: getApiErrorMessage(error),
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">注册账户</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            或{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              登录已有账户
            </Link>
          </p>
        </div>
        
        <Card className="p-6 shadow-lg dark:border-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="username">用户名</Label>
              <FormInput
                id="username"
                type="text"
                {...register('username')}
                className="mt-1"
                error={errors.username?.message}
              />
            </div>

            <div>
              <Label htmlFor="email">清华邮箱地址</Label>
              <FormInput
                id="email"
                type="email"
                {...register('email')}
                className="mt-1"
                error={errors.email?.message}
              />
            </div>

            <div>
              <Label htmlFor="password">密码</Label>
              <FormInput
                id="password"
                type="password"
                {...register('password')}
                className="mt-1"
                error={errors.password?.message}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">确认密码</Label>
              <FormInput
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="mt-1"
                error={errors.confirmPassword?.message}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? '注册中...' : '注册'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
            >
              返回主页
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}