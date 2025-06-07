'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Card, CardBody, CardHeader } from '@nextui-org/react'
import { EyeSlashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast, { Toaster } from 'react-hot-toast'
import { Shield, Lock, Mail } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function AdminLogin() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const toggleVisibility = () => setIsVisible(!isVisible)

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error('Email atau password salah')
        return
      }

      if (authData.user) {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role, name')
          .eq('id', authData.user.id)
          .single()

        if (profileError || !profile) {
          toast.error('Profil pengguna tidak ditemukan')
          await supabase.auth.signOut()
          return
        }

        if (!['super_admin', 'admin', 'editor'].includes(profile.role)) {
          toast.error('Anda tidak memiliki akses ke admin panel')
          await supabase.auth.signOut()
          return
        }

        toast.success(`Selamat datang, ${profile.name || 'Admin'}!`)
        router.push('/admin/dashboard')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan, coba lagi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="flex flex-col items-center pb-2 pt-8">
          <div className="w-16 h-16 bg-admin-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-600 text-center">
            Masuk ke dashboard administrasi
          </p>
        </CardHeader>

        <CardBody className="px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="admin@hokistore.com"
                labelPlacement="outside"
                startContent={
                  <Mail className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                }
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                variant="bordered"
                className="w-full"
              />

              <Input
                {...register('password')}
                label="Password"
                placeholder="Masukkan password"
                labelPlacement="outside"
                startContent={
                  <Lock className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                }
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashIcon className="w-4 h-4 text-default-400 pointer-events-none" />
                    ) : (
                      <EyeIcon className="w-4 h-4 text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                variant="bordered"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-semibold bg-admin-primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Masuk...' : 'Masuk ke Admin'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Butuh bantuan?{' '}
              <a href="mailto:admin@hokistore.com" className="text-admin-primary hover:underline">
                Hubungi IT Support
              </a>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 