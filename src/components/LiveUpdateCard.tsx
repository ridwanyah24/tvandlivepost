'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, ClockIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { timeSince } from "@/utils/formatDate";
import { SendIcon } from "lucide-react";
import { useGenericMutationMutation, useGetUpdateCommentsQuery, ValidTags } from "@/slice/requestSlice";
import { toast } from "@/hooks/use-toast";



interface LiveUpdate {
  id: string;
  eventId: string;
  title: string;
  details: string;
  timestamp: string;
  likes: string | [];
  comments: string | [];
  isLiked?: boolean;
  image_url?: string;
  commentList?: { id: string; text: string; user: string }[]; // Optional
}

interface LiveUpdateCardProps {
  update: LiveUpdate;
  onLike: (id: string) => void;
  onComment: (id: string, commentText: string) => void;
}



const LiveUpdateCard = ({ update, onLike, onComment }: LiveUpdateCardProps) => {
  const [postComment, { isLoading, isError }] = useGenericMutationMutation();
  const [likeUpdate, { isLoading: loadingLike, isError: errorLike }] = useGenericMutationMutation();
  const { data: updateComments } = useGetUpdateCommentsQuery({ id: update.id });

  const [isLiked, setIsLiked] = useState(update.isLiked || false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [likeId, setLikeId] = useState<number | null>(null);



  const handleLike = () => {
    if (!update?.id) return;

    const method = isLiked ? "DELETE" : "POST";
    const url = isLiked ? `/likes/${likeId}` : `/updates/${update.id}/likes`;

    likeUpdate({
      url,
      method,
      invalidatesTags: [{ type: "event-updates" }],
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

  const handleCommentToggle = () => {
    setIsCommenting(!isCommenting);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      postComment({
        url: `/updates/${update.id}/comments`,
        method: "POST",
        body: {
          content: newComment.trim()
        },
        invalidatesTags: [{ type: "update-comments" }]
      }).unwrap().then(() => {
        toast({
          title: "Success",
          description: "You posted a comment!",
        });
      }).catch((error) => {
        toast({
          title: "Error",
          description: error?.data?.message || "Failed to post comment.",
          variant: "destructive",
        });
      });
      setNewComment("");
    }
  };

  return (
    <Card className="mb-4 hover:bg-muted/50 transition-colors duration-200 border-border">
      <CardContent className="lg:p-6 p-2">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">{update.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <ClockIcon className="w-4 h-4 mr-1" />
            {timeSince(update.timestamp)}
          </div>
        </div>

        {update.image_url && (
          <div className="mb-4">
            <img
              src={update?.image_url}
              alt={update.title}
              className="w-full lg:h-[400px] h-[200px] object-cover object-center rounded-lg border border-border"
            />
          </div>
        )}
        <p className="text-muted-foreground mb-4 leading-relaxed">{update.details}</p>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors cursor-pointer ${isLiked ? "text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <HeartIcon className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="hover:text-foreground">{update.likes.length}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCommentToggle}
            className="flex items-center cursor-pointer space-x-2 text-muted-foreground hover:text-foreground"
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
        )}
      </CardContent>
    </Card>
  );
};

export default LiveUpdateCard;