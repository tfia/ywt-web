'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, Loader2, MessageSquareTextIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AccountSettings } from '@/components/account-settings';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, getToken, initialize, getRole, isLoading } = useAuthStore();
  const role = getRole();
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (!isLoading) {
      if (role === 'admins') {
        toast.info("重定向", { description: "管理员请访问管理员面板。" });
        router.push('/admin/dashboard');
      } else if (role !== 'users') {
        toast.error("错误", { description: "无法确定用户角色或角色无效，请重新登录。" });
        logout();
        router.push('/login');
      }
    }
  }, [isLoading, role, router, logout]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const copyToClipboard = async () => {
    if (token) {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  const navigateToChat = () => {
    router.push('/chat');
  };

  if (isLoading || role !== 'users') {
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
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="p-6 h-full">
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
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">开发者 Token</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleTokenVisibility}
                      className="flex items-center gap-1"
                    >
                      {showToken ? (
                        <>
                          <EyeOffIcon className="h-4 w-4" />
                          隐藏
                        </>
                      ) : (
                        <>
                          <EyeIcon className="h-4 w-4" />
                          查看
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          已复制
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-4 w-4" />
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex-1 overflow-auto">
                  <p 
                    className={`text-xs font-mono text-gray-800 dark:text-gray-200 break-all transition-all duration-150 ${
                      !showToken ? 'blur-sm hover:blur-[0px]' : ''
                    }`}
                  >
                    {token || 'No token available'}
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">开始答疑</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                  点击按钮，开始与 YWT 人机助教交谈。
                </p>
                <Button 
                  onClick={navigateToChat}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <MessageSquareTextIcon className="h-5 w-5" />
                  开始聊天
                </Button>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card className="p-6 h-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">占位符</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  这个卡片还没想好要干啥。
                </p>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            id="account-settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <AccountSettings role="users" initialize={initialize} logout={logout} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}