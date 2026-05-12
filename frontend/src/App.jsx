import { useState, useEffect, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import { getMe, getChats } from './services/api'
import LoginScreen      from './components/auth/LoginScreen'
import OnboardingScreen from './components/auth/OnboardingScreen'
import AppShell         from './components/layout/AppShell'
import ChatScreen       from './components/chat/ChatScreen'
import ExperienceScreen from './components/experience/ExperienceScreen'
import HistoryScreen    from './components/history/HistoryScreen'
import MyPage           from './components/mypage/MyPage'
import { colors }       from './styles/colors'

export default function App() {
  const { session, user } = useAuth()
  const [profile, setProfile]               = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [tab, setTab]                       = useState('chat')
  const [chatId, setChatId]                 = useState(null)

  const fetchProfile = async () => {
    if (!session) return
    setProfileLoading(true)
    try {
      const data = await getMe()
      setProfile(data)
    } catch {
      // 아직 users 테이블에 없을 수 있음 (최초 로그인)
    } finally {
      setProfileLoading(false)
    }
  }

  // 최근 채팅 로드 (없으면 null — 빈 채팅은 DB에 만들지 않음)
  const initChat = async () => {
    try {
      const chats = await getChats()
      if (chats.length > 0) {
        setChatId(chats[0].id)
      }
      // 채팅이 없으면 chatId는 null 유지 — 첫 메시지 전송 시 생성
    } catch {}
  }

  const handleNewChat = () => {
    // DB 호출 없이 상태만 초기화 — 첫 메시지 전송 시 채팅 생성
    setChatId(null)
    setTab('chat')
  }

  const prevUserIdRef = useRef(null)
  useEffect(() => {
    if (!session) {
      prevUserIdRef.current = null
      return
    }
    // 토큰 갱신(TOKEN_REFRESHED)은 같은 유저 ID → 재조회 불필요
    if (session.user.id === prevUserIdRef.current) return
    prevUserIdRef.current = session.user.id
    fetchProfile()
  }, [session])

  useEffect(() => {
    if (session && profile?.onboarding_completed && !chatId) {
      initChat()
    }
  }, [session, profile])

  // 로딩 중
  if (session === undefined || profileLoading) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: colors.BG,
      }}>
        <p style={{ fontSize: 14, color: colors.TEXT_SECONDARY }}>불러오는 중이에요...</p>
      </div>
    )
  }

  // 비로그인
  if (!session) return <LoginScreen />

  // 온보딩 미완료
  if (!profile?.onboarding_completed) {
    return <OnboardingScreen onComplete={fetchProfile} />
  }

  const apiKeyRegistered = !!profile?.has_api_key

  return (
    <AppShell
      user={user}
      profile={profile}
      apiKeyRegistered={apiKeyRegistered}
      tab={tab}
      setTab={setTab}
      onNewChat={handleNewChat}
    >
      {tab === 'chat'    && <ChatScreen chatId={chatId} setChatId={setChatId} profile={profile} />}
      {tab === 'exp'     && <ExperienceScreen />}
      {tab === 'history' && <HistoryScreen onOpenChat={(id) => { setChatId(id); setTab('chat') }} />}
      {tab === 'my'      && (
        <MyPage
          user={user}
          profile={profile}
          apiKeyRegistered={apiKeyRegistered}
          onApiKeyUpdate={fetchProfile}
        />
      )}
    </AppShell>
  )
}
