"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMessages, sendMessage } from "@/actions/community.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Send, Loader2, Paperclip, MessageCircle, Image as ImageIcon, FileText, Mic, Video, X } from "lucide-react"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/uploadthing"

interface CircleChatProps {
    circleId: string
}

export function CircleChat({ circleId }: CircleChatProps) {
    const { user } = useKindeBrowserClient()
    const queryClient = useQueryClient()
    const [inputValue, setInputValue] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Type of file being selected to adjust 'accept' attribute
    const [uploadType, setUploadType] = useState<"image" | "video" | "audio" | "file">("file")

    const { data: messages, isLoading } = useQuery({
        queryKey: ["circleMessages", circleId],
        queryFn: () => getMessages(circleId).then(res => res.success ? res.data : []),
        refetchInterval: 5000
    })

    const { mutate: sendMessageFn, isPending: isSending } = useMutation({
        mutationFn: (data: { content: string, attachmentUrl?: string, attachmentType?: string }) => sendMessage(circleId, data.content, data.attachmentUrl, data.attachmentType),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["circleMessages", circleId] })
                bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            } else {
                toast.error(res.error)
            }
        }
    })

    // UploadThing hook
    const { startUpload, isUploading } = useUploadThing("mediaUploader", {
        onClientUploadComplete: (res) => {
            if (res) {
                // Send messages for each uploaded file
                res.forEach((file, index) => {
                    const type = file.type.startsWith("image") ? "IMAGE" :
                        file.type.startsWith("video") ? "VIDEO" :
                            file.type.startsWith("audio") ? "AUDIO" : "FILE"

                    // Attach text only to the first message if multiple, or just independent
                    // Strategy: If text exists, send it with first attachment.
                    // But here we might have removed text from state already.
                    // Let's send text with the *last* attachment or as a separate message if preferred?
                    // Common pattern: First attachment gets the caption.

                    const content = (index === 0 && inputValue.trim()) ? inputValue : (inputValue.trim() && index === 0 ? inputValue : "")
                    // If content was sent with first, subsequent have empty content? Or "Partagé un fichier"

                    // Actually, let's keep it simple:
                    // If we have text AND files:
                    // Send text as standalone message OR attach to first file?
                    // Schema allows content + attachment. Use that.

                    const msgContent = (index === 0 && inputValue) ? inputValue : (file.name || "Fichier joint")

                    sendMessageFn({
                        content: msgContent,
                        attachmentUrl: file.url,
                        attachmentType: type
                    })
                })

                setInputValue("")
                setSelectedFiles([])
                toast.success(`${res.length} fichier(s) envoyé(s) !`)
            }
        },
        onUploadError: (error: Error) => {
            toast.error(`Erreur d'upload: ${error.message}`)
        },
    })

    // Auto scroll
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages?.length])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (isUploading || isSending) return

        if (selectedFiles.length > 0) {
            await startUpload(selectedFiles)
        } else if (inputValue.trim()) {
            sendMessageFn({ content: inputValue })
            setInputValue("")
        }
    }

    const triggerFileUpload = (type: "image" | "video" | "audio" | "file") => {
        setUploadType(type)
        setIsMenuOpen(false)
        setTimeout(() => fileInputRef.current?.click(), 100)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])])
        }
        // Reset input so same file can be selected again if needed
        e.target.value = ""
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const getAcceptType = () => {
        switch (uploadType) {
            case "image": return "image/*"
            case "video": return "video/*"
            case "audio": return "audio/*"
            default: return "*"
        }
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-600" /></div>

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 h-0" ref={scrollRef}>
                <div className="flex flex-col gap-4 min-h-full justify-end">
                    <div className="flex-1" />

                    {messages && messages.length > 0 ? (
                        messages.map((msg: any) => {
                            const isMe = user?.id === msg.userId
                            return (
                                <div key={msg.id} className={cn("flex gap-3 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                    <Avatar className="w-8 h-8 mt-1 border border-white dark:border-slate-800 shadow-sm">
                                        <AvatarImage src={msg.user?.imageUrl} />
                                        <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700">
                                            {msg.user?.firstName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm shadow-sm relative group",
                                        isMe
                                            ? "bg-emerald-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none"
                                    )}>
                                        <div className={cn("text-[10px] mb-1 font-bold opacity-70 flex justify-between gap-4", isMe ? "text-emerald-100" : "text-slate-400")}>
                                            <span>{msg.user?.firstName}</span>
                                            <span className="font-normal opacity-50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        {/* Attachment Display */}
                                        {msg.attachmentUrl && (
                                            <div className="mb-2 mt-1">
                                                {msg.attachmentType === "IMAGE" ? (
                                                    <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-white/20">
                                                        <img src={msg.attachmentUrl} alt="attachment" className="max-w-[200px] max-h-[200px] object-cover" />
                                                    </a>
                                                ) : msg.attachmentType === "VIDEO" ? (
                                                    <video controls className="max-w-[200px] rounded-lg border border-white/20">
                                                        <source src={msg.attachmentUrl} />
                                                    </video>
                                                ) : msg.attachmentType === "AUDIO" ? (
                                                    <audio controls className="w-[200px]">
                                                        <source src={msg.attachmentUrl} />
                                                    </audio>
                                                ) : (
                                                    <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/10 p-2 rounded-lg hover:bg-black/20 transition-colors">
                                                        <Paperclip className="w-4 h-4" />
                                                        <span className="underline truncate max-w-[150px]">{msg.content === "Fichier joint" ? "Télécharger" : "Fichier"}</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-sm text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-slate-300" />
                            </div>
                            <p>Aucun message pour le moment.</p>
                            <p>Lancez la conversation ! 👋</p>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 z-10 flex flex-col">

                {/* File Preview */}
                {selectedFiles.length > 0 && (
                    <div className="flex gap-2 p-3 overflow-x-auto border-b border-slate-100 dark:border-slate-800 custom-scrollbar">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                {file.type.startsWith("image") ? (
                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-xs text-center p-1 break-all text-slate-500">
                                        {file.type.startsWith("video") ? <Video className="w-6 h-6 mx-auto mb-1" /> :
                                            file.type.startsWith("audio") ? <Mic className="w-6 h-6 mx-auto mb-1" /> :
                                                <FileText className="w-6 h-6 mx-auto mb-1" />}
                                        {file.name.slice(0, 8)}...
                                    </div>
                                )}
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="p-3 md:p-4 flex items-end gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept={getAcceptType()}
                        onChange={handleFileSelect}
                        disabled={isUploading || isSending}
                    />

                    <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                                <Paperclip className="w-5 h-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" align="start" className="w-48 p-2">
                            <div className="flex flex-col gap-1">
                                <Button variant="ghost" className="justify-start gap-3" onClick={() => triggerFileUpload("image")}>
                                    <ImageIcon className="w-4 h-4 text-purple-500" /> Image
                                </Button>
                                <Button variant="ghost" className="justify-start gap-3" onClick={() => triggerFileUpload("video")}>
                                    <Video className="w-4 h-4 text-blue-500" /> Vidéo
                                </Button>
                                <Button variant="ghost" className="justify-start gap-3" onClick={() => triggerFileUpload("audio")}>
                                    <Mic className="w-4 h-4 text-red-500" /> Audio
                                </Button>
                                <Button variant="ghost" className="justify-start gap-3" onClick={() => triggerFileUpload("file")}>
                                    <FileText className="w-4 h-4 text-amber-500" /> Fichier
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="flex-1 relative">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            placeholder="Écrivez votre message..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 rounded-xl py-6 pr-10"
                        />
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={isSending || isUploading || (!inputValue.trim() && selectedFiles.length === 0)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl w-12 h-12 p-0 flex items-center justify-center transition-all shadow-md shadow-emerald-900/20"
                    >
                        {isSending || isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
