// components/app.jsx — Main app shell + routing (loaded last)
const { useState: useStateApp, useEffect: useEffectApp } = React;

// ── Nav item ──────────────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        padding:'12px 16px', borderRadius:14, border:'none',
        background: active ? '#EEF0FF' : 'transparent',
        color: active ? '#5468FF' : '#52526E',
        fontSize:14, fontWeight: active ? 700 : 500,
        transition:'all 0.18s ease', cursor:'pointer',
        position:'relative',
      }}
      onMouseEnter={e => { if(!active) e.currentTarget.style.background='#F5F6FF'; }}
      onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent'; }}
    >
      <span style={{fontSize:18, width:22, textAlign:'center'}}>{icon}</span>
      <span style={{whiteSpace:'nowrap'}}>{label}</span>
      {badge > 0 && (
        <span style={{
          marginLeft:'auto', minWidth:20, height:20, borderRadius:99,
          background:'#5468FF', color:'#fff',
          fontSize:11, fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'0 6px',
        }}>{badge}</span>
      )}
      {active && (
        <div style={{
          position:'absolute', left:0, top:'50%', transform:'translateY(-50%)',
          width:3, height:24, borderRadius:99,
          background:'#5468FF',
        }} />
      )}
    </button>
  );
}

// ── App shell (sidebar + content) ────────────────────────────────────────────
function AppShell({ user, experiences, setExperiences, apiKey, setApiKey }) {
  const [tab, setTab] = useStateApp('chat');

  return (
    <div style={{
      display:'flex', width:'100vw', height:'100vh',
      background:'#F5F6FF', overflow:'hidden',
    }}>
      {/* Sidebar */}
      <div style={{
        width:240, flexShrink:0,
        background:'#fff',
        borderRight:'1px solid #F0F1FA',
        display:'flex', flexDirection:'column',
        padding:'24px 16px',
        boxShadow:'2px 0 16px rgba(84,104,255,0.04)',
      }}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'0 8px',marginBottom:32}}>
          <div style={{
            width:36, height:36, borderRadius:11,
            background:'linear-gradient(135deg,#5468FF,#8B5CF6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:16, color:'#fff', fontWeight:800,
          }}>✦</div>
          <div style={{overflow:'hidden',minWidth:0}}>
            <div style={{fontSize:14,fontWeight:800,color:'#1A1A2E',letterSpacing:'-0.3px',whiteSpace:'nowrap'}}>취준 에이전트</div>
            <div style={{fontSize:11,color:'#9CA3B8',whiteSpace:'nowrap'}}>AI 취업 도우미</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{display:'flex',flexDirection:'column',gap:4,flex:1}}>
          <NavItem icon="💬" label="AI 챗봇" active={tab==='chat'} onClick={() => setTab('chat')} />
          <NavItem icon="📂" label="내 경험" active={tab==='exp'} onClick={() => setTab('exp')}
            badge={experiences.length} />
          <NavItem icon="👤" label="마이페이지" active={tab==='my'} onClick={() => setTab('my')} />
        </div>

        {/* API key status indicator */}
        <div style={{
          padding:'10px 12px',borderRadius:12,
          background: apiKey ? '#EFFDF8' : '#FFF7ED',
          border: apiKey ? '1px solid #10B98120' : '1px solid #F59E0B20',
          marginBottom:12,
          display:'flex',alignItems:'center',gap:8,
          cursor:'pointer',
        }} onClick={() => setTab('my')}>
          <div style={{
            width:7,height:7,borderRadius:'50%',flexShrink:0,
            background: apiKey ? '#10B981' : '#F59E0B',
          }} />
          <span style={{
            fontSize:11,fontWeight:600,
            color: apiKey ? '#10B981' : '#F59E0B',
            whiteSpace:'nowrap',
          }}>{apiKey ? 'API 키 연결됨' : 'API 키 미등록'}</span>
        </div>

        {/* User info */}
        <div style={{
          padding:'14px 12px', borderRadius:14,
          background:'#F5F6FF', border:'1px solid #E8EAFA',
          display:'flex', alignItems:'center', gap:10,
          cursor:'pointer',
        }} onClick={() => setTab('my')}>
          <div style={{
            width:34, height:34, borderRadius:'50%',
            background:'linear-gradient(135deg,#5468FF,#8B5CF6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14, color:'#fff', fontWeight:700, flexShrink:0,
          }}>
            {(user?.name||'?')[0]}
          </div>
          <div style={{overflow:'hidden'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#1A1A2E',
              whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
              {user?.name}
            </div>
            <div style={{fontSize:11,color:'#9CA3B8',
              whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden'}}>
        {tab === 'chat' && <ChatScreen user={user} experiences={experiences} />}
        {tab === 'exp'  && <ExperienceScreen experiences={experiences} setExperiences={setExperiences} />}
        {tab === 'my'   && <MyPage user={user} apiKey={apiKey} setApiKey={setApiKey} />}
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
function App() {
  const [screen, setScreen] = useStateApp('login');
  const [user, setUser] = useStateApp(null);
  const [experiences, setExperiences] = useStateApp([]);
  const [apiKey, setApiKey] = useStateApp('');

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen('onboarding');
  };

  const handleOnboardingComplete = (userData) => {
    setUser(userData);
    if (userData.experiences?.length) setExperiences(userData.experiences);
    if (userData.apiKey) setApiKey(userData.apiKey);
    setScreen('main');
  };

  if (screen === 'login') return <LoginScreen onLogin={handleLogin} />;
  if (screen === 'onboarding') return <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />;
  return (
    <AppShell
      user={user}
      experiences={experiences}
      setExperiences={setExperiences}
      apiKey={apiKey}
      setApiKey={setApiKey}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
