'use client'

import { useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { decodeSharedCode } from '@/lib/utils/share'
import { useEditorStore } from '@/store/editor-store'

export default function SharedPlaygroundPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const router = useRouter()
  const { updateFile } = useEditorStore()
  const resolvedParams = use(params)

  useEffect(() => {
    try {
      const decodedCode = decodeSharedCode(resolvedParams.code)
      updateFile('index.js', decodedCode)
      router.push('/playground/js-ts')
    } catch (error) {
      console.error('Failed to decode shared code:', error)
      router.push('/playground/js-ts')
    }
  }, [resolvedParams.code, router, updateFile])

  return null
}
