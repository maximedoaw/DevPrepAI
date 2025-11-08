import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Target, CheckCircle, Zap, ArrowRight, Rocket, Star } from "lucide-react";

export default function CareerAccelerator() {
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
                <div className="relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.3)] dark:shadow-[0_0_50px_rgba(74,222,128,0.4)] border border-green-500/20 dark:border-green-400/20 mx-4">
                    <img
                        src="/img3.PNG"
                        alt="Dashboard Preview - Interface de suivi de progression PrepWise"
                        className="w-full h-auto object-cover"
                        loading="lazy"
                    />
                    
                    {/* Overlay d'effet lumineux */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                </div>
            </div>

        </div>
    );
}