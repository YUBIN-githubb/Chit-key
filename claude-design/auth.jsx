// components/auth.jsx — Login + Onboarding screens
const { useState, useRef, useEffect } = React;

// ── Google icon SVG ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{flexShrink:0}}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ── Agent pill used on login card ────────────────────────────────────────────
function AgentPill({ icon, label, color }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:6,
      padding:'6px 12px', borderRadius:99,
      background: color + '12', border:`1.5px solid ${color}28`,
    }}>
      <span style={{fontSize:14}}>{icon}</span>
      <span style={{fontSize:12, fontWeight:600, color, whiteSpace:'nowrap'}}>{label}</span>
    </div>
  );
}

// ── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => onLogin({ name: '김취준', email: 'user@gmail.com' }), 1400);
  };

  return (
    <div style={{
      width:'100vw', height:'100vh',
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(145deg,#EEF0FF 0%,#F5F6FF 55%,#FFF3EE 100%)',
      position:'relative', overflow:'hidden',
    }}>
      {/* decorative blobs */}
      <div style={{position:'absolute',width:480,height:480,borderRadius:'50%',
        background:'radial-gradient(circle,rgba(84,104,255,0.13) 0%,transparent 70%)',
        top:-120,left:-140,pointerEvents:'none'}} />
      <div style={{position:'absolute',width:320,height:320,borderRadius:'50%',
        background:'radial-gradient(circle,rgba(16,185,129,0.09) 0%,transparent 70%)',
        bottom:-80,right:-80,pointerEvents:'none'}} />

      <div className="anim-fadeUp" style={{
        background:'#fff', borderRadius:28, padding:'48px 44px',
        width:420, boxShadow:'0 8px 56px rgba(84,104,255,0.13),0 2px 8px rgba(0,0,0,0.04)',
        display:'flex', flexDirection:'column', position:'relative', zIndex:1,
      }}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:28}}>
          <div style={{
            width:42,height:42,borderRadius:13,
            background:'linear-gradient(135deg,#5468FF 0%,#8B5CF6 100%)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:20,color:'#fff',fontWeight:800,letterSpacing:-1,
          }}>✦</div>
          <span style={{fontSize:18,fontWeight:800,color:'#1A1A2E',letterSpacing:'-0.5px',whiteSpace:'nowrap'}}>취준 에이전트</span>
        </div>

        <h1 style={{fontSize:26,fontWeight:800,lineHeight:1.35,color:'#1A1A2E',marginBottom:10,letterSpacing:'-0.5px'}}>
          취업 준비,<br/>이제 AI 에이전트와 함께
        </h1>
        <p style={{fontSize:14,lineHeight:1.65,color:'#52526E',marginBottom:28}}>
          기업분석부터 자기소개서 작성까지<br/>
          나만의 에이전트가 곁에서 도와드려요 😊
        </p>

        {/* Agent chips */}
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:32}}>
          <AgentPill icon="🏢" label="기업분석" color="#5468FF" />
          <AgentPill icon="📋" label="문항분석" color="#8B5CF6" />
          <AgentPill icon="✨" label="경험매칭" color="#0EA5E9" />
          <AgentPill icon="✍️" label="자소서작성" color="#10B981" />
        </div>

        {/* Google button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width:'100%',height:54,borderRadius:14,
            border:'1.5px solid #E8EAFA',background: loading ? '#F5F6FF' : '#fff',
            display:'flex',alignItems:'center',justifyContent:'center',gap:12,
            fontSize:15,fontWeight:700,color:'#1A1A2E',
            transition:'all 0.2s ease',marginBottom:16,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if(!loading) e.currentTarget.style.background='#F5F6FF'; }}
          onMouseLeave={e => { if(!loading) e.currentTarget.style.background='#fff'; }}
        >
          {loading ? (
            <div style={{width:22,height:22,borderRadius:'50%',
              border:'2.5px solid #E8EAFA',borderTopColor:'#5468FF',
              animation:'spin 0.7s linear infinite'}} />
          ) : (
            <><GoogleIcon /><span style={{whiteSpace:'nowrap'}}>Google로 시작하기</span></>
          )}
        </button>

        <p style={{fontSize:12,color:'#9CA3B8',textAlign:'center',lineHeight:1.6}}>
          시작하면{' '}
          <span style={{color:'#5468FF',cursor:'pointer'}}>이용약관</span>과{' '}
          <span style={{color:'#5468FF',cursor:'pointer'}}>개인정보처리방침</span>에 동의합니다
        </p>
      </div>
    </div>
  );
}

// ── ONBOARDING ───────────────────────────────────────────────────────────────
const ONBOARDING_STEPS = 5;

function StepDots({ step }) {
  return (
    <div style={{display:'flex',gap:6,marginBottom:36}}>
      {Array.from({length:ONBOARDING_STEPS}).map((_,i) => (
        <div key={i} style={{
          height:6,
          width: i === step ? 24 : 6,
          borderRadius:99,
          background: i <= step ? '#5468FF' : '#E8EAFA',
          transition:'all 0.3s ease',
        }} />
      ))}
    </div>
  );
}

function PrimaryBtn({ onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width:'100%',height:54,borderRadius:14,
        background: disabled ? '#E8EAFA' : 'linear-gradient(135deg,#5468FF,#7C84FF)',
        color: disabled ? '#9CA3B8' : '#fff',
        fontSize:16,fontWeight:700,
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(84,104,255,0.30)',
        transition:'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >{children}</button>
  );
}

// Step 1 – Name
function NameStep({ name, setName, onNext }) {
  return (
    <div className="anim-fadeUp">
      <p style={{fontSize:13,fontWeight:600,color:'#5468FF',marginBottom:12,letterSpacing:'0.5px'}}>STEP 1</p>
      <h2 style={{fontSize:26,fontWeight:800,lineHeight:1.35,marginBottom:8,letterSpacing:'-0.5px'}}>
        반가워요! 👋<br/>이름을 알려주세요
      </h2>
      <p style={{fontSize:14,color:'#52526E',marginBottom:32,lineHeight:1.6}}>
        더 친근하게 불러드릴게요
      </p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key==='Enter' && name.trim() && onNext()}
        placeholder="예: 김취준"
        autoFocus
        style={{
          width:'100%',height:52,borderRadius:14,
          border:'1.5px solid #E8EAFA',background:'#F5F6FF',
          padding:'0 18px',fontSize:16,fontWeight:500,color:'#1A1A2E',
          marginBottom:16, transition:'border 0.2s',
        }}
        onFocus={e => e.target.style.border='1.5px solid #A0ABFF'}
        onBlur={e => e.target.style.border='1.5px solid #E8EAFA'}
      />
      <PrimaryBtn onClick={onNext} disabled={!name.trim()}>다음으로</PrimaryBtn>
    </div>
  );
}

// Step 2 – Experience intro
function ExpIntroStep({ name, onNext }) {
  return (
    <div className="anim-fadeUp">
      <p style={{fontSize:13,fontWeight:600,color:'#5468FF',marginBottom:12,letterSpacing:'0.5px'}}>STEP 2</p>
      <h2 style={{fontSize:26,fontWeight:800,lineHeight:1.35,marginBottom:8,letterSpacing:'-0.5px'}}>
        {name}님의 경험을<br/>등록해볼까요?
      </h2>
      <p style={{fontSize:14,color:'#52526E',marginBottom:32,lineHeight:1.6}}>
        동아리, 인턴, 프로젝트, 봉사활동 등<br/>
        어떤 경험이든 괜찮아요. 나중에 언제든지 추가할 수 있어요 😊
      </p>

      <div style={{
        background:'#F5F6FF',borderRadius:16,padding:'20px 20px',
        marginBottom:24,display:'flex',flexDirection:'column',gap:12,
      }}>
        {['📝 경험을 등록하면 자소서 작성에 자동으로 활용돼요','✨ 여러 경험을 등록할수록 매칭 품질이 높아져요','🔒 내 경험은 안전하게 보관돼요'].map(t => (
          <div key={t} style={{fontSize:13,color:'#52526E',lineHeight:1.5}}>{t}</div>
        ))}
      </div>

      <PrimaryBtn onClick={onNext}>경험 등록하기</PrimaryBtn>
      <button onClick={onNext} style={{
        width:'100%',height:44,borderRadius:14,background:'transparent',
        color:'#9CA3B8',fontSize:14,marginTop:8,
      }}>나중에 등록할게요</button>
    </div>
  );
}

// Step 3 – Experience form (with tags)
const OB_TAGS = ['인턴','프로젝트','동아리','대외활동','봉사활동','아르바이트','학술','기타'];
const OB_TAG_COLORS = {
  '인턴':'#5468FF','프로젝트':'#8B5CF6','동아리':'#0EA5E9',
  '대외활동':'#10B981','봉사활동':'#F59E0B','아르바이트':'#EF4444',
  '학술':'#EC4899','기타':'#6B7280',
};

function ExpFormStep({ exp, setExp, onNext }) {
  const update = (k, v) => setExp(prev => ({...prev, [k]: v}));
  const toggleTag = t => {
    setExp(prev => ({
      ...prev,
      tags: (prev.tags||[]).includes(t)
        ? prev.tags.filter(x => x !== t)
        : [...(prev.tags||[]), t],
    }));
  };

  const fields = [
    { key:'title', label:'활동/경험 이름', placeholder:'예: 스타트업 마케팅 인턴' },
    { key:'role',  label:'역할',           placeholder:'예: 콘텐츠 마케터' },
    { key:'period',label:'활동 기간',       placeholder:'예: 2023.07 – 2023.12' },
  ];

  const canNext = exp.title.trim() && exp.role.trim() && exp.period.trim() && exp.desc.trim();

  return (
    <div className="anim-fadeUp" style={{display:'flex',flexDirection:'column',gap:0}}>
      <p style={{fontSize:13,fontWeight:600,color:'#5468FF',marginBottom:12,letterSpacing:'0.5px'}}>STEP 3</p>
      <h2 style={{fontSize:24,fontWeight:800,lineHeight:1.35,marginBottom:6,letterSpacing:'-0.5px'}}>
        경험을 입력해주세요
      </h2>
      <p style={{fontSize:14,color:'#52526E',marginBottom:20,lineHeight:1.6}}>간단히 적어도 괜찮아요!</p>

      <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{fontSize:12,fontWeight:600,color:'#52526E',display:'block',marginBottom:5}}>{f.label}</label>
            <input
              value={exp[f.key]}
              onChange={e => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              style={{
                width:'100%',height:46,borderRadius:12,
                border:'1.5px solid #E8EAFA',background:'#F5F6FF',
                padding:'0 14px',fontSize:14,color:'#1A1A2E',transition:'border 0.2s',
              }}
              onFocus={e => e.target.style.border='1.5px solid #A0ABFF'}
              onBlur={e => e.target.style.border='1.5px solid #E8EAFA'}
            />
          </div>
        ))}

        <div>
          <label style={{fontSize:12,fontWeight:600,color:'#52526E',display:'block',marginBottom:5}}>주요 내용</label>
          <textarea
            value={exp.desc}
            onChange={e => update('desc', e.target.value)}
            placeholder={"이 경험에서 무엇을 했는지 간략히 적어주세요\n예: SNS 콘텐츠 기획·제작, 월 팔로워 3,000명 증가"}
            rows={3}
            style={{
              width:'100%',borderRadius:12,
              border:'1.5px solid #E8EAFA',background:'#F5F6FF',
              padding:'12px 14px',fontSize:14,color:'#1A1A2E',
              resize:'none',lineHeight:1.6,transition:'border 0.2s',
            }}
            onFocus={e => e.target.style.border='1.5px solid #A0ABFF'}
            onBlur={e => e.target.style.border='1.5px solid #E8EAFA'}
          />
        </div>

        {/* Tags */}
        <div>
          <label style={{fontSize:12,fontWeight:600,color:'#52526E',display:'block',marginBottom:8}}>
            태그 <span style={{fontWeight:400,color:'#9CA3B8'}}>(선택)</span>
          </label>
          <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
            {OB_TAGS.map(t => {
              const active = (exp.tags||[]).includes(t);
              const color = OB_TAG_COLORS[t];
              return (
                <button key={t} onClick={() => toggleTag(t)} style={{
                  padding:'6px 13px',borderRadius:99,fontSize:12,fontWeight:600,
                  background: active ? color : '#F5F6FF',
                  color: active ? '#fff' : '#52526E',
                  border: active ? `1.5px solid ${color}` : '1.5px solid #E8EAFA',
                  transition:'all 0.15s',cursor:'pointer',whiteSpace:'nowrap',
                }}>{t}</button>
              );
            })}
          </div>
        </div>
      </div>

      <PrimaryBtn onClick={onNext} disabled={!canNext}>저장하고 계속하기</PrimaryBtn>
    </div>
  );
}

// Step 4 – Anthropic API Key
function ApiKeyStep({ apiKey, setApiKey, onNext, onSkip }) {
  const [show, setShow] = useStateExp(false);
  const [focused, setFocused] = useStateExp(false);
  const valid = apiKey.trim().startsWith('sk-ant-');

  return (
    <div className="anim-fadeUp">
      <p style={{fontSize:13,fontWeight:600,color:'#5468FF',marginBottom:12,letterSpacing:'0.5px'}}>STEP 4</p>
      <h2 style={{fontSize:24,fontWeight:800,lineHeight:1.35,marginBottom:8,letterSpacing:'-0.5px'}}>
        AI 엔진을 연결해요 🔑
      </h2>
      <p style={{fontSize:14,color:'#52526E',marginBottom:20,lineHeight:1.65}}>
        Anthropic API 키를 등록하면 에이전트가<br/>실제로 동작해요.
      </p>

      {/* Info box */}
      <div style={{
        background:'#F5F6FF',borderRadius:14,padding:'14px 16px',
        marginBottom:20,display:'flex',flexDirection:'column',gap:8,
      }}>
        {[
          '🔒 API 키는 암호화되어 안전하게 저장돼요',
          '💡 Anthropic Console에서 발급받을 수 있어요',
          '🔄 마이페이지에서 언제든지 변경할 수 있어요',
        ].map(t => (
          <div key={t} style={{fontSize:12,color:'#52526E',lineHeight:1.5}}>{t}</div>
        ))}
      </div>

      <label style={{fontSize:12,fontWeight:600,color:'#52526E',display:'block',marginBottom:6}}>
        Anthropic API 키
      </label>
      <div style={{
        display:'flex',alignItems:'center',
        border: focused ? '1.5px solid #A0ABFF' : '1.5px solid #E8EAFA',
        borderRadius:12,background:'#F5F6FF',overflow:'hidden',
        marginBottom:6,transition:'border 0.2s',
      }}>
        <input
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          type={show ? 'text' : 'password'}
          placeholder="sk-ant-api03-..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex:1,height:48,background:'transparent',
            padding:'0 14px',fontSize:14,color:'#1A1A2E',
          }}
        />
        <button onClick={() => setShow(s => !s)} style={{
          padding:'0 14px',height:48,background:'transparent',
          color:'#9CA3B8',fontSize:16,flexShrink:0,
        }}>{show ? '🙈' : '👁'}</button>
      </div>
      {apiKey && !valid && (
        <p style={{fontSize:11,color:'#EF4444',marginBottom:12}}>
          올바른 API 키 형식이 아니에요 (sk-ant-로 시작해야 해요)
        </p>
      )}
      {valid && (
        <p className="anim-fadeIn" style={{fontSize:11,color:'#10B981',marginBottom:12}}>
          ✓ API 키 형식이 올바르네요!
        </p>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
        <PrimaryBtn onClick={onNext} disabled={!valid}>연결하고 시작하기</PrimaryBtn>
        <button onClick={onSkip} style={{
          width:'100%',height:44,borderRadius:14,background:'transparent',
          color:'#9CA3B8',fontSize:13,cursor:'pointer',
        }}>나중에 등록할게요</button>
      </div>
    </div>
  );
}

// Step 5 – Complete
function CompleteStep({ name, onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="anim-fadeUp" style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center'}}>
      <div className="anim-popIn" style={{
        width:88,height:88,borderRadius:'50%',
        background:'linear-gradient(135deg,#5468FF,#10B981)',
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:40,marginBottom:28,
        boxShadow:'0 8px 32px rgba(84,104,255,0.28)',
      }}>🎉</div>
      <h2 style={{fontSize:26,fontWeight:800,marginBottom:12,letterSpacing:'-0.5px'}}>
        모든 준비가 됐어요!
      </h2>
      <p style={{fontSize:15,color:'#52526E',lineHeight:1.7,marginBottom:36}}>
        {name}님의 경험이 안전하게 저장됐어요.<br/>
        이제 에이전트와 함께 취업 준비를 시작해요!
      </p>
      <div style={{
        display:'flex',alignItems:'center',gap:8,
        color:'#9CA3B8',fontSize:13,
      }}>
        <div style={{width:18,height:18,borderRadius:'50%',
          border:'2px solid #E8EAFA',borderTopColor:'#5468FF',
          animation:'spin 0.8s linear infinite'}} />
        메인으로 이동 중...
      </div>
    </div>
  );
}

// ── ONBOARDING CONTAINER ─────────────────────────────────────────────────────
function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [exp, setExp] = useState({ title:'', role:'', period:'', desc:'', tags:[] });
  const [apiKey, setApiKey] = useState('');

  const handleComplete = () => {
    const experiences = exp.title.trim()
      ? [{ id: Date.now(), ...exp }]
      : [];
    onComplete({ ...user, name: name || user.name, experiences, apiKey: apiKey.trim() });
  };

  const renderStep = () => {
    switch(step) {
      case 0: return <NameStep name={name} setName={setName} onNext={() => setStep(1)} />;
      case 1: return <ExpIntroStep name={name || '여러분'} onNext={() => setStep(2)} />;
      case 2: return <ExpFormStep exp={exp} setExp={setExp} onNext={() => setStep(3)} />;
      case 3: return <ApiKeyStep apiKey={apiKey} setApiKey={setApiKey} onNext={() => setStep(4)} onSkip={() => setStep(4)} />;
      case 4: return <CompleteStep name={name || '여러분'} onComplete={handleComplete} />;
      default: return null;
    }
  };

  return (
    <div style={{
      width:'100vw',height:'100vh',
      display:'flex',alignItems:'center',justifyContent:'center',
      background:'linear-gradient(145deg,#EEF0FF 0%,#F5F6FF 55%,#FFF3EE 100%)',
      position:'relative',overflow:'hidden',
    }}>
      <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',
        background:'radial-gradient(circle,rgba(84,104,255,0.10) 0%,transparent 70%)',
        top:-100,right:-100,pointerEvents:'none'}} />

      <div style={{
        background:'#fff',borderRadius:28,padding:'44px 44px',
        width:440,minHeight:440,
        boxShadow:'0 8px 56px rgba(84,104,255,0.12),0 2px 8px rgba(0,0,0,0.04)',
        position:'relative',zIndex:1,
      }}>
        {/* Back button */}
        {step > 0 && step < 3 && (
          <button onClick={() => setStep(s => s - 1)} style={{
            position:'absolute',top:20,left:20,
            width:36,height:36,borderRadius:10,
            background:'#F5F6FF',color:'#52526E',fontSize:16,
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>←</button>
        )}

        <StepDots step={step} />
        {renderStep()}
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, OnboardingScreen });
