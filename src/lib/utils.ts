import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'OPEN':
      return 'bg-blue-100 text-blue-800'
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800'
    case 'WAITING_CUSTOMER':
      return 'bg-purple-100 text-purple-800'
    case 'RESOLVED':
      return 'bg-green-100 text-green-800'
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'LOW':
      return 'bg-gray-100 text-gray-800'
    case 'MEDIUM':
      return 'bg-blue-100 text-blue-800'
    case 'HIGH':
      return 'bg-orange-100 text-orange-800'
    case 'CRITICAL':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function calculateSLADeadline(priority: string, createdAt: Date): Date {
  const hours = {
    LOW: 24,
    MEDIUM: 8,
    HIGH: 4,
    CRITICAL: 1
  }[priority] || 8

  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000)
}

export function isSLABreached(deadline: Date | null): boolean {
  if (!deadline) return false
  return new Date() > new Date(deadline)
}

export function getSLAStatus(deadline: Date | null): { status: string; color: string } {
  if (!deadline) return { status: 'N/A', color: 'text-gray-500' }
  
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  const hoursLeft = diff / (1000 * 60 * 60)
  
  if (diff < 0) {
    return { status: 'Breached', color: 'text-red-600' }
  } else if (hoursLeft < 2) {
    return { status: 'Critical', color: 'text-orange-600' }
  } else if (hoursLeft < 8) {
    return { status: 'Warning', color: 'text-yellow-600' }
  }
  return { status: 'On Track', color: 'text-green-600' }
}
