// Modulo exclusivo de servidor.
import { currentUser as demoUser } from './mock-data'
import { features } from './env'
import type { Author } from '@/types'

// ---------------------------------------------------------------------------
// AUTENTICACAO — ponto de extensao.
//
// O scaffold sobe com um usuario de demonstracao para que todo o fluxo
// (postar, comentar, avaliar, buscar) seja navegavel sem login.
//
// >>> COMO PLUGAR AUTENTICACAO REAL <<<
//
// Opcao A — NextAuth / Auth.js (recomendado para e-mail + OAuth institucional):
//   1. npm install next-auth@beta @auth/prisma-adapter
//   2. Crie src/auth.ts com o handler e o PrismaAdapter(prisma).
//   3. .env:  AUTH_SECRET="..."  (openssl rand -base64 32)
//             AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET, se usar Google.
//   4. Troque o corpo de getCurrentUser() por:
//        const session = await auth()
//        return session?.user ? toAuthor(session.user) : null
//
// Opcao B — Supabase Auth (se ja usa Supabase para storage):
//   createServerClient(...).auth.getUser()
//
// Opcao C — ORCID OAuth: o login mais natural para pesquisadores, pois ja
//   traz instituicao e producao cientifica. https://info.orcid.org/documentation
// ---------------------------------------------------------------------------

/** Usuario da requisicao atual, ou null se anonimo. */
export async function getCurrentUser(): Promise<Author | null> {
  // TODO: substituir pela sessao real (ver opcoes acima).
  return demoUser
}

/** Usa em Server Actions que exigem login. Lanca se nao houver sessao. */
export async function requireUser(): Promise<Author> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Você precisa estar autenticado para realizar esta ação.')
  return user
}

/** true quando a app esta rodando sem banco — a UI mostra o aviso de demo. */
export const isDemoMode = !features.database
