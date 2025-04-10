"use client"

import Link from "next/link";
import { useEffect, useState } from "react";

const CACHE_DURATION = 60 * 60 * 1000;

interface CommitCache {
  value: string;
  timestamp: number;
}

export function Footer() {
  const [webCommitId, setWebCommitId] = useState("Loading...");
  const [serverCommitId, setServerCommitId] = useState("Loading...");

  useEffect(() => {
    const getCommitFromCache = (key: string): string | null => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const data: CommitCache = JSON.parse(cached);
          if (Date.now() - data.timestamp < CACHE_DURATION) {
            return data.value;
          }
        }
        return null;
      } catch {
        return null;
      }
    };

    const setCommitToCache = (key: string, value: string) => {
      try {
        const data: CommitCache = {
          value,
          timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // Ignore cache errors
      }
    };

    const fetchCommit = async (repo: string, setCommit: (id: string) => void, cacheKey: string) => {
      const cached = getCommitFromCache(cacheKey);
      if (cached) {
        setCommit(cached);
        return;
      }

      try {
        const res = await fetch(`https://api.github.com/repos/tfia/${repo}/commits/main`);
        const data = await res.json();
        const commitId = data.sha.slice(0, 10);
        setCommit(commitId);
        setCommitToCache(cacheKey, commitId);
      } catch {
        setCommit('unknown');
      }
    };

    fetchCommit('ywt-web', setWebCommitId, 'web-commit-id');
    fetchCommit('ywt-server', setServerCommitId, 'server-commit-id');
  }, []);

  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:gap-4">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          YWT 人机助教系统，清华大学学生作品
        </p>
        <div className="flex space-x-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            基于 Dify 的开源项目
          </p>
          <Link 
            href="/about"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            关于
          </Link>
          <Link 
            href="https://github.com/tfia/ywt-web"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            F: {webCommitId}
          </Link>
          <Link 
            href="https://github.com/tfia/ywt-server"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            B: {serverCommitId}
          </Link>
        </div>
      </div>
    </footer>
  );
}
