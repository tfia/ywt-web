'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Loader2, Trash2, BarChartIcon, SearchIcon, MailIcon } from 'lucide-react';

import { 
  authApi, 
  getApiErrorMessage, 
  UserListResponse
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/store';

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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isFetchingStats, setIsFetchingStats] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState<UserStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedUsernameForStats, setSelectedUsernameForStats] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedUsernameForEmail, setSelectedUsernameForEmail] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState('');
  const [emailTitle, setEmailTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user: adminUser } = useAuthStore();

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
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleDeleteUser = async (username: string) => {
    setIsDeleting(username);
    try {
      await authApi.deleteUser({ username });
      toast.success("用户删除成功", {
        description: `用户 ${username} 已被删除。`,
      });
      fetchUsers();
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

  const handleSendEmail = async (username: string) => {
    setSelectedUsernameForEmail(username);
    setEmailDialogOpen(true);
    setEmailContent('');
    setEmailTitle('');
  };

  const handleConfirmSendEmail = async () => {
    if (!selectedUsernameForEmail || !emailContent.trim() || !emailTitle.trim()) {
      toast.error("发送失败", { description: "用户名、标题或邮件内容不能为空。" });
      return;
    }

    setIsSendingEmail(true);
    try {
      await authApi.sendSingleEmail({
        username: selectedUsernameForEmail,
        title: emailTitle,
        content: emailContent
      });
      toast.success("邮件发送成功", {
        description: `已向用户 ${selectedUsernameForEmail} 发送邮件。`,
      });
      setEmailDialogOpen(false);
    } catch (error) {
      toast.error("邮件发送失败", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString); 
      
      if (isNaN(date.getTime())) {
        return "无效日期";
      }
      
      return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "日期格式错误";
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">用户管理</h3>
      
      <div className="mb-4 relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="按邮箱搜索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full sm:w-64"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
         <p className="text-center text-gray-500 dark:text-gray-400 py-10">
           {searchTerm ? '没有找到匹配的用户。' : '没有找到用户。'}
         </p>
      ) : (
        <>
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
                {currentUsers.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStats(user.username)}
                        disabled={isFetchingStats && selectedUsernameForStats === user.username}
                      >
                        <BarChartIcon className="mr-1 h-4 w-4" />
                        统计
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(user.username)}
                        disabled={isSendingEmail && selectedUsernameForEmail === user.username}
                      >
                        <MailIcon className="mr-1 h-4 w-4" />
                        发送邮件
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          document.getElementById(`delete-dialog-${user.username}`)?.click();
                        }}
                        disabled={isDeleting === user.username}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        删除
                      </Button>

                      <Dialog 
                        open={statsDialogOpen && selectedUsernameForStats === user.username} 
                        onOpenChange={(open) => {
                          if (!open) setStatsDialogOpen(false);
                        }}
                      >
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

                      <Dialog 
                        open={emailDialogOpen && selectedUsernameForEmail === user.username} 
                        onOpenChange={(open) => {
                          if (!open) setEmailDialogOpen(false);
                        }}
                      >
                        <DialogContent className="max-w-[650px] w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
                          <DialogHeader>
                            <DialogTitle>发送邮件给: {user.username}</DialogTitle>
                            <DialogDescription>
                              邮件将发送到 {user.email}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
                            <div className="space-y-4">
                              <Label htmlFor="email-title" className="text-base">邮件标题</Label>
                              <Input 
                                id="email-title"
                                placeholder="请输入邮件标题..."
                                value={emailTitle}
                                onChange={(e) => setEmailTitle(e.target.value)}
                                className="text-base"
                              />
                              
                              <Label htmlFor="email-content" className="text-base">邮件内容</Label>
                              <Textarea 
                                id="email-content"
                                placeholder="请输入您要发送的邮件内容..."
                                value={emailContent}
                                onChange={(e) => setEmailContent(e.target.value)}
                                rows={6}
                                className="resize-none text-base min-h-[200px]"
                              />
                              <p className="flex items-center text-sm text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="16" x2="12" y2="12"></line>
                                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                以下信息会被自动附加在邮件末尾
                              </p>
                              <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground border border-muted">
                                <p className="flex items-center">
                                  {`此邮件由 ${adminUser?.username} \<${adminUser?.email}\> 触发 YWT Bot 发送。若要回复，请直接回复发件人。`}
                                </p>
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="border-t pt-4 mt-2 sticky bottom-0 bg-background">
                            <DialogClose asChild>
                              <Button variant="outline" disabled={isSendingEmail}>取消</Button>
                            </DialogClose>
                            <Button 
                              onClick={handleConfirmSendEmail} 
                              disabled={isSendingEmail || !emailContent.trim() || !emailTitle.trim()}
                              className="min-w-[100px]"
                            >
                              {isSendingEmail ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  发送中...
                                </>
                              ) : (
                                '发送邮件'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Hidden trigger for delete dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            id={`delete-dialog-${user.username}`}
                            className="hidden"
                            type="button"
                          >
                            Hidden Delete Button
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除用户？</AlertDialogTitle>
                            <AlertDialogDescription>
                              您确定要永久删除用户 {user.username} 吗？此操作无法撤销，将删除用户及其所有相关数据。
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

          {totalPages > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="items-per-page" className="text-sm text-muted-foreground whitespace-nowrap">每页显示:</Label>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger id="items-per-page" className="w-[70px]">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(Math.max(1, currentPage - 1));
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages).keys()].map((page) => (
                      <PaginationItem key={page + 1}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page + 1);
                          }}
                          isActive={currentPage === page + 1}
                        >
                          {page + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(Math.min(totalPages, currentPage + 1));
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
