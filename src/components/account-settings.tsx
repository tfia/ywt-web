'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { modifyPasswordSchema, modifyUsernameSchema, ModifyPasswordFormData, ModifyUsernameFormData } from '@/lib/utils';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface AccountSettingsProps {
  role: 'admins' | 'users';
  initialize: () => Promise<void>;
  logout: () => void;
}

export function AccountSettings({ role, initialize, logout }: AccountSettingsProps) {
  const router = useRouter();
  const [isSubmittingUsername, setIsSubmittingUsername] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const onSubmitUsername = async (data: ModifyUsernameFormData) => {
    setIsSubmittingUsername(true);
    try {
      await authApi.modifyUsername({
        new_username: data.new_username,
        password: data.password,
        role: role
      });
      toast.success("用户名修改成功", {
        description: "用户信息已更新",
      });
      usernameForm.reset();
      await initialize(); // Re-fetch user data
    } catch (error) {
      toast.error("修改失败", {
        description: `请确认当前密码是否正确 (${error})`,
      });
    } finally {
      setIsSubmittingUsername(false);
    }
  };

  const onSubmitPassword = async (data: ModifyPasswordFormData) => {
    setIsSubmittingPassword(true);
    try {
      await authApi.modifyPassword({
        current_password: data.current_password,
        new_password: data.new_password,
        role: role
      });
      toast.success("密码修改成功", {
        description: "请使用新密码重新登录",
      });
      passwordForm.reset();
      logout();
      router.push('/login');
    } catch (error) {
      toast.error("修改失败", {
        description: `请确认当前密码是否正确 (${error})`,
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authApi.deleteAccount({ role: role });
      toast.success("账户已删除", {
        description: "您的账户信息已被永久移除。",
      });
      logout();
      router.push('/');
    } catch (error) {
      toast.error("删除失败", {
        description: `无法删除账户，请稍后再试 (${error})`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">修改账户信息</h3>
      
      <Tabs defaultValue="username" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="username">修改用户名</TabsTrigger>
          <TabsTrigger value="password">修改密码</TabsTrigger>
          <TabsTrigger value="delete" className="text-destructive">删除账户</TabsTrigger>
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
                disabled={isSubmittingUsername}
              >
                {isSubmittingUsername ? (
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
                disabled={isSubmittingPassword}
              >
                {isSubmittingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : "修改密码"}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="delete" className="mt-4">
          <div className="space-y-4 p-4 border border-destructive/50 rounded-lg bg-destructive/10 dark:bg-destructive/20">
            <h4 className="font-semibold text-destructive">危险操作：删除账户</h4>
            <p className="text-sm text-destructive/90 dark:text-destructive/80">
              此操作将永久删除您的账户及其所有相关数据。此操作无法撤销。请谨慎操作。
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      删除中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      我确认要删除我的账户
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除账户？</AlertDialogTitle>
                  <AlertDialogDescription>
                    您确定要永久删除您的账户吗？所有数据将丢失且无法恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount} 
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/70"
                  >
                    {isDeleting ? '删除中...' : '确认删除'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
