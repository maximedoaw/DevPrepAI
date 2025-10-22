"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SettingsTab() {
  return (
    <Card className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">Paramètres entreprise</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Configurez les préférences de votre espace entreprise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
            <div>
              <Label htmlFor="auto-screening" className="text-slate-900 dark:text-white">Screening automatique</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Activez le screening automatique des candidatures
              </p>
            </div>
            <Switch id="auto-screening" />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
            <div>
              <Label htmlFor="email-notifications" className="text-slate-900 dark:text-white">Notifications email</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Recevez des notifications pour les nouvelles candidatures
              </p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
            <div>
              <Label htmlFor="candidate-feedback" className="text-slate-900 dark:text-white">Feedback automatique</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Envoyez automatiquement un feedback aux candidats
              </p>
            </div>
            <Switch id="candidate-feedback" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}