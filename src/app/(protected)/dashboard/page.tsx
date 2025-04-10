'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">欢迎回来，{user?.username}</h2>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">个人信息</h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">用户名：</span>
                    <span className="font-medium text-gray-900 dark:text-white">{user?.username}</span>
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">邮箱：</span>
                    <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">注册时间：</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user?.createdAt && new Date(user.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}