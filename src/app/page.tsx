'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
// import Image from "next/image";

export default function Home() {
  const router = useRouter()

  // Redirect to dashboard after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-[32px] row-start-2 items-center'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold mb-4'>
            AI-powered Service Business Automation
          </h1>
          <p className='text-xl mb-8'>Redirecting to dashboard...</p>
        </div>

        <div className='relative w-16 h-16 animate-spin'>
          <div className='absolute w-full h-full border-4 border-t-foreground border-r-transparent border-b-transparent border-l-transparent rounded-full'></div>
        </div>
      </main>
    </div>
  )
}
