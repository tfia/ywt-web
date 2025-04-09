'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { LoginFormData, loginSchema } from '@/lib/utils';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isAdmin, setIsAdmin] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await (isAdmin ? authApi.adminLogin : authApi.login)({
        username: data.username,
        password: data.password
      });
      login(response.data.token);
      router.push('/dashboard');
    } catch (err) {
      toast.error('登录失败', {
        description: `${err}`
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
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">登录账户</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            或{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              注册新账户
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
              <Label htmlFor="password">密码</Label>
              <FormInput
                id="password"
                type="password"
                {...register('password')}
                className="mt-1"
                error={errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="admin-switch">管理员登录</Label>
              <Switch
                id="admin-switch"
                checked={isAdmin}
                onCheckedChange={setIsAdmin}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? '登录中...' : '登录'}
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