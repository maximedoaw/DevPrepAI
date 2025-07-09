"use client"

import React, { useState, useEffect } from "react"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useRouter } from "next/navigation"
import { getActiveSubscription, subscribeUser } from "@/actions/subscription.action"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, BadgeCheck, Calendar, Zap, ArrowRight } from "lucide-react"
import DevLoader from "@/components/dev-loader"
import { useQuery } from "@tanstack/react-query"

const SUBS = [
  { type: 'FREE', label: 'Gratuit', desc: '5000 crédits, accès limité', credits: 5000, color: 'bg-gray-100 text-gray-700' },
  { type: 'PREMIUM', label: 'Premium', desc: '50000 crédits, accès avancé', credits: 50000, color: 'bg-yellow-100 text-yellow-800' },
  { type: 'EXPERT', label: 'Expert', desc: 'Crédits illimités, toutes fonctionnalités', credits: 999999999, color: 'bg-purple-100 text-purple-800' },
]
const PAYMENTS = [
  { value: 'card', label: 'Carte bancaire' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'om', label: 'Orange Money' },
]

function formatDate(dateStr: string | Date) {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function SubscribePage() {
  const { isAuthenticated, isLoading, user } = useKindeBrowserClient()
  const [subscriptionType, setSubscriptionType] = useState('FREE')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [currentSub, setCurrentSub] = useState<any>(null)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const router = useRouter()

  // Redirection si non connecté
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
    }
  }, [isLoading, isAuthenticated])

  // Redirection si déjà abonné
  //  const { data } = useQuery({
  //    queryKey: ['currentSub'],
   //   queryFn: async () => await getActiveSubscription(user?.id || ""),
  //  })

 // useEffect(() => {

 //   if (data) {
 //    router.push("/") 
 //   }
 // }, [isAuthenticated, user, router, data])

  if (isLoading || (!user && isAuthenticated)) {
    return <DevLoader/>
  }

  if (!isAuthenticated || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await subscribeUser({ userId: user.id, subscriptionType: subscriptionType as any, paymentMethod: paymentMethod as any })
      if (res.success) {
        toast.success("Abonnement activé ! Profitez de toutes les fonctionnalités.")
        router.push("/")
      } else {
        toast.error(res.error || "Erreur lors de la souscription.")
      }
    } catch (err) {
      toast.error("Erreur inattendue lors de la souscription.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-2">
      <div className="w-full max-w-2xl">
        {/* Header visuel */}
        <div className="flex flex-col items-center mb-8">
          <Zap className="h-12 w-12 text-purple-600 mb-2 animate-bounce" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-2">Choisissez votre abonnement</h1>
          <p className="text-center text-gray-500 max-w-xl">Débloquez tout le potentiel de DevPrepAi avec un abonnement adapté à vos besoins. Profitez de crédits quotidiens pour progresser chaque jour !</p>
        </div>
        {/* Abonnement en cours */}
        {currentSub && (
          <Card className="mb-8 border-2 border-purple-200 bg-purple-50/60 shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <BadgeCheck className="h-6 w-6 text-green-600" />
              <CardTitle className="text-lg">Abonnement en cours</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-0">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${SUBS.find(s => s.type === currentSub.tier)?.color || 'bg-gray-200 text-gray-700'}`}>{currentSub.tier}</span>
                <span className="text-sm text-gray-700">Crédits quotidiens : <b>{userCredits === 999999999 ? 'Infini' : userCredits}</b></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1 text-purple-500" />
                Fin : <b>{formatDate(currentSub.endDate)}</b>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Formulaire de souscription */}
        <Card className="w-full shadow-2xl border-0 bg-white/90 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center mb-2">Souscrire à un abonnement</CardTitle>
            <CardDescription className="text-center text-base text-gray-500">Choisissez votre formule et débloquez tout le potentiel de Prepwise !</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 font-medium">Type d'abonnement</div>
                <div className="flex gap-4 flex-col md:flex-row">
                  {SUBS.map(sub => (
                    <label key={sub.type} className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col items-start gap-1 ${subscriptionType === sub.type ? 'border-blue-600 bg-blue-50 shadow' : 'border-gray-200 bg-white'}`}>
                      <input
                        type="radio"
                        name="subscriptionType"
                        value={sub.type}
                        checked={subscriptionType === sub.type}
                        onChange={() => setSubscriptionType(sub.type)}
                        className="mr-2 hidden"
                      />
                      <span className="font-semibold text-lg flex items-center gap-2">{sub.label} {subscriptionType === sub.type && <ArrowRight className="h-4 w-4 text-blue-500 animate-pulse" />}</span>
                      <div className="text-xs text-gray-500 mt-1">{sub.desc}</div>
                      <div className="text-sm mt-2">Crédits quotidiens : <span className="font-bold">{sub.credits === 999999999 ? 'Infini' : sub.credits}</span></div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 font-medium">Mode de paiement</div>
                <div className="flex gap-4 flex-col md:flex-row">
                  {PAYMENTS.map(pm => (
                    <label key={pm.value} className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center gap-2 ${paymentMethod === pm.value ? 'border-green-600 bg-green-50 shadow' : 'border-gray-200 bg-white'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.value}
                        checked={paymentMethod === pm.value}
                        onChange={() => setPaymentMethod(pm.value)}
                        className="mr-2 hidden"
                      />
                      <span className="font-semibold">{pm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full py-3 text-lg font-bold rounded-xl mt-4 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? <><Loader2 className="inline mr-2 animate-spin" />Traitement...</> : 'Souscrire'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
