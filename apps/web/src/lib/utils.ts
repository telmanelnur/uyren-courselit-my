import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const isDateInFuture = (dateStr: Date): boolean => {
  return new Date(dateStr).getTime() > new Date().getTime()
}

export const generateEmailFrom = ({
  name,
  email,
}: {
  name: string
  email: string
}) => {
  return `${name} <${email}>`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
