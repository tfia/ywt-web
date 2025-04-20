'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, Trash2, BarChartIcon } from 'lucide-react';

import { 
  authApi, 
  getApiErrorMessage, 
  UserListResponse
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";

interface UserData {
  username: string;
  email: string;
  createdAt: string;
}

interface UserStats {
  conversation: number;
  tags: [string, number][];
}

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store username being deleted
  const [isFetchingStats, setIsFetchingStats] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState<UserStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedUsernameForStats, setSelectedUsernameForStats] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authApi.listUsers();
      const formattedUsers = response.data.usernames.map((username, index) => ({
        username,
        email: response.data.emails[index],
        createdAt: response.data.created_at[index],
      }));
      setUsers(formattedUsers);
    } catch (error) {
      toast.error("获取用户列表失败", {
        description: getApiErrorMessage(error),
      });
      setUsers([]); // Clear users on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (username: string) => {
    setIsDeleting(username);
    try {
      await authApi.deleteUser({ username });
      toast.success("用户删除成功", {
        description: `用户 ${username} 已被删除。`,
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error("删除用户失败", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleViewStats = async (username: string) => {
    setSelectedUsernameForStats(username);
    setStatsDialogOpen(true);
    setIsFetchingStats(true);
    setStatsError(null);
    setSelectedUserStats(null);
    try {
      const response = await authApi.getUserStats(username); 
      setSelectedUserStats(response.data);
    } catch (error) {
      setStatsError(getApiErrorMessage(error));
      toast.error("获取用户统计失败", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsFetchingStats(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString); 
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "无效日期";
      }
      
      // Format to Chinese locale and Shanghai timezone
      return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    } catch (e) {
      console.error("Error formatting date:", e); // Log error for debugging
      return "日期格式错误"; // More specific fallback
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">用户管理</h3>
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : users.length === 0 ? (
         <p className="text-center text-gray-500 dark:text-gray-400 py-10">没有找到用户。</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.username}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* Stats Dialog */}
                    <Dialog open={statsDialogOpen && selectedUsernameForStats === user.username} onOpenChange={(open) => { if (!open) setStatsDialogOpen(false); }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStats(user.username)}
                          disabled={isFetchingStats && selectedUsernameForStats === user.username}
                        >
                          <BarChartIcon className="mr-1 h-4 w-4" />
                          统计
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>用户统计: {user.username}</DialogTitle>
                          <DialogDescription>
                            该用户的对话和标签使用情况。
                          </DialogDescription>
                        </DialogHeader>
                        {isFetchingStats ? (
                          <div className="flex justify-center items-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : statsError ? (
                          <p className="text-destructive text-sm py-4">加载统计失败: {statsError}</p>
                        ) : selectedUserStats ? (
                          <div className="py-4 space-y-3">
                            <p><strong>总对话数:</strong> {selectedUserStats.conversation}</p>
                            <div>
                              <strong>标签使用:</strong>
                              {selectedUserStats.tags.length > 0 ? (
                                <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                                  {selectedUserStats.tags.map(([tag, count]) => (
                                    <li key={tag}>{tag}: {count}次</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500 ml-4 mt-1">暂无标签数据</p>
                              )}
                            </div>
                          </div>
                        ) : (
                           <p className="text-sm text-gray-500 py-4">无法加载统计数据。</p>
                        )}
                         <DialogFooter>
                           <DialogClose asChild>
                             <Button variant="outline">关闭</Button>
                           </DialogClose>
                         </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting === user.username}
                        >
                          {isDeleting === user.username ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-1 h-4 w-4" />
                          )}
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除用户？</AlertDialogTitle>
                          <AlertDialogDescription>
                            您确定要永久删除用户 "{user.username}" 吗？此操作无法撤销，将删除用户及其所有相关数据。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting === user.username}>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.username)}
                            disabled={isDeleting === user.username}
                            className="bg-destructive hover:bg-destructive/80"
                          >
                            {isDeleting === user.username ? '删除中...' : '确认删除'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
