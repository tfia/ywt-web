'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { Loader2, MailIcon } from 'lucide-react';
import { AccountSettings } from '@/components/account-settings';
import { authApi, getApiErrorMessage } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserManagement } from '@/components/user-management';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, getRole, isLoading, initialize } = useAuthStore();
  const role = getRole();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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

  // Function to handle sending email
  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      await authApi.sendEmail();
      toast.success("邮件发送成功", {
        description: "邮件已成功触发发送。",
      });
    } catch (error) {
      toast.error("邮件发送失败", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsSendingEmail(false);
    }
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <UserManagement />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="p-6 h-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">邮件服务</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                手动触发周报的发送。会向所有用户发送邮件，请谨慎使用。
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    disabled={isSendingEmail}
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        发送中...
                      </>
                    ) : (
                      <>
                        <MailIcon className="mr-2 h-4 w-4" />
                        发送邮件通知
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认发送邮件？</AlertDialogTitle>
                    <AlertDialogDescription>
                      您确定要向所有用户发送邮件通知吗？此操作可能需要一些时间，请勿重复点击。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSendingEmail}>取消</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleSendEmail} 
                      disabled={isSendingEmail}
                    >
                      {isSendingEmail ? '发送中...' : '确认发送'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </motion.div>
          
          <motion.div
            id="account-settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <AccountSettings role="admins" initialize={initialize} logout={logout} />
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

