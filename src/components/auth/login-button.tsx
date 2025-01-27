'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button variant="outline" onClick={() => signOut()}>
        Sign Out
      </Button>
    )
  }

  return (
    <Button
      onClick={() => signIn('github')}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Github className="w-4 h-4" />
      Sign in with GitHub
    </Button>
  )
}
