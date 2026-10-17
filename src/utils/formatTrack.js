export function splitTitle(title) {
  if (!title) return ['', '']
  if (title.includes(',')) {
    const [main, detail] = title.split(/,(.+)/).slice(0, 2).map((s) => s?.trim())
    const filtered = /^arr\.\s*for guitar/i.test(detail || '') ? '' : detail
    return [main, filtered]
  }
  return [title, '']
}

export function splitPerformer(performer) {
  if (!performer) return ['', '']
  const match = performer.match(/^(.*?)(?:\s*[·•]\s*|,\s*|\.\s+)(.+)$/)
  if (match) {
    const main = match[1]?.trim()
    const detail = match[2]?.trim().replace(/^[\s·•.,-]+/, '')
    return [main, /^unknown$/i.test(detail) ? '' : detail]
  }
  return [performer, '']
}

export function formatCreditLine(composer, performer) {
  return [composer, performer]
    .map((s) => s?.trim())
    .filter((s) => s && !/^unknown$/i.test(s))
    .join(' · ')
}

export function formatArrangement(arrangement) {
  if (!arrangement) return ''
  return /^(arr\.\s*for guitar|transcr\.)/i.test(arrangement) ? '' : arrangement
}
