import { useState } from "react";
import VideoCard from "@/components/VideoCard";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TvIcon, TrendingUpIcon, XIcon } from "lucide-react";

// Mock data - replace with API calls
const mockVideos = [
  {
    id: "1",
    title: "Tech Innovation Summit 2024 - Complete Keynote",
    views: 15400,
    likes: 892,
    comments: 156,
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=225&fit=crop",
    duration: "45:32",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: "2",
    title: "Product Launch: Revolutionary AI Platform",
    views: 8900,
    likes: 654,
    comments: 89,
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=225&fit=crop",
    duration: "28:15",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: "3",
    title: "Behind the Scenes: Development Process",
    views: 5600,
    likes: 321,
    comments: 45,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    duration: "15:48",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    id: "4",
    title: "Expert Panel Discussion on Future Tech",
    views: 12300,
    likes: 567,
    comments: 78,
    thumbnail: "https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=400&h=225&fit=crop",
    duration: "52:10",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  },
  {
    id: "5",
    title: "Live Q&A Session with CEO",
    views: 7800,
    likes: 445,
    comments: 92,
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=225&fit=crop",
    duration: "33:27",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  },
];

const TV = () => {
  const [selectedVideo, setSelectedVideo] = useState<typeof mockVideos[0] | null>(null);
  const [videos, setVideos] = useState(mockVideos);

  const handlePlay = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
      // Increment view count
      setVideos(prev => 
        prev.map(v => 
          v.id === videoId 
            ? { ...v, views: v.views + 1 }
            : v
        )
      );
    }
  };

  const handleLike = (videoId: string) => {
    setVideos(prev => 
      prev.map(video => 
        video.id === videoId 
          ? { ...video, likes: video.likes + 1 }
          : video
      )
    );
  };

  const handleComment = (videoId: string) => {
    console.log("Open comments for video:", videoId);
  };

  const closePlayer = () => {
    setSelectedVideo(null);
  };

  const getRelatedVideos = () => {
    if (!selectedVideo) return [];
    
    return videos
      .filter(v => v.id !== selectedVideo.id)
      .sort((a, b) => b.views - a.views)
      .slice(0, 4);
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

        {selectedVideo ? (
          /* Video Player View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Video Player */}
              <Card className="mb-6">
                <CardContent className="p-0">
                  <div className="relative">
                    <CustomVideoPlayer 
                      src={selectedVideo.videoUrl}
                      poster={selectedVideo.thumbnail}
                      className="w-full aspect-video"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closePlayer}
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
                    {selectedVideo.title}
                  </h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <span>{selectedVideo.views.toLocaleString()} views</span>
                      <span>•</span>
                      <span>{selectedVideo.likes.toLocaleString()} likes</span>
                      <span>•</span>
                      <span>{selectedVideo.comments} comments</span>
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
                {getRelatedVideos().map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={handlePlay}
                    onLike={handleLike}
                    onComment={handleComment}
                    size="small"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Video Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
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
  );
};

export default TV;