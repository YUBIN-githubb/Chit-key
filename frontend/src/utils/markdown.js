/**
 * 경량 마크다운 → HTML 변환 (라인 단위 파서)
 * 지원: 헤더, 볼드/이탤릭, 코드블록, 인라인코드, 불릿/번호 리스트, 표, 수평선, 줄바꿈
 */

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// 인라인 스타일 (볼드, 이탤릭, 코드, 링크)
function inline(str) {
  return str
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#F3F4F6;padding:2px 6px;border-radius:4px;font-size:0.88em;font-family:monospace;color:#D63031">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#1B64DA;text-decoration:underline">$1</a>')
}

export function renderMarkdown(raw) {
  if (!raw) return ''

  const lines = raw.split('\n')
  const out = []
  let inCode = false
  let codeLines = []
  let inUl = false
  let inOl = false
  let tableLines = []
  let inTable = false

  const closeList = () => {
    if (inUl) { out.push('</ul>'); inUl = false }
    if (inOl) { out.push('</ol>'); inOl = false }
  }

  const flushTable = () => {
    if (!tableLines.length) return
    // 첫 줄: 헤더, 두 번째 줄: 구분선(skip), 나머지: 바디
    const rows = tableLines.filter(r => !r.match(/^\|[\s\-|:]+\|$/))
    const parseRow = (row) =>
      row.replace(/^\||\|$/g, '').split('|').map(c => inline(escapeHtml(c.trim())))

    const [header, ...body] = rows
    const ths = parseRow(header)
      .map(c => `<th style="padding:7px 12px;text-align:left;font-weight:700;border-bottom:2px solid #E5E8EB;white-space:nowrap">${c}</th>`)
      .join('')
    const trs = body.map(row =>
      '<tr>' + parseRow(row)
        .map((c, i) => `<td style="padding:7px 12px;border-bottom:1px solid #F0F2F5;${i === 0 ? 'white-space:nowrap' : ''}">${c}</td>`)
        .join('') + '</tr>'
    ).join('')

    out.push(`<div style="overflow-x:auto;margin:10px 0"><table style="border-collapse:collapse;width:100%;font-size:0.92em">
      <thead><tr style="background:#F8F9FA">${ths}</tr></thead>
      <tbody>${trs}</tbody>
    </table></div>`)
    tableLines = []
    inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // ── 코드 블록 ──────────────────────────────────
    if (line.trimStart().startsWith('```')) {
      if (!inCode) {
        closeList(); flushTable()
        inCode = true; codeLines = []
      } else {
        out.push(`<pre style="background:#F3F4F6;border-radius:10px;padding:12px 16px;margin:10px 0;overflow-x:auto;font-size:0.88em;line-height:1.6;font-family:'Fira Code',monospace"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
        inCode = false; codeLines = []
      }
      continue
    }
    if (inCode) { codeLines.push(line); continue }

    // ── 표 ─────────────────────────────────────────
    if (line.match(/^\|.+\|$/)) {
      closeList()
      inTable = true
      tableLines.push(line)
      continue
    } else if (inTable) {
      flushTable()
    }

    // ── 수평선 ─────────────────────────────────────
    if (line.match(/^[-*_]{3,}$/)) {
      closeList()
      out.push('<hr style="border:none;border-top:1px solid #E5E8EB;margin:14px 0"/>')
      continue
    }

    // ── 헤더 ───────────────────────────────────────
    const h3 = line.match(/^### (.+)/)
    if (h3) { closeList(); out.push(`<h3 style="font-size:1em;font-weight:700;color:#191F28;margin:14px 0 6px;letter-spacing:-0.2px">${inline(escapeHtml(h3[1]))}</h3>`); continue }
    const h2 = line.match(/^## (.+)/)
    if (h2) { closeList(); out.push(`<h2 style="font-size:1.08em;font-weight:800;color:#191F28;margin:18px 0 8px;letter-spacing:-0.3px">${inline(escapeHtml(h2[1]))}</h2>`); continue }
    const h1 = line.match(/^# (.+)/)
    if (h1) { closeList(); out.push(`<h1 style="font-size:1.15em;font-weight:800;color:#191F28;margin:20px 0 10px;letter-spacing:-0.4px">${inline(escapeHtml(h1[1]))}</h1>`); continue }

    // ── 번호 리스트 ────────────────────────────────
    const ol = line.match(/^(\d+)\. (.+)/)
    if (ol) {
      if (inUl) { out.push('</ul>'); inUl = false }
      if (!inOl) { out.push('<ol style="margin:8px 0;padding-left:22px;display:flex;flex-direction:column;gap:4px">'); inOl = true }
      out.push(`<li style="line-height:1.65">${inline(escapeHtml(ol[2]))}</li>`)
      continue
    }

    // ── 불릿 리스트 ────────────────────────────────
    const ul = line.match(/^[•\-\*] (.+)/)
    if (ul) {
      if (inOl) { out.push('</ol>'); inOl = false }
      if (!inUl) { out.push('<ul style="margin:8px 0;padding-left:20px;display:flex;flex-direction:column;gap:4px">'); inUl = true }
      out.push(`<li style="line-height:1.65">${inline(escapeHtml(ul[1]))}</li>`)
      continue
    }

    // ── 빈 줄 ──────────────────────────────────────
    if (line.trim() === '') {
      closeList()
      out.push('<div style="height:8px"></div>')
      continue
    }

    // ── 일반 단락 ──────────────────────────────────
    closeList()
    out.push(`<p style="margin:0;line-height:1.75">${inline(escapeHtml(line))}</p>`)
  }

  closeList()
  flushTable()

  return out.join('\n')
}
