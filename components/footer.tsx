"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Facebook, Twitter, Linkedin, Github, HelpCircle, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  const iconsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (iconsRef.current) {
      const icons = iconsRef.current.querySelectorAll(".social-icon")
      gsap.fromTo(
        icons,
        { y: 0 },
        {
          y: -6,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          stagger: { each: 0.3 },
          scrollTrigger: {
            trigger: iconsRef.current,
            start: "top bottom",
          },
        }
      )
    }
  }, [])

  return (
    <footer className="relative pt-20 pb-10 bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-emerald-100 dark:border-emerald-900/20">
      {/* Effets de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 dark:bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="block w-48">
              <div className="relative h-16 w-full">
                <Image 
                  src="/Skillwokz.png" 
                  alt="Skillwokz" 
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              La plateforme qui révolutionne le recrutement tech en connectant les talents aux opportunités grâce à l'IA.
            </p>
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <MapPin className="w-4 h-4" />
              <span>Yaounde, Cameroun</span>
            </div>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
              Navigation
            </h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
              Aide & Support
            </h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3 group cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <HelpCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>Comment fonctionne l'IA de matching ?</span>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <HelpCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>Offres pour les écoles et bootcamps</span>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <HelpCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>Centre d'aide et documentation</span>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
              Suivez-nous
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Rejoignez notre communauté grandissante sur les réseaux sociaux.
            </p>
            <div ref={iconsRef} className="flex gap-4">
              {[
                { Icon: Linkedin, href: "https://linkedin.com" },
                { Icon: Twitter, href: "https://twitter.com" },
                { Icon: Github, href: "https://github.com" },
                { Icon: Facebook, href: "https://facebook.com" },
              ].map(({ Icon, href }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  target="_blank"
                  className="social-icon p-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bas de footer */}
        <div className="pt-8 border-t border-emerald-100 dark:border-emerald-900/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} SkillWokz. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-500">
            <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              CGU
            </Link>
            <Link href="/legal" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
