"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Rocket, Target, BarChart, Users, ChevronRight, ArrowRight } from "lucide-react"
import { useRef, useEffect, Suspense } from "react"
import gsap from "gsap"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei"
import * as THREE from "three"

// Composant de cube 3D flottant
function FloatingCube({ position, scale, color }: { position: [number, number, number], scale: number, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2
    }
  })
  
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  )
}

// Composant de sphère distordue
function DistortedSphere({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <Sphere args={[0.8, 64, 64]} position={position}>
        <MeshDistortMaterial 
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  )
}

// Scène 3D de fond
function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {/* Cubes flottants */}
      <FloatingCube position={[-4, 2, -5]} scale={0.5} color="#3b82f6" />
      <FloatingCube position={[4, -1, -4]} scale={0.4} color="#8b5cf6" />
      <FloatingCube position={[-3, -2, -6]} scale={0.3} color="#ec4899" />
      <FloatingCube position={[3, 3, -5]} scale={0.35} color="#06b6d4" />
      
      {/* Sphères distordues */}
      <DistortedSphere position={[5, 1, -8]} color="#6366f1" />
      <DistortedSphere position={[-5, -1, -7]} color="#a855f7" />
    </>
  )
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const sloganRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation du titre avec effet élastique
      gsap.fromTo(".title-part", 
        { 
          opacity: 0, 
          y: 50,
          scale: 0.9
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "elastic.out(1, 0.8)",
          stagger: 0.2
        }
      )

      // Animation du sous-titre
      gsap.fromTo(subtitleRef.current, 
        { 
          opacity: 0, 
          y: 30 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          delay: 0.8,
          ease: "power3.out" 
        }
      )

      // Animation du slogan avec rotation
      gsap.fromTo(".slogan-word", 
        { 
          opacity: 0, 
          y: 20,
          rotation: -8,
          scale: 0.8
        },
        { 
          opacity: 1, 
          y: 0,
          rotation: 0, 
          scale: 1,
          duration: 0.9, 
          delay: 1.2,
          stagger: 0.12,
          ease: "back.out(2)" 
        }
      )

      // Animation du CTA avec bounce
      gsap.fromTo(ctaRef.current, 
        { 
          opacity: 0, 
          scale: 0.8,
          y: 30
        },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          duration: 1, 
          delay: 1.8,
          ease: "back.out(1.7)" 
        }
      )

      // Animation des features avec profondeur
      gsap.fromTo(".feature-block", 
        { 
          opacity: 0, 
          y: 60,
          scale: 0.9,
          rotateX: 45
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          rotateX: 0,
          duration: 1, 
          delay: 2.0,
          stagger: 0.2,
          ease: "power3.out" 
        }
      )

      // Animation des icônes avec rotation 3D
      gsap.fromTo(".feature-icon", 
        { 
          opacity: 0, 
          scale: 0,
          rotateY: 180
        },
        { 
          opacity: 1, 
          scale: 1,
          rotateY: 0, 
          duration: 0.8, 
          delay: 2.3,
          stagger: 0.15,
          ease: "back.out(2)" 
        }
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
<section 
  ref={heroRef}
  className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100"
>
  {/* Grille d'arrière-plan très visible */}
  <div className="absolute inset-0 opacity-40 dark:opacity-30">
    {/* Grille principale */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0002_1px,transparent_1px),linear-gradient(to_bottom,#0002_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_70%)] dark:bg-[linear-gradient(to_right,#fff3_1px,transparent_1px),linear-gradient(to_bottom,#fff3_1px,transparent_1px)]" />
    
    {/* Points aux intersections */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_calc(60px*0.5)_calc(60px*0.5),_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent bg-[length:60px_60px] dark:from-blue-500/20" />
    
    {/* Lignes de connexion animées */}
    <div className="absolute inset-0">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent dark:via-blue-500/30 animate-pulse"
          style={{
            top: `${20 + (i * 8)}%`,
            left: '10%',
            right: '10%',
            animationDelay: `${i * 0.3}s`,
            animationDuration: '4s'
          }}
        />
      ))}
    </div>
  </div>

  {/* Canvas Three.js en arrière-plan */}
  <div className="absolute inset-0 opacity-60 dark:opacity-40">
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>
    </Canvas>
  </div>

  {/* Gradient overlay pour améliorer la lisibilité */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/40 dark:via-slate-900/40 dark:to-slate-900/70 pointer-events-none" />
  
  {/* Ombres portées dynamiques */}
  <div className="absolute inset-0">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
  </div>
  
  <div className="container relative z-10 py-20 md:py-28">
    <div className="max-w-5xl mx-auto text-center">
      {/* Titre principal */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8">
        <span className="title-part block drop-shadow-2xl">
          L'accélérateur de carrière
        </span>
        <span className="title-part block mt-3">
          propulsé par{" "}
          <span className="inline-block relative">
            <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-amber-400 dark:via-orange-400 dark:to-pink-400 drop-shadow-lg">
              l'IA
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-amber-400/20 dark:via-orange-400/20 dark:to-pink-400/20 blur-xl -z-10" />
          </span>
        </span>
      </h1>
      
      {/* Sous-titre */}
      <p ref={subtitleRef} className="text-xl md:text-2xl lg:text-3xl dark:text-slate-300 text-slate-700 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
        Transforme ta préparation aux entretiens en{" "}
        <span className="font-bold dark:text-amber-300 text-blue-600 relative inline-block">
          avantage décisif
          <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
            <path d="M0,4 Q50,0 100,4 T200,4" stroke="currentColor" strokeWidth="3" fill="none" className="text-blue-500 dark:text-amber-400" />
          </svg>
        </span>
      </p>
      
      {/* Slogan avec effets */}
      <div ref={sloganRef} className="mb-14 text-lg md:text-xl lg:text-2xl font-bold space-y-3">
        <p className="drop-shadow-lg">
          <span className="slogan-word inline-block dark:text-amber-400 text-blue-600 px-3 py-1 -rotate-2 bg-amber-400/10 dark:bg-amber-400/10 rounded-lg shadow-lg">
            Perfectionne
          </span>
          <span className="dark:text-slate-300 text-slate-700 mx-2">tes réponses,</span>
          <span className="slogan-word inline-block dark:text-purple-400 text-purple-600 px-3 py-1 rotate-2 bg-purple-400/10 dark:bg-purple-400/10 rounded-lg shadow-lg">
            impressionne
          </span>
          <span className="dark:text-slate-300 text-slate-700 mx-2">les recruteurs</span>
        </p>
        <p className="drop-shadow-lg">
          <span className="slogan-word inline-block dark:text-cyan-400 text-cyan-600 px-3 py-1 -rotate-1 bg-cyan-400/10 dark:bg-cyan-400/10 rounded-lg shadow-lg">
            Maîtrise
          </span>
          <span className="dark:text-slate-300 text-slate-700 mx-2">les défis,</span>
          <span className="slogan-word inline-block dark:text-pink-400 text-pink-600 px-3 py-1 rotate-1 bg-pink-400/10 dark:bg-pink-400/10 rounded-lg shadow-lg">
            décroche
          </span>
          <span className="dark:text-slate-300 text-slate-700 mx-2">le poste</span>
        </p>
      </div>
      
      {/* CTAs */}
      <div ref={ctaRef} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
        <Button 
          asChild 
          size="lg" 
          className="group relative gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 dark:from-amber-500 dark:via-orange-500 dark:to-pink-500 dark:hover:from-amber-600 dark:hover:via-orange-600 dark:hover:to-pink-600 text-white text-lg px-10 py-7 rounded-2xl shadow-2xl hover:shadow-blue-500/50 dark:hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300"
        >
          <Link href="/signup">
            <Rocket className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            Propulser ma carrière
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
          </Link>
        </Button>
        <Button 
          asChild 
          variant="outline" 
          size="lg" 
          className="group gap-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 text-lg px-10 py-7 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-xl bg-white/50 dark:bg-slate-800/50"
        >
          <Link href="/demo">
            Voir la démo
            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>

    {/* Features cards avec effets NEON améliorés */}
    <div ref={featuresRef} className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto perspective-1000">
      {/* Feature 1 */}
      <div className="feature-block group relative bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/95 from-white/90 to-slate-100/95 border border-slate-300/50 dark:border-slate-600/50 p-8 rounded-3xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-3 transform-gpu overflow-hidden">
        {/* Grille de fond permanente */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0001_1px,transparent_1px),linear-gradient(to_bottom,#0001_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 dark:bg-[linear-gradient(to_right,#fff2_1px,transparent_1px),linear-gradient(to_bottom,#fff2_1px,transparent_1px)] dark:opacity-30" />
        
        {/* Effet NEON au hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-500 p-[3px] blur-0 group-hover:blur-[2px]">
          <div className="w-full h-full bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 from-white to-slate-100 rounded-3xl" />
        </div>
        
        {/* Lueur NEON intense */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/0 via-cyan-500/30 to-purple-500/0 opacity-0 group-hover:opacity-100 blur-3xl scale-95 group-hover:scale-105 transition-all duration-700" />
        
        {/* Points de connexion NEON */}
        <div className="absolute inset-3 rounded-2xl border-2 border-transparent group-hover:border-blue-400/30 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500" />
        
        <div className="relative z-10">
          <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/30 p-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-xl group-hover:shadow-blue-500/50">
            <Target className="feature-icon h-10 w-10 text-blue-600 dark:text-blue-400 drop-shadow-lg group-hover:text-blue-500 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300" />
          </div>
          <h3 className="text-2xl font-black mb-4 dark:text-white text-slate-800 drop-shadow-sm group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors duration-300">
            Préparation Ciblée
          </h3>
          <p className="dark:text-slate-300 text-slate-600 mb-5 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300">
            Des exercices adaptés à ton domaine et niveau pour maximiser ton impact.
          </p>
          <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold group-hover:gap-3 gap-2 transition-all group-hover:text-cyan-500 dark:group-hover:text-cyan-300">
            <span className="group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-300">Commencer</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          </div>
        </div>
      </div>
      
      {/* Feature 2 */}
      <div className="feature-block group relative bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/95 from-white/90 to-slate-100/95 border border-slate-300/50 dark:border-slate-600/50 p-8 rounded-3xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-3 transform-gpu overflow-hidden">
        {/* Grille de fond permanente */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0001_1px,transparent_1px),linear-gradient(to_bottom,#0001_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 dark:bg-[linear-gradient(to_right,#fff2_1px,transparent_1px),linear-gradient(to_bottom,#fff2_1px,transparent_1px)] dark:opacity-30" />
        
        {/* Effet NEON au hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-500 p-[3px] blur-0 group-hover:blur-[2px]">
          <div className="w-full h-full bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 from-white to-slate-100 rounded-3xl" />
        </div>
        
        {/* Lueur NEON intense */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/0 via-pink-500/30 to-rose-500/0 opacity-0 group-hover:opacity-100 blur-3xl scale-95 group-hover:scale-105 transition-all duration-700" />
        
        {/* Points de connexion NEON */}
        <div className="absolute inset-3 rounded-2xl border-2 border-transparent group-hover:border-purple-400/30 group-hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] transition-all duration-500" />
        
        <div className="relative z-10">
          <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/30 p-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-xl group-hover:shadow-purple-500/50">
            <BarChart className="feature-icon h-10 w-10 text-purple-600 dark:text-purple-400 drop-shadow-lg group-hover:text-purple-500 group-hover:drop-shadow-[0_0_10px_rgba(192,132,252,0.5)] transition-all duration-300" />
          </div>
          <h3 className="text-2xl font-black mb-4 dark:text-white text-slate-800 drop-shadow-sm group-hover:text-purple-600 dark:group-hover:text-pink-300 transition-colors duration-300">
            Progression Mesurable
          </h3>
          <p className="dark:text-slate-300 text-slate-600 mb-5 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300">
            Suis tes progrès avec des analytics détaillés et des recommandations IA.
          </p>
          <div className="flex items-center text-purple-600 dark:text-purple-400 font-bold group-hover:gap-3 gap-2 transition-all group-hover:text-pink-500 dark:group-hover:text-pink-300">
            <span className="group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.6)] transition-all duration-300">Progresser</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
          </div>
        </div>
      </div>
      
      {/* Feature 3 */}
      <div className="feature-block group relative bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/95 from-white/90 to-slate-100/95 border border-slate-300/50 dark:border-slate-600/50 p-8 rounded-3xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-3 transform-gpu overflow-hidden">
        {/* Grille de fond permanente */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0001_1px,transparent_1px),linear-gradient(to_bottom,#0001_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 dark:bg-[linear-gradient(to_right,#fff2_1px,transparent_1px),linear-gradient(to_bottom,#fff2_1px,transparent_1px)] dark:opacity-30" />
        
        {/* Effet NEON au hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-500 p-[3px] blur-0 group-hover:blur-[2px]">
          <div className="w-full h-full bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 from-white to-slate-100 rounded-3xl" />
        </div>
        
        {/* Lueur NEON intense */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/0 via-green-500/30 to-emerald-500/0 opacity-0 group-hover:opacity-100 blur-3xl scale-95 group-hover:scale-105 transition-all duration-700" />
        
        {/* Points de connexion NEON */}
        <div className="absolute inset-3 rounded-2xl border-2 border-transparent group-hover:border-cyan-400/30 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-500" />
        
        <div className="relative z-10">
          <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/30 p-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-xl group-hover:shadow-cyan-500/50">
            <Users className="feature-icon h-10 w-10 text-cyan-600 dark:text-cyan-400 drop-shadow-lg group-hover:text-cyan-500 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-300" />
          </div>
          <h3 className="text-2xl font-black mb-4 dark:text-white text-slate-800 drop-shadow-sm group-hover:text-cyan-600 dark:group-hover:text-green-300 transition-colors duration-300">
            Communauté d'Experts
          </h3>
          <p className="dark:text-slate-300 text-slate-600 mb-5 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300">
            Échange avec une communauté de pros et bénéficie de conseils experts.
          </p>
          <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-bold group-hover:gap-3 gap-2 transition-all group-hover:text-green-500 dark:group-hover:text-green-300">
            <span className="group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all duration-300">Rejoindre</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  )
}