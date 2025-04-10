'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full mx-4"
      >
        <Card className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center">关于 YWT</h1>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>YWT 是一个面向《电子电路与系统基础》课程的助教智能体系统。YWT 是 Your Web TA 的简写，旨在帮助学生更好地理解和掌握课程内容，提供智能化的学习支持。</p>
            <p>YWT 的基本功能基于 Dify 平台，通过调用在 Dify 上创建的 Chatflow 与大语言模型 (LLMs) 进行交互，并利用我们预处理的知识库进行答疑与解题。此外，我们自主实现并部署了账号与数据库系统，及其配套的前端（此页面），进一步扩展智能体的功能，实现了答疑追踪等实用功能。</p>
            <p>主要功能：</p>
            <ul className="list-disc list-inside space-y-2">
              <li>智能问答辅导</li>
              <li>个性化题目推荐</li>
              <li>学习进度追踪</li>
              <li>答疑周报服务</li>
            </ul>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="w-full"
          >
            返回主页
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
