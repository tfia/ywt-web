import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as z from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const loginSchema = z.object({
  username: z.string().min(2, '用户名至少需要2个字符'),
  password: z.string().min(6, '密码至少需要6个字符'),
})

export const registerSchema = z.object({
  username: z.string().min(2, '用户名至少需要2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

export const modifyUsernameSchema = z.object({
  new_username: z.string().min(2, '用户名至少需要2个字符'),
  password: z.string().min(6, '请输入当前密码确认身份'),
})

export const modifyPasswordSchema = z.object({
  current_password: z.string().min(6, '请输入当前密码'),
  new_password: z.string().min(6, '新密码至少需要6个字符'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "两次输入的密码不一致",
  path: ["confirm_password"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ModifyUsernameFormData = z.infer<typeof modifyUsernameSchema>
export type ModifyPasswordFormData = z.infer<typeof modifyPasswordSchema>
