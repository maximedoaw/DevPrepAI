"use client"

import React from "react"
import { motion } from "framer-motion"
import { Facebook, Twitter, Linkedin, Github, MapPin, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative pt-24 pb-12 overflow-hidden border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30">
      {/* Subtle Aesthetic Background */}
      <div className="absolute inset-0 z-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-20">

          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              <div className="relative h-10 w-36">
                <Image
                  src="/Skillwokz.png"
                  alt="Skillwokz Logo"
                  fill
                  className="object-contain object-left dark:brightness-110"
                />
              </div>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
              L'accélérateur de carrière tech propulsé par l'IA pour les talents d'exception.
            </p>
            <div className="flex gap-4 pt-2">
              {[Linkedin, Twitter, Github, Facebook].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 mb-6">Plateforme</h4>
            <ul className="space-y-3">
              {["Simulateur IA", "Tarification", "À propos", "Blog"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 mb-6">Compagnie</h4>
            <ul className="space-y-3">
              {["Mentions Légales", "Confidentialité", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="lg:text-right">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 mb-6 lg:justify-end flex items-center gap-2">
              Nous rejoindre
            </h4>
            <Link href="/sign-up">
              <motion.button
                whileHover={{ x: 5 }}
                className="group inline-flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs"
              >
                Démarrer l'aventure
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ArrowUpRight size={14} />
                </div>
              </motion.button>
            </Link>
            <div className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 lg:justify-end">
              <MapPin size={10} className="text-emerald-500" />
              Yaoundé, Cameroun
            </div>
          </div>
        </div>

        {/* Minimal Copyright */}
        <div className="pt-10 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
            © {currentYear} SkillWokz. Tous droits réservés.
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600/50 dark:text-emerald-500/30">
            Built for the future of Africa
          </div>
        </div>
      </div>
    </footer>
  )
}
