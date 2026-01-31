"use client"

import { useState, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUploadThing } from "@/lib/uploadthing"
import { useDropzone } from "react-dropzone"
import { Sparkles, Users, Calendar, Target, Loader2, ArrowRight, Camera, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface CreateCircleModalProps {
    open: boolean
    onClose: () => void
    onCreate: (data: any) => Promise<void>
}

export function CreateCircleModal({ open, onClose, onCreate }: CreateCircleModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        targetCareer: "",
        level: "Débutant",
        maxMembers: 12,
        duration: "",
        imageUrl: ""
    })

    const { startUpload, isUploading } = useUploadThing("mediaUploader")

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { "image/*": [] }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            let finalImageUrl = formData.imageUrl

            if (imageFile) {
                const uploadRes = await startUpload([imageFile])
                if (uploadRes && uploadRes[0]) {
                    finalImageUrl = uploadRes[0].url
                } else {
                    toast.error("Échec de l'upload de l'image")
                    setIsLoading(false)
                    return
                }
            }

            await onCreate({
                ...formData,
                duration: formData.duration ? parseInt(formData.duration) : null,
                imageUrl: finalImageUrl
            })

            // Reset
            setFormData({
                name: "",
                description: "",
                targetCareer: "",
                level: "Débutant",
                maxMembers: 12,
                duration: "",
                imageUrl: ""
            })
            setImageFile(null)
            setImagePreview(null)
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de la création")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl bg-white dark:bg-slate-950 flex flex-col h-[95vh] sm:h-auto sm:max-h-[90vh]">

                {/* Header Section */}
                <div className="flex-none p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-emerald-50/50 via-white to-transparent dark:from-emerald-950/20 dark:via-slate-950">
                    <div className="space-y-2">
                        <Badge variant="outline" className="bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            ✨ Nouvelle Aventure
                        </Badge>
                        <DialogTitle className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Bâtir votre cercle
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                            Un espace de proximité pour réussir ensemble.
                        </DialogDescription>
                    </div>
                </div>

                {/* Form Section - Scrollable Area */}
                <ScrollArea className="flex-1 overflow-y-auto">
                    <form id="create-circle-form" onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 pb-10">

                        <div className="space-y-8">
                            {/* Image Upload Section */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                                    Image de couverture
                                </Label>

                                {imagePreview ? (
                                    <div className="relative group w-full h-40 rounded-2xl overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/30">
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <Button type="button" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => setImageFile(null) || setImagePreview(null)}>
                                                <X className="w-4 h-4 mr-2" /> Changer
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        {...getRootProps()}
                                        className={`
                                            w-full h-40 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
                                            ${isDragActive
                                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                                                : "border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                            }
                                        `}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mb-2">
                                            <Camera className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Ajouter une image</p>
                                        <p className="text-[10px] text-slate-500 mt-1">PNG ou JPG (max 4MB)</p>
                                    </div>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                    Identité
                                </Label>
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold">Nom du cercle *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Développeurs Abidjan"
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-semibold">Vision & Mission</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Décrivez votre vision..."
                                        rows={3}
                                        className="rounded-xl resize-none"
                                    />
                                </div>
                            </div>

                            {/* Target & Level */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5 text-blue-500" />
                                    Ciblage
                                </Label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="targetCareer" className="text-sm font-semibold">Métier visé *</Label>
                                        <Input
                                            id="targetCareer"
                                            value={formData.targetCareer}
                                            onChange={(e) => setFormData({ ...formData, targetCareer: e.target.value })}
                                            placeholder="Ex: UX Architect"
                                            required
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Niveau d'entrée</Label>
                                        <Select value={formData.level} onValueChange={(val) => setFormData({ ...formData, level: val })}>
                                            <SelectTrigger className="h-11 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="Débutant" className="rounded-lg">Débutant (Curieux)</SelectItem>
                                                <SelectItem value="Intermédiaire" className="rounded-lg">Intermédiaire (Apprenant)</SelectItem>
                                                <SelectItem value="Avancé" className="rounded-lg">Avancé (Pratiquant)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Parameters */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                    Cycle de vie
                                </Label>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="duration" className="text-sm font-semibold">Durée du cycle (jours)</Label>
                                        <Badge variant="outline" className="text-[9px] h-4 bg-slate-50 dark:bg-slate-900 border-none">Optionnel</Badge>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="duration"
                                            type="number"
                                            min={1}
                                            max={90}
                                            value={formData.duration}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "" || (parseInt(val) <= 90 && parseInt(val) >= 0)) {
                                                    setFormData({ ...formData, duration: val })
                                                }
                                            }}
                                            placeholder="Illimité"
                                            className="h-11 rounded-xl pr-12"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">JOURS</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </ScrollArea>

                {/* Footer Section */}
                <div className="flex-none p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 px-8">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading || isUploading}
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        form="create-circle-form"
                        disabled={isLoading || isUploading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 h-12 px-10 rounded-full font-bold transition-all"
                    >
                        {isLoading || isUploading ? (
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                            <ArrowRight className="w-5 h-5 mr-3" />
                        )}
                        {isLoading || isUploading ? (isUploading ? "Upload image..." : "Création...") : "Lancer le cercle"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
