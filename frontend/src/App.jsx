import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { getMe, getChats, createChat } from './services/api'
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

  // 최근 채팅 로드 또는 새 채팅 생성
  const initChat = async () => {
    try {
      const chats = await getChats()
      if (chats.length > 0) {
        setChatId(chats[0].id)
      } else {
        const chat = await createChat({ title: '새 자소서 작업' })
        setChatId(chat.id)
      }
    } catch {}
  }

  const handleNewChat = async () => {
    try {
      const chat = await createChat({ title: '새 자소서 작업' })
      setChatId(chat.id)
      setTab('chat')
    } catch {}
  }

  useEffect(() => {
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
      {tab === 'chat'    && <ChatScreen chatId={chatId} setChatId={setChatId} />}
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
