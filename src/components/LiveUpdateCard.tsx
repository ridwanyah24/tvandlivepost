'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, ClockIcon, Share2Icon, LinkedinIcon, TwitterIcon, CopyIcon } from "lucide-react";
import { generatePostShareData, copyToClipboard, openShareWindow } from "@/utils/sharing";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { timeSince } from "@/utils/formatDate";
import { SendIcon } from "lucide-react";
import { useGenericMutationMutation, useGetUpdateCommentsQuery, ValidTags } from "@/slice/requestSlice";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CleanHTML, cleanHTMLToString } from "./liveUpdates/liveupdates";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";



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
  const [postComment] = useGenericMutationMutation();
  const [likeUpdate] = useGenericMutationMutation();
  const { data: updateComments } = useGetUpdateCommentsQuery({ id: update.id });
  const [expanded, setExpanded] = useState(false);
  const maxLength = 20; // Number of characters to show when collapsed
  const toggleExpanded = () => {
    // setExpanded((prev) => !prev)
    router.push(`/${update.id}`)
  }

  const description = cleanHTMLToString(update?.details)
  const isTruncated = description?.length > maxLength;
  const displayedText = expanded ? <CleanHTML html={update?.details} /> : description?.slice(0, maxLength);

  const [isLiked, setIsLiked] = useState(update.isLiked || false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [likeId, setLikeId] = useState<number | null>(null);
  const router = useRouter();


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
    <Card className="mb-4 hover:bg-muted/50 transition-colors duration-200 border-border" >
      <CardContent className="lg:p-6 p-2">

        {update.image_url && (
          <div className="mb-4 cursor-pointer" onClick={() => { router.push(`/${update.id}`) }}>
            <img
              src={update?.image_url}
              alt={update.title}
              className="w-full lg:h-[400px] h-[200px] object-cover object-center rounded-lg border border-border"
            />
          </div>
        )}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">{update.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <ClockIcon className="w-4 h-4 mr-1" />
            {timeSince(update.timestamp)}
          </div>
        </div>

        <p className="text-muted-foreground mb-4 leading-relaxed">
          {/* <CleanHTML html={displayedText} /> */}
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
          {/* Share Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center cursor-pointer space-x-2 text-muted-foreground hover:text-foreground"
              >
                <Share2Icon className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 flex flex-col space-y-2">
              {(() => {
                // Generate sharing data for this specific update
                const shareData = generatePostShareData(
                  update.id,
                  update.title,
                  update.details?.replace(/<[^>]*>/g, '').substring(0, 160),
                  update.image_url
                );
                
                return (
                  <>
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
                      onClick={() => {
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(shareData.title + " " + shareData.url)}`,
                          "_blank"
                        )
                      }}
                    >
                      <MessageCircleIcon className="w-4 h-4 mr-2" /> WhatsApp
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
                  </>
                );
              })()}
            </PopoverContent>
          </Popover>
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
              <div
                key={updateComments?.slice().reverse()[0]?.id}
                className="border border-border p-2 rounded-md text-sm bg-muted flex flex-col gap-2 overflow-auto max-h-[100px]"
              >
                <span className="font-medium text-foreground">{updateComments?.slice().reverse()[0]?.content}</span>{" "}
                <span className="text-muted-foreground">{updateComments[0] ? timeSince(updateComments?.slice().reverse()[0]?.timestamp) : "no comments"}</span>
              </div>

            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveUpdateCard;