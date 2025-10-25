'use client'
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import VideoCard from "@/components/VideoCard";
import { useGenericMutationMutation, useGetSingleVideoQuery, useGetVideoCommentsQuery } from "@/slice/requestSlice";
import { timeSince } from "@/utils/formatDate";
import { SendIcon, TrendingUpIcon, TvIcon, XIcon, HeartIcon, Share2Icon, MessageCircleIcon, TwitterIcon, LinkedinIcon, CopyIcon } from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { generateVideoShareData, copyToClipboard, openShareWindow } from "@/utils/sharing";
import { updateVideoMetadata } from "@/utils/metadata-updater";


export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data } = useGetSingleVideoQuery({ id })
    const router = useRouter();
    
    // Generate sharing data for this video
    const shareData = generateVideoShareData(
        id,
        data?.video?.title || 'Check out this video from BlaccTheddi',
        data?.video?.description?.substring(0, 160),
        data?.video?.thumbnail_url
    );

    // Update page metadata dynamically
    useEffect(() => {
        if (data?.video) {
            updateVideoMetadata({
                id: data.video.id,
                title: data.video.title,
                description: data.video.description,
                thumbnail_url: data.video.thumbnail_url,
            });
        }
    }, [data?.video]);
    const [newComment, setNewComment] = useState("");
    const [postComment, { isLoading: loadC, isError: err }] = useGenericMutationMutation();
    const { data: updateComments } = useGetVideoCommentsQuery({ id })
    const [likeId, setLikeId] = useState<number | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeVideo] = useGenericMutationMutation();
    const [expanded, setExpanded] = useState(false);
    const maxLength = 100; // Number of characters to show when collapsed
    const toggleExpanded = () => setExpanded((prev) => !prev);
    const description = data?.video?.description
    const isTruncated = description?.length > maxLength;
    const displayedText = expanded ? description : description?.slice(0, maxLength);
    
    
    const handlePlay = (videoId: string | number) => {
        router.push(`/tv/${videoId}`)
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            postComment({
                url: `/tvs/${id}/comments`,
                method: "POST",
                body: {
                    content: newComment.trim()
                },
                invalidatesTags: [{ type: "update-comments" }]
            })
                .unwrap()
                .then(() => {
                    // toast({
                    //     title: "Success",
                    //     description: "You posted a comment!",
                    // });
                })
                .catch((error) => {
                    toast({
                        title: "Error",
                        description: error?.data?.message || "Failed to post comment.",
                        variant: "destructive",
                    });
                });

            setNewComment("");
        }
    };

    const handleComment = (videoId: string | number) => {
        console.log("Open comments for video:", videoId);
    };

    const handleLike = (id: number) => {
        if (!id) return;
        const method = isLiked ? "DELETE" : "POST";
        const url = isLiked ? `/likes/${likeId}` : `/tvs/${id}/likes`;

        likeVideo({
            url,
            method,
            invalidatesTags: [{ type: "all-videos" }],
        }).unwrap()
            .then((res) => {
                if (!isLiked && res?.id) {
                    setLikeId(res.id); // Store like_id for potential unlike
                } else if (isLiked) {
                    setLikeId(null); // Reset like_id after deletion
                }
                setIsLiked(!isLiked);
                // onLike(update.id); // Notify parent or analytics
            })
            .catch((error) => {
                toast({
                    title: "Error",
                    description: error?.data?.message || "Failed to toggle like.",
                    variant: "destructive",
                });
            });
    };

    return (
        <>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
                            <TvIcon className="w-8 h-8 mr-3 text-accent" />
                            Blacctheddi TV
                        </h1>
                        <p className="text-muted-foreground">Watch the latest videos and broadcasts</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {/* Video Player */}
                            <Card className="mb-6">
                                <CardContent className="p-0">
                                    <div className="relative">
                                        <CustomVideoPlayer
                                            src={data?.video.url}
                                            poster={data?.video.thumbnail_url}
                                            className="w-full aspect-video"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.back()}
                                            className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Video Info */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">
                                        {data?.video?.title}
                                    </h2>
                                    <div className="flex gap-5 flex-col justify-between">
                                        <div className="flex items-center space-x-4 text-muted-foreground">
                                            <span>{data?.video.views} views</span>
                                            <span>•</span>
                                            <span>{data?.video.likes.length} likes</span>
                                            <span>•</span>
                                            <span>{data?.video.comments.length} comments</span>
                                        </div>
                                        
                                        {/* Like and Share Buttons */}
                                        <div className="flex items-center space-x-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleLike(Number(id))}
                                                className={`flex items-center space-x-2 ${isLiked ? "text-red-600" : "text-gray-500 hover:text-gray-800"
                                                    }`}
                                            >
                                                <HeartIcon className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                                                <span>{data?.video.likes.length || 0}</span>
                                            </Button>

                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="flex items-center text-gray-500 hover:text-gray-800"
                                            >
                                                <MessageCircleIcon className="w-4 h-4 mr-1" /> 
                                                {updateComments?.length || 0}
                                            </Button>

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="flex items-center text-gray-500 hover:text-gray-800">
                                                        <Share2Icon className="w-4 h-4 mr-1" /> Share
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-48 flex flex-col space-y-2">
                                                    <Button
                                                        variant="ghost"
                                                        className="justify-start text-sm"
                                                        onClick={() => openShareWindow('twitter', shareData.url, shareData.title)}
                                                    >
                                                        <TwitterIcon className="w-4 h-4 mr-2" /> Twitter
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        className="justify-start text-sm"
                                                        onClick={() => openShareWindow('linkedin', shareData.url)}
                                                    >
                                                        <LinkedinIcon className="w-4 h-4 mr-2" /> LinkedIn
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        className="justify-start text-sm"
                                                        onClick={async () => {
                                                            const success = await copyToClipboard(shareData.url);
                                                            if (success) {
                                                                toast({ description: "Link copied to clipboard!" });
                                                            } else {
                                                                toast({ description: "Failed to copy link", variant: "destructive" });
                                                            }
                                                        }}
                                                    >
                                                        <CopyIcon className="w-4 h-4 mr-2" /> Copy Link
                                                    </Button>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            <Input
                                                placeholder="Write a comment..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                            />
                                            <Button size="sm" className="cursor-pointer bg-accent" onClick={handleAddComment}>
                                                <SendIcon />
                                            </Button>
                                        </div>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                            {updateComments?.map((comment: any) => (
                                                <div
                                                    key={comment.id}
                                                    className="border border-border p-2 rounded-md text-sm bg-muted flex flex-col gap-2 overflow-auto max-h-[100px]"
                                                >
                                                    <span className="font-medium text-foreground">{comment.content}</span>{" "}
                                                    <span className="text-muted-foreground">{timeSince(comment.timestamp)}</span>
                                                </div>
                                            ))}
                                        </div>
                                         <div className="flex flex-col gap-2">
                                            <p className="text-lg font-medium">Description</p>
                                            <p>
                                                {displayedText}
                                                {isTruncated && !expanded && "..."}
                                                {isTruncated && (
                                                    <button
                                                        onClick={toggleExpanded}
                                                        className="text-accent cursor-pointer  ml-1 hover:underline text-sm"
                                                    >
                                                        {expanded ? "View less" : "View more"}
                                                    </button>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-1">
                            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                                <TrendingUpIcon className="w-5 h-5 mr-2 text-accent" />
                                Related Videos
                            </h3>
                            <div className="space-y-4">
                                {data?.related_videos?.map((video: any) => (
                                    <VideoCard
                                        key={video.id}
                                        video={video}
                                        onPlay={handlePlay}
                                        onLike={handleLike}
                                        onComment={handleComment}
                                        size="large"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}