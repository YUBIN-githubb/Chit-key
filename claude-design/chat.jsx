// components/chat.jsx — Main chatbot screen with agent system
const { useState: useStateChat, useEffect: useEffectChat, useRef: useRefChat } = React;

// ── Agent definitions ─────────────────────────────────────────────────────────
const AGENTS = {
  company: { id:'company', name:'기업분석', icon:'🏢', color:'#5468FF', bg:'#EEF0FF',
    keywords:['기업분석','기업 분석','회사 분석','분석해줘','분석해 줘'] },
  question: { id:'question', name:'문항분석', icon:'📋', color:'#8B5CF6', bg:'#F3F0FF',
    keywords:['문항분석','문항 분석','문항','자기소개서 문항','질문 분석'] },
  match:    { id:'match',    name:'경험매칭', icon:'✨', color:'#0EA5E9', bg:'#EFF9FF',
    keywords:['경험매칭','경험 매칭','매칭','경험 추천','맞는 경험'] },
  write:    { id:'write',    name:'자소서작성', icon:'✍️', color:'#10B981', bg:'#EFFDF8',
    keywords:['자소서','자기소개서','작성','써줘','써 줘'] },
};

function detectAgent(text) {
  const lower = text.toLowerCase();
  for (const ag of Object.values(AGENTS)) {
    if (ag.keywords.some(k => lower.includes(k))) return ag;
  }
  return null;
}

function extractCompany(text) {
  const m = text.match(/([가-힣a-zA-Z0-9]{2,10})\s*(기업|회사)?\s*분석/);
  return m ? m[1].replace(/기업|회사/g,'').trim() : null;
}

// ── Agent responses ───────────────────────────────────────────────────────────
function buildResponse(agent, text, experiences) {
  const co = extractCompany(text);
  if (agent.id === 'company') {
    const name = co || '입력하신 기업';
    return [
      { type:'badge', agent },
      { type:'text', content:`**📊 ${name} 기업분석 리포트**\n\n🏢 **기업 개요**\n${name}은(는) 업계를 선도하는 주요 기업으로 혁신적인 제품과 서비스를 제공하고 있어요.\n\n💡 **핵심 사업 영역**\n• 주요 플랫폼 및 서비스 운영\n• 디지털 전환 기반 신사업 확장\n• B2C·B2B 통합 솔루션\n\n🎯 **인재상**\n• 문제를 주도적으로 해결하는 사람\n• 데이터 기반 의사결정 능력\n• 팀과 적극적으로 협업하는 태도\n\n📌 **자소서 작성 포인트**\n• 직무와 연계된 구체적 경험 강조\n• 수치로 증명 가능한 성과 제시\n• 기업의 핵심 가치와 연결\n\n다음 단계로 문항 분석도 해드릴까요? **"${co||'기업명'} 문항 분석해줘"** 라고 입력해보세요! 😊` },
    ];
  }
  if (agent.id === 'question') {
    return [
      { type:'badge', agent },
      { type:'text', content:`**📋 자소서 문항 분석**\n\n문항의 의도를 파악해서 핵심 작성 전략을 알려드릴게요!\n\n자세한 분석을 위해 **분석할 문항을 복사해서 붙여넣어** 주세요.\n\n📝 **일반적인 문항 유형 예시**\n\n**1. 지원 동기형**\n→ 기업의 어떤 점에 끌렸는지 + 내가 기여할 수 있는 것\n\n**2. 성장 경험형**\n→ 어떤 도전을 했고, 무엇을 배웠는지 (STAR 기법 추천)\n\n**3. 직무 역량형**\n→ 직무와 직접 연결되는 경험 + 수치 성과\n\n분석할 문항을 입력해주시면 더 구체적인 전략을 알려드려요! ✨` },
    ];
  }
  if (agent.id === 'match') {
    if (!experiences?.length) {
      return [
        { type:'badge', agent },
        { type:'text', content:`**✨ 경험매칭 에이전트**\n\n앗, 아직 등록된 경험이 없네요! 😅\n\n**'내 경험'** 탭에서 경험을 먼저 등록해주시면 문항에 딱 맞는 경험을 추천해드릴게요.\n\n경험이 많을수록 더 정확한 매칭이 가능해요 💪` },
      ];
    }
    const expList = experiences.map((e,i) => `**${i+1}. ${e.title}** (${e.role} · ${e.period})\n${e.desc?.slice(0,60)}...`).join('\n\n');
    return [
      { type:'badge', agent },
      { type:'text', content:`**✨ 경험 매칭 결과**\n\n현재 등록된 ${experiences.length}개의 경험을 분석했어요!\n\n${expList}\n\n더 정확한 매칭을 위해 **지원하는 직무와 문항을 함께** 알려주세요.\n예: "카카오 서비스기획 직무 문항에 맞는 경험 매칭해줘" 😊` },
    ];
  }
  if (agent.id === 'write') {
    const exp = experiences?.[0];
    const expStr = exp
      ? `\n\n📌 **등록된 경험 '${exp.title}'을 활용한 예시**\n\n저는 ${exp.role}으로서 ${exp.desc?.slice(0,80) || '다양한 업무'}를 경험했습니다. 이 과정에서...`
      : '\n\n경험 탭에서 경험을 등록하시면 더 맞춤화된 자소서를 작성해드릴 수 있어요!';
    return [
      { type:'badge', agent },
      { type:'text', content:`**✍️ 자소서 작성 에이전트**\n\n자소서 작성을 도와드릴게요! 아래 정보를 알려주시면 바로 초안을 작성해드려요.\n\n**필요한 정보:**\n• 지원 기업 및 직무\n• 작성할 문항\n• 강조하고 싶은 경험${expStr}\n\n📝 "카카오 서비스기획 지원동기 써줘" 처럼 구체적으로 입력해보세요!` },
    ];
  }
  return [{ type:'text', content:'무엇을 도와드릴까요? 😊' }];
}

// ── Welcome message ───────────────────────────────────────────────────────────
function buildWelcome(name) {
  return `안녕하세요, **${name}님**! 저는 취준 에이전트예요 😊\n\n취업 준비가 쉽지 않죠. 걱정하지 마세요, 제가 옆에서 함께 도와드릴게요!\n\n아래 4가지 에이전트를 사용할 수 있어요:\n\n🏢 **기업분석 에이전트**\n"카카오 기업분석 해줘" → 기업 정보, 인재상, 핵심 포인트 분석\n\n📋 **문항분석 에이전트**\n"문항 분석해줘" → 자소서 문항의 의도와 작성 전략 파악\n\n✨ **경험매칭 에이전트**\n"내 경험 매칭해줘" → 등록된 경험을 문항에 맞게 추천\n\n✍️ **자소서작성 에이전트**\n"자소서 작성해줘" → 경험 기반 자기소개서 초안 작성\n\n편하게 말씀해주세요! 어디서부터 시작할까요? 🚀`;
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator({ agent }) {
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:10,padding:'4px 0'}} className="anim-fadeIn">
      <div style={{
        width:36,height:36,borderRadius:'50%',flexShrink:0,
        background: agent ? agent.bg : '#F5F6FF',
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
      }}>{agent ? agent.icon : '🤖'}</div>
      <div style={{
        background:'#fff',borderRadius:'18px 18px 18px 4px',
        padding:'14px 18px',border:'1.5px solid #E8EAFA',
        display:'flex',gap:5,alignItems:'center',
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:7,height:7,borderRadius:'50%',
            background:'#A0ABFF',
            animation:`blink 1.2s ease-in-out ${i*0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Agent badge (activating) ──────────────────────────────────────────────────
function AgentBadge({ agent }) {
  return (
    <div className="anim-popIn" style={{
      display:'inline-flex',alignItems:'center',gap:8,
      padding:'8px 16px',borderRadius:99,
      background: agent.bg, border:`1.5px solid ${agent.color}30`,
      marginBottom:8,
    }}>
      <span style={{fontSize:16}}>{agent.icon}</span>
      <span style={{fontSize:13,fontWeight:700,color:agent.color}}>{agent.name} 에이전트 활성화</span>
      <div style={{
        width:6,height:6,borderRadius:'50%',background:agent.color,
        animation:'blink 1s ease-in-out infinite',
      }} />
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

function MessageBubble({ msg, isLast }) {
  if (msg.role === 'user') {
    return (
      <div className="anim-fadeUp" style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <div style={{
          maxWidth:'70%',background:'linear-gradient(135deg,#5468FF,#7C84FF)',
          color:'#fff',borderRadius:'18px 18px 4px 18px',
          padding:'12px 18px',fontSize:14,lineHeight:1.65,
          boxShadow:'0 4px 16px rgba(84,104,255,0.25)',
        }}>{msg.content}</div>
      </div>
    );
  }

  return (
    <div className="anim-fadeUp" style={{display:'flex',flexDirection:'column',marginBottom:12}}>
      {msg.badge && <AgentBadge agent={msg.badge} />}
      <div style={{display:'flex',alignItems:'flex-end',gap:10}}>
        <div style={{
          width:36,height:36,borderRadius:'50%',flexShrink:0,
          background: msg.agent ? msg.agent.bg : '#F5F6FF',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:18,border: msg.agent ? `1.5px solid ${msg.agent.color}20` : '1.5px solid #E8EAFA',
        }}>{msg.agent ? msg.agent.icon : '✦'}</div>
        <div style={{
          maxWidth:'75%',background:'#fff',
          borderRadius:'18px 18px 18px 4px',
          padding:'14px 18px',fontSize:14,lineHeight:1.7,color:'#1A1A2E',
          border:'1.5px solid #E8EAFA',
          boxShadow:'0 2px 8px rgba(84,104,255,0.06)',
        }} dangerouslySetInnerHTML={{__html: renderMarkdown(msg.content)}} />
      </div>
    </div>
  );
}

// ── Quick action chips ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label:'🏢 기업분석 해줘', text:'카카오 기업분석 해줘' },
  { label:'📋 문항 분석해줘', text:'문항 분석해줘' },
  { label:'✨ 경험 매칭해줘', text:'내 경험 매칭해줘' },
  { label:'✍️ 자소서 작성해줘', text:'자소서 작성해줘' },
];

// ── CHAT SCREEN ───────────────────────────────────────────────────────────────
function ChatScreen({ user, experiences }) {
  const [messages, setMessages] = useStateChat(() => [
    { id:1, role:'bot', content: buildWelcome(user?.name || '여러분'), agent:null },
  ]);
  const [input, setInput] = useStateChat('');
  const [typing, setTyping] = useStateChat(false);
  const [activeAgent, setActiveAgent] = useStateChat(null);
  const bottomRef = useRefChat(null);

  useEffectChat(() => {
    if (bottomRef.current) {
      bottomRef.current.parentElement.scrollTop = bottomRef.current.offsetTop;
    }
  }, [messages, typing]);

  const sendMessage = (text) => {
    const content = (text || input).trim();
    if (!content) return;
    setInput('');

    const userMsg = { id: Date.now(), role:'user', content };
    setMessages(prev => [...prev, userMsg]);

    const agent = detectAgent(content);
    setActiveAgent(agent);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const parts = agent
        ? buildResponse(agent, content, experiences)
        : [{ type:'text', content:'도움이 필요하신 게 있으면 말씀해주세요! 위의 에이전트 중 하나를 활용해보는 건 어떨까요? 😊' }];

      const botMsgs = parts.map((p, i) => ({
        id: Date.now() + i,
        role: 'bot',
        content: p.type === 'badge' ? null : p.content,
        badge: p.type === 'badge' ? p.agent : null,
        agent: agent,
      })).filter(m => m.content !== null || m.badge !== null);

      // merge badge into first text msg
      if (agent) {
        const textMsgs = botMsgs.filter(m => m.content);
        if (textMsgs.length) {
          textMsgs[0].badge = agent;
          setMessages(prev => [...prev, ...textMsgs]);
        } else {
          setMessages(prev => [...prev, ...botMsgs]);
        }
      } else {
        setMessages(prev => [...prev, ...botMsgs]);
      }
      setActiveAgent(null);
    }, 1600 + Math.random() * 600);
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',height:'100%',minHeight:0}}>
      {/* Header */}
      <div style={{
        padding:'20px 28px',borderBottom:'1px solid #F0F1FA',
        display:'flex',alignItems:'center',gap:14,flexShrink:0,
        background:'rgba(255,255,255,0.9)',backdropFilter:'blur(8px)',
      }}>
        <div style={{
          width:42,height:42,borderRadius:13,
          background:'linear-gradient(135deg,#5468FF,#8B5CF6)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:20,
        }}>✦</div>
        <div>
          <div style={{fontSize:15,fontWeight:800,color:'#1A1A2E',letterSpacing:'-0.3px'}}>취준 에이전트</div>
          <div style={{
            display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#10B981',fontWeight:600,
          }}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#10B981'}} />
            온라인 · 항상 준비 중
          </div>
        </div>

        {/* Active agents */}
        <div style={{marginLeft:'auto',display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>
          {Object.values(AGENTS).map(ag => (
            <div key={ag.id} style={{
              display:'flex',alignItems:'center',gap:5,
              padding:'4px 10px',borderRadius:99,
              background: ag.bg, border:`1px solid ${ag.color}20`,
              fontSize:11,fontWeight:600,color:ag.color,whiteSpace:'nowrap',
            }}>
              <span>{ag.icon}</span><span style={{whiteSpace:'nowrap'}}>{ag.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'24px 28px',display:'flex',flexDirection:'column'}}>
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} msg={msg} isLast={i === messages.length - 1} />
        ))}
        {typing && <TypingIndicator agent={activeAgent} />}
        <div ref={bottomRef} style={{height:1}} />
      </div>

      {/* Quick actions */}
      <div style={{
        padding:'0 28px 12px',display:'flex',gap:8,flexWrap:'wrap',flexShrink:0,
      }}>
        {QUICK_ACTIONS.map(qa => (
          <button key={qa.label} onClick={() => sendMessage(qa.text)} style={{
            padding:'7px 14px',borderRadius:99,fontSize:12,fontWeight:600,
            background:'#fff',border:'1.5px solid #E8EAFA',color:'#52526E',
            transition:'all 0.15s',whiteSpace:'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='#A0ABFF'; e.currentTarget.style.color='#5468FF'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='#E8EAFA'; e.currentTarget.style.color='#52526E'; }}
          >{qa.label}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding:'12px 20px 20px',flexShrink:0,
      }}>
        <div style={{
          display:'flex',alignItems:'flex-end',gap:10,
          background:'#fff',borderRadius:18,
          border:'1.5px solid #E8EAFA',
          padding:'10px 10px 10px 18px',
          boxShadow:'0 4px 20px rgba(84,104,255,0.08)',
          transition:'border 0.2s',
        }}
        onFocusCapture={e => e.currentTarget.style.border='1.5px solid #A0ABFF'}
        onBlurCapture={e => e.currentTarget.style.border='1.5px solid #E8EAFA'}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="메시지를 입력하세요...  예) 카카오 기업분석 해줘"
            rows={1}
            style={{
              flex:1,resize:'none',fontSize:14,color:'#1A1A2E',
              lineHeight:1.6,background:'transparent',
              maxHeight:120,overflowY:'auto',
            }}
            onInput={e => {
              e.target.style.height='auto';
              e.target.style.height = Math.min(e.target.scrollHeight,120)+'px';
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || typing}
            style={{
              width:40,height:40,borderRadius:12,flexShrink:0,
              background: (input.trim() && !typing)
                ? 'linear-gradient(135deg,#5468FF,#7C84FF)'
                : '#F5F6FF',
              color: (input.trim() && !typing) ? '#fff' : '#9CA3B8',
              fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',
              transition:'all 0.2s',
              boxShadow: (input.trim() && !typing) ? '0 4px 12px rgba(84,104,255,0.3)' : 'none',
            }}
          >↑</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ChatScreen });
