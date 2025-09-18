"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Facebook, Twitter, Linkedin, Github, HelpCircle, Mail } from "lucide-react"
import Link from "next/link"

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
    <footer className="relative py-12 mt-20 bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
        {/* Liens utiles */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li><Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400">À propos</Link></li>
            <li><Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400">Tarifs</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">Contact</Link></li>
          </ul>
        </div>

        {/* FAQ */}
        <div>
          <h3 className="text-lg font-semibold mb-4">FAQ rapide</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-center justify-center md:justify-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>Puis-je tester gratuitement ?</span>
            </li>
            <li className="flex items-center justify-center md:justify-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>Comment fonctionne l’IA ?</span>
            </li>
            <li className="flex items-center justify-center md:justify-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>Proposez-vous des offres pour écoles ?</span>
            </li>
          </ul>
        </div>

        {/* Réseaux sociaux */}
        <div className="flex flex-col items-center md:items-end space-y-4">
          <h3 className="text-lg font-semibold">Suivez-nous</h3>
          <div ref={iconsRef} className="flex gap-5 mt-2">
            {[
              { Icon: Facebook, href: "https://facebook.com" },
              { Icon: Twitter, href: "https://twitter.com" },
              { Icon: Linkedin, href: "https://linkedin.com" },
              { Icon: Github, href: "https://github.com" },
              { Icon: Mail, href: "mailto:contact@turbointmax.com" },
            ].map(({ Icon, href }, idx) => (
              <Link
                key={idx}
                href={href}
                target="_blank"
                className="social-icon p-2 rounded-full bg-white/40 dark:bg-slate-800/60 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300"
              >
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bas de footer */}
      <div className="mt-12 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} TurboIntMax. Tous droits réservés.
      </div>
    </footer>
  )
}
