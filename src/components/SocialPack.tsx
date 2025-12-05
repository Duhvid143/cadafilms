"use client";
import { useState } from "react";
import { Copy, Check, Youtube, Twitter } from "lucide-react";
import { toast } from "sonner";

interface SocialPackProps {
    episodeId: string;
    title: string;
    hashtags?: string[];
    summary?: string;
    videoUrl: string;
}

export default function SocialPack({ episodeId, title, hashtags, summary, videoUrl }: SocialPackProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        toast.success(`Copied ${type} to clipboard!`);
        setTimeout(() => setCopied(null), 2000);
    };

    const youtubeTitle = `${title} | MUIT #${episodeId}`;
    const youtubeDesc = `${summary}\n\n#${hashtags?.join(" #") || "MUIT"}\n\nWatch more at cadafilms.com`;

    const tweetText = `New Episode: ${title}\n\n${summary}\n\nWatch now: https://cadafilms.com/muit/${episodeId}\n\n#${hashtags?.join(" #") || "MUIT"}`;

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Social Pack</h3>

            <div className="space-y-4">
                {/* YouTube Section */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-2 mb-3 text-red-700 font-medium">
                        <Youtube className="w-5 h-5" />
                        <span>YouTube Metadata</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => copyToClipboard(youtubeTitle, "Title")}
                                className="flex-1 text-left text-sm bg-white p-2 rounded border border-red-200 hover:border-red-300 transition-colors flex justify-between items-center group"
                            >
                                <span className="truncate mr-2">{youtubeTitle}</span>
                                {copied === "Title" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400 group-hover:text-red-500" />}
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => copyToClipboard(youtubeDesc, "Description")}
                                className="flex-1 text-left text-sm bg-white p-2 rounded border border-red-200 hover:border-red-300 transition-colors flex justify-between items-center group"
                            >
                                <span className="truncate mr-2">Copy Description & Tags</span>
                                {copied === "Description" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400 group-hover:text-red-500" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Twitter/X Section */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3 text-slate-700 font-medium">
                        <Twitter className="w-5 h-5" />
                        <span>X / Twitter Post</span>
                    </div>

                    <button
                        onClick={() => copyToClipboard(tweetText, "Tweet")}
                        className="w-full text-left text-sm bg-white p-3 rounded border border-slate-200 hover:border-slate-300 transition-colors flex justify-between items-start group"
                    >
                        <p className="whitespace-pre-wrap text-gray-600 line-clamp-3">{tweetText}</p>
                        {copied === "Tweet" ? <Check className="w-4 h-4 text-green-500 mt-1" /> : <Copy className="w-4 h-4 text-gray-400 group-hover:text-slate-500 mt-1" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
