'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, ClockIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { timeSince } from "@/utils/formatDate";
import { SendIcon } from "lucide-react";


interface LiveUpdate {
  id: string;
  eventId: string;
  title: string;
  details: string;
  timestamp: string;
  likes: string | [];
  comments:  string | [];
  isLiked?: boolean;
  image?: string;
  commentList?: { id: string; text: string; user: string }[]; // Optional
}

interface LiveUpdateCardProps {
  update: LiveUpdate;
  onLike: (id: string) => void;
  onComment: (id: string, commentText: string) => void;
}

const LiveUpdateCard = ({ update, onLike, onComment }: LiveUpdateCardProps) => {
  const [isLiked, setIsLiked] = useState(update.isLiked || false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(update.id);
  };

  const handleCommentToggle = () => {
    setIsCommenting(!isCommenting);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onComment(update.id, newComment.trim());
      setNewComment("");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="mb-4 hover:bg-muted/50 transition-colors duration-200 border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">{update.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <ClockIcon className="w-4 h-4 mr-1" />
            {timeSince(update.timestamp)}
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
              isLiked ? "text-accent" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HeartIcon className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="hover:text-foreground">{update.likes.length + (isLiked && !update.isLiked ? 1 : 0)}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCommentToggle}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <MessageCircleIcon className="w-4 h-4" />
            <span>{update.comments.length}</span>
          </Button>
        </div>

        {/* Expandable comment section */}
        {isCommenting && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            {/* Comment input */}
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

            {/* Display past comments */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {(update.commentList || []).map((comment) => (
                <div
                  key={comment.id}
                  className="border border-border p-2 rounded-md text-sm bg-muted"
                >
                  <span className="font-medium text-foreground">{comment.user}:</span>{" "}
                  <span className="text-muted-foreground">{comment.text}</span>
                </div>
              ))}
              {(!update.commentList || update.commentList.length === 0) && (
                <p className="text-xs text-muted-foreground">No comments yet.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveUpdateCard;