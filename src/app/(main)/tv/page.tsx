'use client'
import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TvIcon, TrendingUpIcon, XIcon, SendIcon } from "lucide-react";
import { useGenericMutationMutation, useGetAllVideosQuery, useGetUpdateCommentsQuery, useGetVideoCommentsQuery } from "@/slice/requestSlice";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { timeSince } from "@/utils/formatDate";
import { useRouter } from "next/navigation";


const TV = () => {
  const { data: mockVideos, isLoading } = useGetAllVideosQuery();
  const [likeId, setLikeId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeVideo] = useGenericMutationMutation();
  const router = useRouter();

  const [videos, setVideos] = useState<any[]>([]);


  // Sync fetched videos into local state
  useEffect(() => {
    if (mockVideos?.length) {
      setVideos(mockVideos);
    }
  }, [mockVideos]);


  const handlePlay = (videoId: string | number) => {
    router.push(`/tv/${videoId}`)

  };

  const handleLike = (id: number) => {
    if (!id) return;

    const method = isLiked ? "DELETE" : "POST";
    const url = isLiked ? `/likes/${likeId}` : `/tvs/${id}/likes`;

    likeVideo({
      url,
      method,
      invalidatesTags: [{ type: "all-videos" }],
    })
      .unwrap()
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

  const handleComment = (videoId: string | number) => {
    console.log("Open comments for video:", videoId);
  };


  return (
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
        <div className="">
          {isLoading ? (
            <p className="text-muted-foreground">Loading videos...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos?.map((video: any) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={handlePlay}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TV;

