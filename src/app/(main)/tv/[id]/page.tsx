'use client'
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import VideoCard from "@/components/VideoCard";
import { useGenericMutationMutation, useGetSingleVideoQuery, useGetVideoCommentsQuery } from "@/slice/requestSlice";
import { timeSince } from "@/utils/formatDate";
import { SendIcon, TrendingUpIcon, TvIcon, XIcon } from "lucide-react";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";


export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data } = useGetSingleVideoQuery({ id })
    const router = useRouter();
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

    console.log(description);
    

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
                    toast({
                        title: "Success",
                        description: "You posted a comment!",
                    });
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
                toast({
                    title: "Success",
                    description: isLiked ? "Like removed!" : "Update liked!",
                });

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