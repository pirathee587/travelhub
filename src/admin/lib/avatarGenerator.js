// Generate SVG avatar based on name and color
export const generateAvatarSVG = (name, bgColor = '#4F46E5') => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
  
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
      <defs>
        <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' style='stop-color:${bgColor};stop-opacity:1' />
          <stop offset='100%' style='stop-color:${adjustBrightness(bgColor, -20)};stop-opacity:1' />
        </linearGradient>
      </defs>
      <rect width='100' height='100' fill='url(#grad)' />
      <circle cx='50' cy='35' r='20' fill='white' opacity='0.9'/>
      <ellipse cx='50' cy='75' rx='30' ry='22' fill='white' opacity='0.9'/>
      <text x='50' y='48' font-size='28' font-weight='bold' fill='${bgColor}' text-anchor='middle' dominant-baseline='middle' font-family='Arial'>${initials}</text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Adjust color brightness
const adjustBrightness = (color, percent) => {
  const num = parseInt(color.slice(1), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt))
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

// Predefined colors for consistent avatars
const avatarColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#52C0A1'
]

// Get consistent color for a person (same person always gets same color)
export const getAvatarColor = (id) => {
  return avatarColors[id % avatarColors.length]
}

// Generate avatar with consistent colors
export const generateUserAvatar = (name, id) => {
  const bgColor = getAvatarColor(id)
  return generateAvatarSVG(name, bgColor)
}
