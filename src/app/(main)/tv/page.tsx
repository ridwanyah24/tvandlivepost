'use client'
import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import { TvIcon, TrendingUpIcon, XIcon, SendIcon } from "lucide-react";
import { useGenericMutationMutation, useGetAllCategoriesQuery, useGetAllVideosQuery, useGetUpdateCommentsQuery, useGetVideoCommentsQuery } from "@/slice/requestSlice";

import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TV = () => {

  const [selectedCategory, setSelectedCategory] = useState<string >("all");
  const { data: mockVideos, isLoading } = useGetAllVideosQuery(selectedCategory === "all" ? {}: { category_ids: [parseInt(selectedCategory)] });
  const { data: category_ids, isLoading: loadingCat } = useGetAllCategoriesQuery();
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
      .then((res: any) => {
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
          Tv Post
          </h1>
          <p className="text-muted-foreground">Watch the latest videos and broadcasts</p>
        </div>
        {/* <p>something should be heres</p> */}
        <div className="mb-10">
          {!loadingCat ? (
            <Select onValueChange={(value) => setSelectedCategory(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"all"}>All</SelectItem>
                {category_ids?.map((category_id: any) => (
                  <SelectItem key={category_id.id} value={category_id.id.toString()}>
                    {category_id.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            "Loading Categories..."
          )}
        </div>
        <div className="">
          {isLoading ? (
            <p className="text-muted-foreground">Loading videos...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockVideos?.map((video: any) => (
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

