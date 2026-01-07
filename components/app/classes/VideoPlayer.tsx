"use client";

import { Sparkles, Play, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
    videoUrl: string;
    className?: string;
}

export function VideoPlayer({ videoUrl, className = "" }: VideoPlayerProps) {
    if (!videoUrl) return null;

    // Handle YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = videoUrl.match(youtubeRegex);
    const videoId = match ? match[1] : null;

    if (videoId) {
        return (
            <div className={`relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group ${className}`}>
                <iframe
                    title="Class Video Player"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1&mute=1&playsinline=1`}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                />

                {/* Fallback Link for Mobile/Embed Blocks */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <a
                        href={`https://www.youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-black/80 hover:bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-white/10 backdrop-blur-xl"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Watch on YouTube
                    </a>
                </div>
            </div>
        );
    }

    // Handle Direct Video Files (.mp4, .mov, etc.)
    const isDirectFile = videoUrl.match(/\.(mp4|mov|webm|ogg)$|^[^?#]+\.(mp4|mov|webm|ogg)(?=[?#]|$)/i);

    if (isDirectFile) {
        return (
            <div className={`relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-primary/20 shadow-2xl ${className}`}>
                <video
                    controls
                    className="absolute inset-0 w-full h-full"
                    src={videoUrl}
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    // Fallback for other external links
    return (
        <div className={`aspect-video rounded-2xl overflow-hidden bg-muted/30 border border-primary/10 shadow-xl ${className}`}>
            <div className="flex h-full flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <ExternalLink className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">External Content Available</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        This class recording is hosted on an external platform. Click below to watch the full session.
                    </p>
                </div>
                <Button
                    asChild
                    className="rounded-full px-10 h-11 font-bold shadow-lg transition-all hover:scale-105"
                >
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                        Watch Full Session
                    </a>
                </Button>
            </div>
        </div>
    );
}
