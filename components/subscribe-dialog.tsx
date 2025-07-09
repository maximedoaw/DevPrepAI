"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useSubscribeStore } from "@/store/subscribe-store"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getActiveSubscription, subscribeUser } from "@/actions/subscription.action"
import { Card, CardHeader, CardTitle, CardContent as CardBody, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, BadgeCheck, Calendar, Zap, ArrowRight, Infinity as InfinityIcon } from "lucide-react"
import DevLoader from "@/components/dev-loader"

const SUBS = [
  { type: 'FREE', label: 'Gratuit', desc: '5000 crédits, accès limité', credits: 5000, color: 'bg-gray-100 text-gray-700', price: 0 },
  { type: 'PREMIUM', label: 'Premium', desc: '50000 crédits, accès avancé', credits: 50000, color: 'bg-yellow-100 text-yellow-800', price: 5000 },
  { type: 'EXPERT', label: 'Expert', desc: 'Crédits illimités, toutes fonctionnalités', credits: 999999999, color: 'bg-purple-100 text-purple-800', price: 9000 },
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

export default function SubscribeDialog() {
  const { isOpen, close, pendingAfterAuth, setPendingAfterAuth } = useSubscribeStore()
  const { isAuthenticated, isLoading, user } = useKindeBrowserClient()
  const [subscriptionType, setSubscriptionType] = useState('FREE')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [currentSub, setCurrentSub] = useState<any>(null)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const router = useRouter()

  // Gestion ouverture auto après login
  useEffect(() => {
    if (isAuthenticated && pendingAfterAuth) {
      setTimeout(() => {
        useSubscribeStore.getState().open()
        setPendingAfterAuth(false)
      }, 300)
    }
  }, [isAuthenticated, pendingAfterAuth, setPendingAfterAuth])

  // Chargement de l'abonnement courant (optionnel)
  // useEffect(() => { ... })

  if (isLoading || (!user && isAuthenticated)) {
    return <DevLoader/>
  }

  return (
    <Dialog open={isOpen} onOpenChange={v => !v && close()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-xl shadow-xl border-0 bg-white/95">
        {/* Titre accessible pour Radix, masqué visuellement */}
        <DialogTitle className="sr-only">Abonnement</DialogTitle>
        <div className="flex flex-col items-center justify-center py-4 px-2 sm:px-6 max-h-[90vh] overflow-y-auto">
          <div className="w-full">
            {/* Header visuel */}
            <div className="flex flex-col items-center mb-4">
              <Zap className="h-8 w-8 text-purple-600 mb-1 animate-bounce" />
              <h1 className="text-xl font-bold text-center text-gray-900 mb-1">Choisissez votre abonnement</h1>
              <p className="text-center text-gray-500 text-sm max-w-xs">Débloquez tout le potentiel de DevPrepAi avec un abonnement adapté à vos besoins.</p>
            </div>
            {/* Abonnement en cours */}
            {currentSub && (
              <Card className="mb-4 border-2 border-purple-200 bg-purple-50/60 shadow animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <BadgeCheck className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">Abonnement en cours</CardTitle>
                </CardHeader>
                <CardBody className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${SUBS.find(s => s.type === currentSub.tier)?.color || 'bg-gray-200 text-gray-700'}`}>{currentSub.tier}</span>
                    <span className="text-xs text-gray-700">Crédits : <b>{userCredits === 999999999 ? <InfinityIcon className="inline w-4 h-4 text-purple-600" /> : userCredits}</b></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="h-4 w-4 mr-1 text-purple-500" />
                    Fin : <b>{formatDate(currentSub.endDate)}</b>
                  </div>
                </CardBody>
              </Card>
            )}
            {/* Formulaire de souscription */}
            <Card className="w-full shadow border-0 bg-white/95 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-center mb-1">Souscrire à un abonnement</CardTitle>
                <CardDescription className="text-center text-sm text-gray-500">Choisissez votre formule et débloquez tout le potentiel de Prepwise !</CardDescription>
              </CardHeader>
              <form onSubmit={async (e) => {
                e.preventDefault()
                setLoading(true)
                try {
                  if (!user) throw new Error("Non authentifié")
                  const res = await subscribeUser({ userId: user.id, subscriptionType: subscriptionType as any, paymentMethod: paymentMethod as any })
                  if (res.success) {
                    toast.success("Abonnement activé ! Profitez de toutes les fonctionnalités.")
                    close()
                    router.push("/")
                  } else {
                    toast.error(res.error || "Erreur lors de la souscription.")
                  }
                } catch (err) {
                  toast.error("Erreur inattendue lors de la souscription.")
                } finally {
                  setLoading(false)
                }
              }}>
                <CardBody className="space-y-4">
                  <div>
                    <div className="mb-1 font-medium text-sm">Type d'abonnement</div>
                    <div className="flex gap-2 flex-col md:flex-row">
                      {SUBS.map(sub => (
                        <label key={sub.type} className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all duration-200 flex flex-col items-start gap-1 ${subscriptionType === sub.type ? 'border-blue-600 bg-blue-50 shadow' : 'border-gray-200 bg-white'}`}>
                          <input
                            type="radio"
                            name="subscriptionType"
                            value={sub.type}
                            checked={subscriptionType === sub.type}
                            onChange={() => setSubscriptionType(sub.type)}
                            className="mr-2 hidden"
                          />
                          <span className="font-semibold text-base flex items-center gap-2">{sub.label} {subscriptionType === sub.type && <ArrowRight className="h-4 w-4 text-blue-500 animate-pulse" />}</span>
                          <div className="text-xs text-gray-700 font-bold mb-1">{sub.price === 0 ? 'Gratuit' : `${sub.price} FCFA / mois`}</div>
                          <div className="text-xs text-gray-500 mt-1">{sub.desc}</div>
                          <div className="text-xs mt-2">Crédits : <span className="font-bold">{sub.credits === 999999999 ? <InfinityIcon className="inline w-4 h-4 text-purple-600" /> : sub.credits}</span></div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-medium text-sm">Mode de paiement</div>
                    <div className="flex gap-2 flex-col md:flex-row">
                      {PAYMENTS.map(pm => (
                        <label key={pm.value} className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all duration-200 flex items-center gap-2 ${paymentMethod === pm.value ? 'border-green-600 bg-green-50 shadow' : 'border-gray-200 bg-white'}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={pm.value}
                            checked={paymentMethod === pm.value}
                            onChange={() => setPaymentMethod(pm.value)}
                            className="mr-2 hidden"
                          />
                          <span className="font-semibold text-sm">{pm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardBody>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full py-2 text-base font-bold rounded-lg mt-2 bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? <><Loader2 className="inline mr-2 animate-spin" />Traitement...</> : 'Souscrire'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 