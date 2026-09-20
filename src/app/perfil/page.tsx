import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { currentUser } from '@/lib/mock-data'

/** /perfil sempre leva ao perfil de quem esta logado. */
export default async function MeuPerfilPage() {
  const user = (await getCurrentUser()) ?? currentUser
  redirect(`/perfil/${user.handle}`)
}
