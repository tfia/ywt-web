import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as z from "zod"
import pako from 'pako'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const loginSchema = z.object({
  username: z.string().min(1, '用户名至少需要1个字符').max(32, '用户名不能超过32个字符'),
  password: z.string().min(8, '密码至少需要8个字符').max(64, '密码不能超过64个字符'),
})

export const registerSchema = z.object({
  username: z.string().min(1, '用户名至少需要1个字符').max(32, '用户名不能超过32个字符'),
  email: z.string()
    .min(1, '邮箱地址不能为空')
    .max(64, '邮箱地址不能超过64个字符')
    .email('请输入有效的邮箱地址')
    .refine(email => email.endsWith('@mails.tsinghua.edu.cn') || email.endsWith('@tsinghua.edu.cn'), {
      message: '仅支持清华邮箱 (@mails.tsinghua.edu.cn 或 @tsinghua.edu.cn)',
    }),
  password: z.string().min(8, '密码至少需要8个字符').max(64, '密码不能超过64个字符'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

export const modifyUsernameSchema = z.object({
  new_username: z.string().min(1, '用户名至少需要1个字符').max(32, '用户名不能超过32个字符'),
  password: z.string().min(8, '请输入当前密码确认身份').max(64, '密码不能超过64个字符'),
})

export const modifyPasswordSchema = z.object({
  current_password: z.string().min(8, '请输入当前密码').max(64, '密码不能超过64个字符'),
  new_password: z.string().min(8, '新密码至少需要8个字符').max(64, '新密码不能超过64个字符'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "两次输入的密码不一致",
  path: ["confirm_password"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ModifyUsernameFormData = z.infer<typeof modifyUsernameSchema>
export type ModifyPasswordFormData = z.infer<typeof modifyPasswordSchema>

export function compressToken(token: string): string {
  try {
    const tokenData = new TextEncoder().encode(token);
    const compressed = pako.gzip(tokenData);
    const base64 = btoa(
      String.fromCharCode.apply(null, Array.from(compressed))
    );
    return encodeURIComponent(base64);
  } catch (error) {
    console.error('Failed to compress token:', error);
    return '';
  }
}
