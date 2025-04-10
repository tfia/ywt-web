'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (!isLoading && isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-4xl px-4 text-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              欢迎使用 YWT 人机助教系统
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              不止能解答你的《电电》学习问题
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-4"
          >
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto min-w-[140px]">
                立即登录
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[140px]">
                注册账户
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.4 + index * 0.1,
                }}
                className="h-full"
              >
                <Card className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                  {index === 0 && (
                    <>
                      <h3 className="text-lg font-semibold mb-2">功能丰富</h3>
                      <p className="text-gray-600 dark:text-gray-300 flex-grow">
                        不仅对话答疑，还可推荐题目，更有答疑周报推送
                      </p>
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <h3 className="text-lg font-semibold mb-2">自主研发</h3>
                      <p className="text-gray-600 dark:text-gray-300 flex-grow">
                        由电子系及计算机系学生自主开发，且获《电电》课程组授权
                      </p>
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <h3 className="text-lg font-semibold mb-2">响应迅速</h3>
                      <p className="text-gray-600 dark:text-gray-300 flex-grow">
                        使用 ChatGLM API，高稳定性，随时待命
                      </p>
                    </>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
