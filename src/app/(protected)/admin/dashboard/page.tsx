'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AccountSettings } from '@/components/account-settings';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, getRole, isLoading, initialize } = useAuthStore();
  const role = getRole();

  // Redirect non-admins or handle loading state
  useEffect(() => {
    if (!isLoading) {
      if (role !== 'admins') {
        toast.error("无权访问", { description: "您不是管理员。" });
        router.push('/dashboard'); // Redirect non-admins to user dashboard
      }
    }
  }, [isLoading, role, router]);

  // Re-fetch profile info if user is null but should be logged in
  useEffect(() => {
    if (!user && role === 'admins' && !isLoading) {
      initialize();
    }
  }, [user, role, isLoading, initialize]);


  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading || role !== 'admins') {
    // Show loading indicator or null while checking role/loading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">管理员面板</h2>
              <p className="text-gray-600 dark:text-gray-400">欢迎，{user?.username}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6 h-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">个人信息</h3>
              {user ? (
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">用户名：</span>
                    <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">邮箱：</span>
                    <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">注册时间：</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(user.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </p>
                </div>
              ) : (
                 <p className="text-gray-600 dark:text-gray-400">正在加载用户信息...</p>
              )}
            </Card>
          </motion.div>

          {/* Render AccountSettings component for admin */}
          <motion.div
            id="account-settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }} // Adjust delay as needed
          >
            <AccountSettings role="admins" initialize={initialize} logout={logout} />
          </motion.div>

          {/* Add more admin-specific components here later */}

        </motion.div>
      </div>
    </div>
  );
}

