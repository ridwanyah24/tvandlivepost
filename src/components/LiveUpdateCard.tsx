'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, ClockIcon } from "lucide-react";
import { useState } from "react";

interface LiveUpdate {
  id: string;
  eventId: string;
  title: string;
  details: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  image?: string;
}

interface LiveUpdateCardProps {
  update: LiveUpdate;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
}

const LiveUpdateCard = ({ update, onLike, onComment }: LiveUpdateCardProps) => {
  const [isLiked, setIsLiked] = useState(update.isLiked || false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(update.id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="mb-4 hover:bg-muted/50 transition-colors duration-200 border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">{update.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <ClockIcon className="w-4 h-4 mr-1" />
            {formatTime(update.timestamp)}
          </div>
        </div>
        
        <p className="text-muted-foreground mb-4 leading-relaxed">{update.details}</p>
        
        {update.image && (
          <div className="mb-4">
            <img 
              src={update.image} 
              alt={update.title}
              className="w-full h-64 object-cover rounded-lg border border-border"
            />
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"
            }`}
          >
            <HeartIcon
              className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
            />
            <span>{update.likes + (isLiked && !update.isLiked ? 1 : 0)}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment(update.id)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <MessageCircleIcon className="w-4 h-4" />
            <span>{update.comments}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveUpdateCard;