'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { useState } from 'react';
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { modifyPasswordSchema, modifyUsernameSchema, ModifyPasswordFormData, ModifyUsernameFormData } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, getToken, initialize } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = getToken();

  const usernameForm = useForm<ModifyUsernameFormData>({
    resolver: zodResolver(modifyUsernameSchema),
    defaultValues: {
      new_username: '',
      password: '',
    },
  });

  const passwordForm = useForm<ModifyPasswordFormData>({
    resolver: zodResolver(modifyPasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

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

  const onSubmitUsername = async (data: ModifyUsernameFormData) => {
    try {
      setIsSubmitting(true);
      await authApi.modifyUsername({
        new_username: data.new_username,
        password: data.password
      });
      toast.success("用户名修改成功", {
        description: "请重新登录以使用新用户名",
      });
      usernameForm.reset();
      await initialize(); // Refresh user data
    } catch (error) {
      toast.error("修改失败", {
        description: "请确认当前密码是否正确",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword = async (data: ModifyPasswordFormData) => {
    try {
      setIsSubmitting(true);
      await authApi.modifyPassword({
        current_password: data.current_password,
        new_password: data.new_password
      });
      toast.success("密码修改成功", {
        description: "请使用新密码登录",
      });
      passwordForm.reset();
      logout();
      router.push('/login');
    } catch (error) {
      toast.error("修改失败", {
        description: "请确认当前密码是否正确",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Token</h3>
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
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">修改账户信息</h3>
              
              <Tabs defaultValue="username" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="username">修改用户名</TabsTrigger>
                  <TabsTrigger value="password">修改密码</TabsTrigger>
                </TabsList>
                
                <TabsContent value="username" className="mt-4">
                  <Form {...usernameForm}>
                    <form onSubmit={usernameForm.handleSubmit(onSubmitUsername)} className="space-y-4">
                      <FormField
                        control={usernameForm.control}
                        name="new_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>新用户名</FormLabel>
                            <FormControl>
                              <Input placeholder="输入新用户名" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={usernameForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>当前密码</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="输入当前密码以确认身份" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            提交中...
                          </>
                        ) : "修改用户名"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="password" className="mt-4">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="current_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>当前密码</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="输入当前密码" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="new_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>新密码</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="输入新密码" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirm_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>确认新密码</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="再次输入新密码" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            提交中...
                          </>
                        ) : "修改密码"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}