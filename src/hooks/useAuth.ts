'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async (email: string, password: string, nickname: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
        },
      },
    })

    if (error) {
      // Supabase Auth 에러를 한국어로 변환
      if (error.message.includes('already registered')) {
        throw new Error('이미 가입된 이메일입니다.')
      }
      if (error.message.includes('invalid email')) {
        throw new Error('올바른 이메일 형식이 아닙니다.')
      }
      if (error.message.includes('weak password')) {
        throw new Error('비밀번호는 8자 이상이어야 합니다.')
      }
      throw new Error('회원가입에 실패했습니다. 다시 시도해주세요.')
    }

    // users 테이블에 프로필 데이터 삽입 (중복 시 upsert)
    if (data.user) {
      const { error: upsertError } = await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email!,
        nickname,
        auth_provider: 'email',
      }, {
        onConflict: 'id',
      })

      if (upsertError) {
        console.error('Error creating user profile:', upsertError)

        // DB 에러를 한국어로 변환
        if (upsertError.message.includes('duplicate') || upsertError.code === '23505') {
          throw new Error('이미 사용 중인 닉네임입니다.')
        }
        throw new Error('회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    }

    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Supabase Auth 에러를 한국어로 변환
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('이메일 인증이 필요합니다. 이메일을 확인해주세요.')
      }
      throw new Error('로그인에 실패했습니다. 다시 시도해주세요.')
    }
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // 로그아웃 후 메인페이지로 리다이렉트
    window.location.href = '/'
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }
}
