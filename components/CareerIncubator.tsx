import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Target, CheckCircle, Zap, ArrowRight, Rocket, Star } from "lucide-react";

export default function CareerAccelerator() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Détection du thème
    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };
        
        // Vérifier initialement
        checkDarkMode();
        
        // Observer les changements de thème
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        return () => observer.disconnect();
    }, []);
    
    const imageSrc = isDarkMode ? "/lightmode.PNG" : "/darkmode.PNG";
    
    return (
        <div className="relative mb-20">
            {/* Message d'inspiration */}
            <div className="text-center mb-12">
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                    Commencez votre ascension vers le succès
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Visualisez votre transformation en temps réel
                </p>
            </div>

            {/* Timeline avec image */}
            <div className="relative max-w-5xl mx-auto">
                {/* Image du dashboard */}
                <div className={`
                    relative rounded-2xl overflow-hidden 
                    shadow-[0_0_40px_rgba(120,200,140,0.25)] 
                    dark:shadow-[0_0_50px_rgba(100,220,150,0.3)] 
                    border
                    ${isDarkMode 
                        ? 'border-emerald-400/30 dark:border-emerald-400/30' 
                        : 'border-emerald-500/20 border-emerald-500/20'
                    }
                    mx-4
                    transition-all duration-300
                    hover:shadow-[0_0_50px_rgba(120,200,140,0.35)]
                    dark:hover:shadow-[0_0_60px_rgba(100,220,150,0.4)]
                    hover:border-emerald-500/30
                    dark:hover:border-emerald-400/40
                `}>
                    <img
                        src={imageSrc}
                        alt="Dashboard Preview - Interface de suivi de progression PrepWise"
                        className="w-full h-auto object-cover transition-all duration-300"
                        loading="lazy"
                    />
                    
                    {/* Overlay d'effet lumineux avec dégradé adaptatif */}
                    <div className={`
                        absolute inset-0 
                        ${isDarkMode 
                            ? 'bg-gradient-to-t from-black/5 via-transparent to-transparent' 
                            : 'bg-gradient-to-t from-white/5 via-transparent to-transparent'
                        }
                        pointer-events-none
                    `} />
                    
                    {/* Effet de brillance subtile */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
                
                {/* Badge indicateur de thème (optionnel - utile pour le debug) */}
                <div className="absolute -top-2 right-6 opacity-0">
                    <Badge variant="outline" className={`
                        ${isDarkMode 
                            ? 'bg-emerald-900/20 text-emerald-300 border-emerald-700/30' 
                            : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        }
                    `}>
                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </Badge>
                </div>
            </div>
        </div>
    );
}