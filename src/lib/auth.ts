import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'vibetickets-secret'

export interface User {
  id: string
  email: string
  name: string | null
  role: 'CUSTOMER' | 'AGENT' | 'ADMIN'
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) return null
  
  const decoded = verifyToken(token)
  if (!decoded) return null
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, role: true }
  })
  
  return user
}

export async function signIn(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, password: true }
  })
  
  if (!user || !user.password) return null
  
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null
  
  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })
  
  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token
  }
}

export async function signUp(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
  const hashedPassword = await hashPassword(password)
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'CUSTOMER'
    },
    select: { id: true, email: true, name: true, role: true }
  })
  
  const token = generateToken(user)
  
  return { user, token }
}
