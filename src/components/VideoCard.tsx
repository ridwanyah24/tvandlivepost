import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, EyeIcon, PlayIcon } from "lucide-react";
import { useState } from "react";

interface Video {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  thumbnail: string;
  duration: string;
  isLiked?: boolean;
}

interface VideoCardProps {
  video: Video;
  onPlay: (id: string) => void;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  size?: "small" | "large";
}

const VideoCard = ({ video, onPlay, onLike, onComment, size = "large" }: VideoCardProps) => {
  const [isLiked, setIsLiked] = useState(video.isLiked || false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(video.id);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const cardClassName = size === "small" 
    ? "mb-3 hover:bg-muted/50 transition-colors duration-200" 
    : "mb-6 hover:bg-muted/50 transition-colors duration-200";

  const thumbnailClassName = size === "small" 
    ? "h-24" 
    : "h-48 md:h-56";

  return (
    <Card className={cardClassName}>
      <div 
        className={`relative ${thumbnailClassName} bg-muted rounded-t-lg overflow-hidden cursor-pointer group`}
        onClick={() => onPlay(video.id)}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
            <PlayIcon className="w-8 h-8 text-accent-foreground ml-1" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className={`font-semibold text-foreground mb-2 line-clamp-2 ${size === "small" ? "text-sm" : "text-lg"}`}>
          {video.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-4 h-4" />
              <span>{formatNumber(video.views)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"
              }`}
            >
              <HeartIcon className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs">{formatNumber(video.likes + (isLiked && !video.isLiked ? 1 : 0))}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(video.id)}
              className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
            >
              <MessageCircleIcon className="w-4 h-4" />
              <span className="text-xs">{formatNumber(video.comments)}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;