"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, Loader2, Sparkles, Trophy } from "lucide-react"
import { createRitual } from "@/actions/community.action"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface CreateRitualModalProps {
    open: boolean
    onClose: () => void
    circleId: string
}

export function CreateRitualModal({ open, onClose, circleId }: CreateRitualModalProps) {
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!startDate || !endDate) {
            toast.error("Veuillez sélectionner les dates de début et de fin.")
            return
        }

        setIsLoading(true)
        try {
            const res = await createRitual(circleId, {
                name,
                description,
                startDate,
                endDate,
            })

            if (res.success) {
                toast.success("Le rituel a été lancé avec succès !")
                queryClient.invalidateQueries({ queryKey: ["circle", circleId] })
                onClose()
                // Reset form
                setName("")
                setDescription("")
                setStartDate(undefined)
                setEndDate(undefined)
            } else {
                toast.error(res.error || "Une erreur est survenue lors de la création.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erreur inattendue.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <div className="bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-950/20 p-6 md:p-8 flex flex-col gap-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider text-xs">
                        <Trophy className="w-4 h-4" />
                        Nouveau Défi
                    </div>
                    <DialogTitle className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        Lancer un rituel
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 text-base">
                        Fédérez la communauté autour d'un objectif commun.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Nom du rituel
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ex: Semaine de Code Intensive"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Description et Objectifs
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Détaillez le but du rituel et les actions attendues..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={4}
                                className="resize-none rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 flex flex-col">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date de début</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "h-12 w-full justify-start text-left font-normal rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date de fin</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "h-12 w-full justify-start text-left font-normal rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            disabled={(date) =>
                                                date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                                (startDate ? date < startDate : false)
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl h-12"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-purple-900/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Lancer le rituel
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
