import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Singleton do Prisma Client.
// Em dev o Next recarrega os modulos a cada save; sem o cache em globalThis
// abririamos uma nova pool de conexoes a cada hot reload ate estourar o
// limite do PostgreSQL.
//
// CONFIGURACAO (.env):
//   DATABASE_URL="postgresql://user:senha@host:5432/epignose?schema=public"
// Em serverless/pooling (Supabase, Neon) use tambem:
//   DIRECT_URL="postgresql://...:5432/..."   # para as migrations
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
