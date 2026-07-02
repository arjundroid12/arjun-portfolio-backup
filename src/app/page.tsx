'use client'

import { useRef, useState, useEffect, Suspense, useCallback, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial, Stars, OrbitControls } from '@react-three/drei'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, Mail, MapPin, Phone, ExternalLink, Download, Sparkles, Brain, Database, Code2, Zap, Rocket, X, Volume2, VolumeX } from 'lucide-react'

// ============ SOUND EFFECT SYSTEM ============

function useSoundEffects() {
  const [enabled, setEnabled] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const musicRef = useRef<any>(null)

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
    return audioCtxRef.current
  }, [])

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) => {
    if (!enabled) return
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {}
  }, [enabled, getCtx])

  const playClick = useCallback(() => { playTone(523, 0.06, 'sine', 0.05); setTimeout(() => playTone(784, 0.06, 'sine', 0.04), 40) }, [playTone])
  const playHover = useCallback(() => playTone(880, 0.04, 'sine', 0.025), [playTone])
  const playPop = useCallback(() => { playTone(1047, 0.04, 'sine', 0.03); setTimeout(() => playTone(1319, 0.05, 'sine', 0.025), 25) }, [playTone])
  const playWarp = useCallback(() => {
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.5)
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }, [getCtx])

  // Simple ambient music — 3 sustained oscillators
  useEffect(() => {
    if (!enabled) { if (musicRef.current) { try { musicRef.current.gain.linearRampToValueAtTime(0, getCtx().currentTime + 0.5); } catch {} } return }
    try {
      const ctx = getCtx()
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2)
      gain.connect(ctx.destination)
      const freqs = [130.81, 196.00, 261.63]
      const oscs = freqs.map(f => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = 0.33; o.connect(g); g.connect(gain); o.start(); return o })
      musicRef.current = { gain, oscs }
    } catch {}
    return () => { if (musicRef.current) { try { musicRef.current.gain.linearRampToValueAtTime(0, getCtx().currentTime + 0.5) } catch {} } }
  }, [enabled, getCtx])

  // Tab visibility
  useEffect(() => {
    const handler = () => {
      if (!musicRef.current) return
      try { musicRef.current.gain.gain.linearRampToValueAtTime(document.hidden ? 0 : (enabled ? 0.02 : 0), getCtx().currentTime + 0.5) } catch {}
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [enabled, getCtx])

  return { enabled, setEnabled, playClick, playHover, playPop, playWarp, getCtx }
}

// ============ 3D SCENE (optimized) ============

function GlassShape({ position, color, scale = 1 }) {
  const ref = useRef<any>(null)
  useFrame((state) => { if (ref.current) { ref.current.rotation.y = state.clock.elapsedTime * 0.2 } })
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} transparent opacity={0.5} wireframe />
      </mesh>
    </Float>
  )
}

function CenterSphere() {
  const ref = useRef<any>(null)
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.05 })
  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <Sphere ref={ref} args={[1.5, 32, 32]}>
        <meshStandardMaterial color="#14b8a6" metalness={0.9} roughness={0.1} wireframe transparent opacity={0.3} />
      </Sphere>
    </Float>
  )
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#14b8a6" />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#fbbf24" />
      <CenterSphere />
      <GlassShape position={[-3.5, 2, -2]} color="#14b8a6" scale={0.6} />
      <GlassShape position={[3.5, -1, -1]} color="#fbbf24" scale={0.55} />
      <GlassShape position={[3, 2, 0]} color="#a855f7" scale={0.45} />
      <Stars radius={40} depth={20} count={500} factor={2} fade speed={0.3} />
    </>
  )
}

// ============ GRADIENT TEXT ============

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #14b8a6, #fbbf24, #a855f7, #f97316, #14b8a6)', backgroundSize: '200% 200%', animation: 'gradient-shift 5s linear infinite' }}>
      {children}
    </span>
  )
}

// ============ DATA ============

const AI_AGENTS = [
  { name: 'AI Research Agent', tagline: 'Autonomous agent using ReAct pattern', description: 'Single AI agent that thinks, decides which tool to use, calls it, observes the result, and synthesizes answers with citations.', tech: ['Next.js', 'Cerebras', 'DuckDuckGo', 'Wikipedia'], icon: Brain, gradient: 'from-teal-500 to-amber-500', repo: 'https://github.com/arjundroid12/ai-research-agent', demo: 'https://test-agent1.vercel.app/', difficulty: 'Intermediate' },
  { name: 'Multi-Agent System', tagline: '3 AI agents collaborating: Researcher → Writer → Editor', description: 'Three specialized AI agents work together. Researcher gathers info, Writer drafts content, Editor reviews and requests revisions.', tech: ['Next.js', 'Cerebras', 'Multi-agent'], icon: Zap, gradient: 'from-amber-500 to-purple-500', repo: 'https://github.com/arjundroid12/multi-agent-system', demo: '#', difficulty: 'Advanced' },
  { name: 'Data Analyst Agent', tagline: 'Upload CSV, AI writes Python, runs in browser', description: 'Upload any CSV, ask questions in English, AI writes Python code using pandas. Python runs in YOUR browser via Pyodide.', tech: ['Next.js', 'Cerebras', 'Pyodide', 'pandas'], icon: Database, gradient: 'from-purple-500 to-teal-500', repo: 'https://github.com/arjundroid12/data-analyst-agent', demo: '#', difficulty: 'Advanced' },
  { name: 'Coding Agent', tagline: 'Describe what you want, AI writes code, live preview', description: 'Like a mini v0.dev. Describe what you want, AI writes complete HTML/CSS/JS with live preview. Ask for changes, AI revises.', tech: ['Next.js', 'Cerebras', 'Sandboxed iframe'], icon: Code2, gradient: 'from-orange-500 to-teal-500', repo: 'https://github.com/arjundroid12/coding-agent', demo: '#', difficulty: 'Advanced' },
]

const PROJECTS = [
  { name: 'SmartAgro', desc: 'AI plant disease detection using CNN/Random Forest', longDesc: 'AI system that helps farmers detect plant diseases and get remedies from image or text input.', tech: ['Python', 'ML', 'CNN', 'NLP'], category: 'AI/ML', icon: '🌱', repo: 'https://github.com/arjundroid12/SmartAgro-A-disease-detection-model-with-Human-Interaction', demo: null, features: ['Image-based disease detection', 'NLP remedy queries', 'Web interface', 'Query history'] },
  { name: 'FIOLA', desc: 'AI voice assistant with LLMs', longDesc: 'Custom voice assistant built with LLMs and Python for speech recognition and task automation.', tech: ['Python', 'LLM'], category: 'AI/ML', icon: '🎤', repo: null, demo: null, features: ['Voice command processing', 'LLM-powered responses', 'Task automation'] },
  { name: 'Realtime Chat', desc: 'Multi-room chat with Socket.io', longDesc: 'Real-time chat with multiple rooms, nicknames, typing indicators, and online user list.', tech: ['Node.js', 'Express', 'Socket.io'], category: 'Full-stack', icon: '💬', repo: 'https://github.com/arjundroid12/realtime-chat', demo: '#', features: ['Multiple chat rooms', 'Real-time messaging', 'Typing indicators', 'Auto-reconnect'] },
  { name: 'Calculator', desc: 'Custom expression parser, no eval', longDesc: 'Clean calculator with keyboard support, history panel, and dark mode. Custom shunting-yard parser.', tech: ['Vanilla JS'], category: 'Frontend', icon: '🧮', repo: 'https://github.com/arjundroid12/calculator-app', demo: 'https://arjun-calculator.surge.sh', features: ['Custom expression parser', 'Calculation history', 'Keyboard support'] },
  { name: 'Notes App', desc: 'Markdown notes with custom parser', longDesc: 'Markdown notes app with tags, search, and dark mode. Custom zero-dependency markdown parser.', tech: ['Vanilla JS', 'Markdown'], category: 'Frontend', icon: '📝', repo: 'https://github.com/arjundroid12/notes-app', demo: 'https://arjun-notes.surge.sh', features: ['Custom markdown parser', 'Tag system', 'Full-text search', 'Auto-save'] },
  { name: 'Weather App', desc: 'Weather with geolocation and 5-day forecast', longDesc: 'Weather app with city search, 5-day forecast, geolocation. Free Open-Meteo API.', tech: ['Vanilla JS', 'Open-Meteo'], category: 'Frontend', icon: '⛅', repo: 'https://github.com/arjundroid12/weather-app', demo: 'https://arjun-weather.surge.sh', features: ['City search', '5-day forecast', 'Geolocation', 'Recent searches'] },
  { name: 'Kanban Todo', desc: 'Drag & drop kanban with priorities', longDesc: 'Kanban-style todo with drag & drop between columns, priorities, due dates, and stats.', tech: ['Vanilla JS', 'HTML5 DnD'], category: 'Frontend', icon: '📋', repo: 'https://github.com/arjundroid12/todo-drag-drop', demo: 'https://arjun-kanban.surge.sh', features: ['Drag & drop columns', 'Priority levels', 'Due dates', 'Stats bar'] },
  { name: 'Movie Explorer', desc: 'Movie search with filters and modal', longDesc: 'Movie explorer with search, genre filters, sort, favorites, and detail modal.', tech: ['Vanilla JS'], category: 'Frontend', icon: '🎬', repo: 'https://github.com/arjundroid12/movie-explorer', demo: 'https://arjun-movies.surge.sh', features: ['Search with debounce', 'Genre filters', 'Favorites', 'Detail modal'] },
  { name: 'Pomodoro Timer', desc: 'Timer with charts and notifications', longDesc: 'Pomodoro timer with custom durations, daily/weekly stats charts, and desktop notifications.', tech: ['Vanilla JS', 'Chart.js'], category: 'Frontend', icon: '🍅', repo: 'https://github.com/arjundroid12/pomodoro-timer', demo: 'https://arjun-pomodoro.surge.sh', features: ['3 modes', '7-day stats chart', 'Desktop notifications'] },
  { name: 'GitHub Search', desc: 'Search GitHub users with profile details', longDesc: 'Search GitHub users, view profile details and top repositories sorted by stars.', tech: ['Vanilla JS', 'GitHub API'], category: 'Frontend', icon: '🐙', repo: 'https://github.com/arjundroid12/github-user-search', demo: 'https://arjun-gh-search.surge.sh', features: ['User profile search', 'Top repos by stars', 'Rate limit indicator'] },
  { name: 'URL Shortener', desc: 'REST API with click analytics', longDesc: 'REST API for shortening URLs with click analytics, custom aliases, and optional expiry.', tech: ['Node.js', 'Express', 'LowDB'], category: 'Backend', icon: '🔗', repo: 'https://github.com/arjundroid12/url-shortener-api', demo: '#', features: ['Custom aliases', 'Click analytics', 'Expiry support', 'REST API'] },
  { name: 'JWT Auth Demo', desc: 'Auth with refresh tokens and bcrypt', longDesc: 'JWT authentication demo with signup/login, hashed passwords, refresh tokens, protected routes.', tech: ['Node.js', 'JWT', 'bcrypt'], category: 'Backend', icon: '🔐', repo: 'https://github.com/arjundroid12/jwt-auth-demo', demo: '#', features: ['bcrypt hashing', 'JWT access tokens', 'Refresh tokens', 'Token rotation'] },
]

const SKILLS = {
  'Data Science & ML': ['Python', 'Pandas', 'NumPy', 'scikit-learn', 'CNN', 'Random Forest', 'NLP'],
  'Web Development': ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express'],
  'AI Engineering': ['Cerebras', 'OpenAI API', 'ReAct Pattern', 'Multi-Agent Systems', 'Pyodide'],
  'Data & Analytics': ['Power BI', 'MySQL', 'Excel', 'Data Visualization'],
  'Tools': ['Git', 'GitHub Actions', 'Vercel', 'Render', 'Three.js', 'Framer Motion'],
}

const FUN_MESSAGES = [
  { text: "Nice scrolling! 👀", emoji: "👀" },
  { text: "Check out my AI agents! 🤖", emoji: "🤖" },
  { text: "Pro tip: Click the cards! 👆", emoji: "👆" },
  { text: "Sound on? 🔊", emoji: "🔊" },
  { text: "Scroll to the bottom for a surprise! 🎁", emoji: "🎁" },
  { text: "Keep going! 🚀", emoji: "🚀" },
]

// ============ CURTAIN WIPE ============

function CurtainTransition({ onWarp }: { onWarp: (type: string) => void }) {
  const [active, setActive] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const lastScrollY = useRef(0)
  const triggered = useRef(false)
  const dismissTimer = useRef<any>(null)
  const atBottomRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const atBottom = scrollY + windowHeight >= docHeight - 50
      const scrollingDown = scrollY > lastScrollY.current
      lastScrollY.current = scrollY
      if (atBottom && scrollingDown && !triggered.current) {
        if (!atBottomRef.current) {
          atBottomRef.current = true; setShowConfirm(true); onWarp('confirm')
          dismissTimer.current = setTimeout(() => { setShowConfirm(false); atBottomRef.current = false }, 5000)
        } else {
          clearTimeout(dismissTimer.current); setShowConfirm(false); triggered.current = true; setActive(true); onWarp('warp')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 2200)
          setTimeout(() => { setActive(false); triggered.current = false; atBottomRef.current = false }, 4000)
        }
      }
      if (!atBottom && atBottomRef.current && !triggered.current) { clearTimeout(dismissTimer.current); setShowConfirm(false); atBottomRef.current = false }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onWarp])

  return (
    <>
      <AnimatePresence>
        {showConfirm && !active && (
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] px-6 py-4 liquid-glass border border-teal-500/30 rounded-2xl shadow-2xl pointer-events-none"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="text-white font-semibold text-sm">Scroll once more to return to top</p>
                <p className="text-gray-400 text-xs mt-0.5">Or scroll up to stay</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[200] pointer-events-none overflow-hidden"
            initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 2.5 }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ y: '100%' }} animate={{ y: '-100%' }}
              transition={{ duration: 2, ease: [0.65, 0, 0.35, 1] }}
              style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #14b8a6 20%, #fbbf24 40%, #a855f7 60%, #f97316 80%, #0a0a0f 100%)' }}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.5, 1, 0], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 2 }}
                  className="text-5xl text-center"
                >✨</motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ============ TILT CARD (simplified) ============

function TiltCard({ project, onClick, onHover }: { project: any; onClick: () => void; onHover?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    rotateX.set(((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -8)
    rotateY.set(((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 8)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={onHover}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0) }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="liquid-glass h-full overflow-hidden group relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{project.icon}</span>
              <div>
                <CardTitle className="text-base text-white">{project.name}</CardTitle>
                <Badge variant="outline" className="mt-1 text-xs border-white/20 text-gray-400">{project.category}</Badge>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-teal-400 transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-3">{project.desc}</p>
          <div className="flex flex-wrap gap-1">
            {project.tech.slice(0, 4).map((t: string) => (
              <span key={t} className="text-xs px-2 py-0.5 bg-white/5 rounded text-gray-400 font-mono">{t}</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============ MAIN PAGE ============

export default function Home() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const [activeFilter, setActiveFilter] = useState('All')
  const [mounted, setMounted] = useState(false)
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null)
  const sound = useSoundEffects()
  const [popup, setPopup] = useState<{ text: string; emoji: string } | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Fun popups — every 20s (less frequent for performance)
  useEffect(() => {
    
    if (!mounted) return
    const interval = setInterval(() => {
      if (!sound.enabled) return
      const msg = FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)]
      setPopup(msg)
      setTimeout(() => setPopup(null), 3000)
    }, 20000)
    return () => clearInterval(interval)
  }, [mounted, sound.enabled])

  const filteredProjects = activeFilter === 'All' ? PROJECTS : PROJECTS.filter(p => p.category === activeFilter)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <style>{`@keyframes gradient-shift { 0% { background-position: 0% 50% } 100% { background-position: 200% 50% } }`}</style>

      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        {mounted && (
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} style={{ background: 'transparent' }}>
            <Suspense fallback={null}>
              <Scene3D />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} enableDamping dampingFactor={0.05} />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Fun popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] px-4 py-2 liquid-glass rounded-2xl shadow-2xl pointer-events-none"
          >
            <span className="text-lg mr-1">{popup.emoji}</span>
            <span className="text-sm font-medium text-white">{popup.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <CurtainTransition onWarp={(type) => { if (type === 'warp') sound.playWarp(); else sound.playPop() }} />

      {/* Nav */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6 }} className="fixed top-0 left-0 right-0 z-50 liquid-glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#hero" className="font-mono text-lg font-bold" style={{ background: 'linear-gradient(90deg, #14b8a6, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>&lt;arjun/&gt;</a>
          <div className="hidden md:flex items-center gap-2">
            {['Agents', 'Projects', 'About', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onMouseEnter={() => sound.playHover()} onClick={() => sound.playClick()} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">{item}</a>
            ))}
            <Button size="sm" variant="outline" className="ml-2 border-white/20 bg-white/5 text-white hover:bg-white/10" asChild>
              <a href="https://github.com/arjundroid12" target="_blank" rel="noopener" onMouseEnter={() => sound.playHover()}><Github className="w-4 h-4 mr-2" /> GitHub</a>
            </Button>
            <button aria-label={sound.enabled ? "Mute sounds" : "Enable sounds"} onClick={() => { if (!sound.enabled) { sound.getCtx(); sound.setEnabled(true); setTimeout(() => sound.playClick(), 100) } else sound.setEnabled(false) }} className="ml-2 p-2 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors">
              {sound.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section id="hero" style={{ opacity: heroOpacity }} className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
        <div className="text-center max-w-4xl">
          {/* Photo placeholder */}
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="relative w-36 h-36 md:w-44 md:h-44 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, #14b8a6, #fbbf24, #a855f7, #f97316, #14b8a6)', padding: 4, animation: 'spin 8s linear infinite' }}>
              <div className="w-full h-full rounded-full bg-[#0a0a0f]" />
            </div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center">
              <span className="text-5xl">👨‍💻</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-teal-500/10 border border-teal-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-mono text-teal-400">Available for opportunities</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <GradientText>Arjun Vashishtha</GradientText>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-xl md:text-2xl mb-4 font-mono">
            <GradientText>Software Management · Data Science · AI Builder</GradientText>
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-10">
            4th-year B.Tech CSE student at VIT Bhopal, currently at Techify Inc. Building autonomous AI agents, full-stack apps, and data-driven solutions.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex flex-wrap gap-4 justify-center mb-16">
            <Button size="lg" className="bg-gradient-to-r from-teal-500 to-amber-500 hover:from-teal-600 hover:to-amber-600 text-white border-0" asChild>
              <a href="#agents" onMouseEnter={() => sound.playHover()} onClick={() => sound.playClick()}><Brain className="w-4 h-4 mr-2" /> Explore AI Agents</a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" asChild>
              <a href="#projects" onMouseEnter={() => sound.playHover()} onClick={() => sound.playClick()}><Rocket className="w-4 h-4 mr-2" /> View Projects</a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" asChild>
              <a href="/resume.pdf" download onMouseEnter={() => sound.playHover()}><Download className="w-4 h-4 mr-2" /> Resume</a>
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex flex-wrap gap-3 justify-center">
            {['Python', 'React', 'Next.js', 'Cerebras', 'Power BI', 'MySQL', 'Three.js'].map((tech, i) => (
              <motion.span key={tech} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 + i * 0.08 }} whileHover={{ scale: 1.1, y: -3 }} onMouseEnter={() => sound.playHover()} className="px-3 py-1 text-xs font-mono text-gray-400 bg-black/40 border border-white/10 rounded-full cursor-pointer">{tech}</motion.span>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* AI Agents */}
      <section id="agents" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30 font-mono">{"// ai engineering"}</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4"><GradientText>AI Agents</GradientText></h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Autonomous AI systems — each demonstrating a different agent pattern</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {AI_AGENTS.map((agent, i) => (
              <motion.div key={agent.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} onMouseEnter={() => sound.playHover()}>
                <Card className="liquid-glass h-full relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, var(--tw-gradient-stops))` }} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-amber-500/20 border border-white/10"><agent.icon className="w-6 h-6 text-teal-400" /></div>
                      <Badge variant="outline" className={agent.difficulty === 'Advanced' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-teal-500/30 text-teal-400 bg-teal-500/10'}>{agent.difficulty}</Badge>
                    </div>
                    <CardTitle className="text-xl mt-4 text-white">{agent.name}</CardTitle>
                    <p className="text-sm text-teal-400 font-mono">{agent.tagline}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">{agent.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">{agent.tech.map((t) => <span key={t} className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-400 font-mono">{t}</span>)}</div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-to-r from-teal-500 to-amber-500 border-0 text-white flex-1" asChild><a href={agent.demo} target="_blank" rel="noopener" onClick={() => sound.playClick()}><ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Live Demo</a></Button>
                      <Button size="sm" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" asChild><a href={agent.repo} target="_blank" rel="noopener"><Github className="w-3.5 h-3.5 mr-1.5" /> Code</a></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ l: 'AI Agents Built', v: '4', c: 'text-teal-400' }, { l: 'Agent Patterns', v: '3', c: 'text-amber-400' }, { l: 'API Cost', v: '$0', c: 'text-purple-400' }, { l: 'Free Stack', v: '100%', c: 'text-orange-400' }].map((s, i) => (
              <motion.div key={s.l} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="liquid-glass text-center"><CardContent className="pt-6"><div className={`text-3xl font-bold ${s.c} font-mono`}>{s.v}</div><div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{s.l}</div></CardContent></Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono">{"// portfolio"}</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4"><GradientText>Projects</GradientText></h2>
            <p className="text-gray-500">{PROJECTS.length}+ projects built</p>
          </motion.div>

          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {['All', 'AI/ML', 'Frontend', 'Full-stack', 'Backend'].map((cat) => (
              <button key={cat} onClick={() => { setActiveFilter(cat); sound.playClick() }} onMouseEnter={() => sound.playHover()} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === cat ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
                {cat}<span className="ml-1.5 opacity-60">{cat === 'All' ? PROJECTS.length : PROJECTS.filter(p => p.category === cat).length}</span>
              </button>
            ))}
          </div>

          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div key={project.name} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                  <TiltCard project={project} onClick={() => { sound.playClick(); setSelectedProject(project) }} onHover={() => sound.playHover()} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono">{"// about me"}</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4"><GradientText>About Me</GradientText></h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 className="text-2xl font-bold mb-6">👋 Hey, I'm Arjun</h3>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>I'm a 4th-year B.Tech Computer Science & Engineering student at <span className="text-teal-400 font-semibold">VIT Bhopal University</span>, currently working in Software Management & Marketing at <span className="text-teal-400 font-semibold">Techify Inc.</span></p>
                <p>My foundation is in <span className="text-teal-400 font-semibold">Python, machine learning, and data analytics</span>, with hands-on experience building AI/ML projects. Recently, I've been building <span className="text-teal-400 font-semibold">AI engineering</span> — 4 production-ready AI agents using ReAct pattern, multi-agent orchestration, and in-browser Python execution.</p>
                <p>When I'm not coding, I'm creating UGC content, editing videos, and exploring music (vocalist and flutist).</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 className="text-2xl font-bold mb-6">🛠️ Skills</h3>
              <div className="space-y-5">
                {Object.entries(SKILLS).map(([category, skills]) => (
                  <div key={category}>
                    <div className="text-xs font-mono text-teal-400 mb-2 uppercase tracking-wider">{category}</div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => <span key={skill} onMouseEnter={() => sound.playPop()} className="px-3 py-1 text-sm bg-white/5 border border-white/10 rounded-lg font-mono text-gray-300 cursor-default hover:border-teal-500/30 transition-colors">{skill}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30 font-mono">{"// let's connect"}</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4"><GradientText>Get In Touch</GradientText></h2>
            <p className="text-gray-500">Open to opportunities, collaborations, and AI conversations</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Email', value: 'arjunvashishtha2004@gmail.com', href: 'mailto:arjunvashishtha2004@gmail.com', icon: Mail },
              { label: 'Phone', value: '+91 9105459616', href: 'tel:+919105459616', icon: Phone },
              { label: 'GitHub', value: '@arjundroid12', href: 'https://github.com/arjundroid12', icon: Github },
              { label: 'Location', value: 'Bhopal, India', href: '#', icon: MapPin },
            ].map((contact, i) => (
              <motion.a key={contact.label} href={contact.href} target={contact.href.startsWith('http') ? '_blank' : undefined} rel="noopener" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} onMouseEnter={() => sound.playPop()} onClick={() => sound.playClick()}>
                <Card className="liquid-glass text-center h-full"><CardContent className="pt-6 pb-4"><contact.icon className="w-6 h-6 mx-auto mb-3 text-teal-400" /><div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{contact.label}</div><div className="text-sm text-gray-300 font-mono truncate">{contact.value}</div></CardContent></Card>
              </motion.a>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="liquid-glass-strong text-center p-8">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-amber-400" />
              <h3 className="text-xl font-bold mb-3">Have a project in mind?</h3>
              <p className="text-gray-500 mb-6">I'm always interested in hearing about new ideas and AI collaborations.</p>
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-amber-500 hover:from-teal-600 hover:to-amber-600 border-0" asChild>
                <a href="mailto:arjunvashishtha2004@gmail.com" onMouseEnter={() => sound.playHover()} onClick={() => sound.playClick()}><Mail className="w-4 h-4 mr-2" /> Send me an email</a>
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 text-sm font-mono">Built with Next.js · Three.js · Framer Motion · © {new Date().getFullYear()} Arjun Vashishtha</p>
          <p className="text-teal-400/60 text-xs font-mono mt-2">💡 Scroll past the bottom to return to top...</p>
        </div>
      </footer>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl bg-[#0f0f1e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-1 bg-gradient-to-r from-teal-500 via-amber-500 to-purple-500" />
              <button aria-label="Close" onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6"><span className="text-5xl">{selectedProject.icon}</span><div><h3 className="text-2xl font-bold text-white">{selectedProject.name}</h3><Badge variant="outline" className="mt-1 border-teal-500/30 text-teal-400 bg-teal-500/10">{selectedProject.category}</Badge></div></div>
                <p className="text-gray-400 leading-relaxed mb-6">{selectedProject.longDesc}</p>
                <div className="mb-6"><h4 className="text-sm font-mono text-teal-400 mb-3 uppercase tracking-wider">Key Features</h4><div className="grid grid-cols-2 gap-2">{selectedProject.features.map((f: string, i: number) => <div key={f} className="flex items-center gap-2 text-sm text-gray-300"><span className="w-1.5 h-1.5 rounded-full bg-teal-400" />{f}</div>)}</div></div>
                <div className="mb-6"><h4 className="text-sm font-mono text-teal-400 mb-3 uppercase tracking-wider">Tech Stack</h4><div className="flex flex-wrap gap-2">{selectedProject.tech.map((t: string) => <span key={t} className="px-3 py-1 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 font-mono">{t}</span>)}</div></div>
                <div className="flex gap-3 pt-4 border-t border-white/5">
                  {selectedProject.demo && selectedProject.demo !== '#' && <Button className="bg-gradient-to-r from-teal-500 to-amber-500 border-0" asChild><a href={selectedProject.demo} target="_blank" rel="noopener"><ExternalLink className="w-4 h-4 mr-2" /> Live Demo</a></Button>}
                  {selectedProject.repo && <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" asChild><a href={selectedProject.repo} target="_blank" rel="noopener"><Github className="w-4 h-4 mr-2" /> View Code</a></Button>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
