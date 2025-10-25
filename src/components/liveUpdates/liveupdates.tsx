'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LiveUpdateCard from "@/components/LiveUpdateCard";
import {
  RadioIcon,
  ClockIcon,
  MessageCircleIcon,
  HeartIcon,
  SendIcon,
  TrendingUpIcon,
  Share2Icon,
  CopyIcon,
  TwitterIcon,
  LinkedinIcon,
} from "lucide-react";
import {
  useGenericMutationMutation,
  useGetAllEventsQuery,
  useGetEventCommentsQuery,
  useGetEventUpdatesQuery,
  useGetRecentVideosQuery,
} from "@/slice/requestSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { timeSince } from "@/utils/formatDate";
import DOMPurify from "dompurify";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { generatePostShareData, copyToClipboard, openShareWindow } from "@/utils/sharing";
import { Input } from "@/components/ui/input";

// ✅ HTML Cleaning Component
export function CleanHTML({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    FORBID_ATTR: ["width", "height", "cellpadding", "cellspacing", "class"],
    FORBID_TAGS: ["colgroup", "col", "span", "paragraph"],
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "src", "title"],
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// ✅ Convert HTML to plain text
export function cleanHTMLToString(html: string): string {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
}

const LiveUpdates = () => {
  const { data: mockEvents, isLoading, isError: errorEvents } = useGetAllEventsQuery();
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [loadedUpdates, setLoadedUpdates] = useState<any[]>([]);
  const [likeUpdate] = useGenericMutationMutation();
  const [likeVideo] = useGenericMutationMutation();

  const [offset, setOffset] = useState(0);
  const limit = 2;
  const maxUpdates = 5;

  const [likeId, setLikeId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isVideoLiked, setIsVideoLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postComment] = useGenericMutationMutation();
  const [showComments, setShowComments] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);

  const router = useRouter();
  const { data: eventComments } = useGetEventCommentsQuery({ id: selectedEvent?.id });

  const {
    data: mockUpdates,
    isLoading: loading,
    isError: error,
  } = useGetEventUpdatesQuery(
    selectedEvent?.id ? { id: selectedEvent.id, limit, offset } : skipToken
  );

  useEffect(() => {
    if (mockEvents && mockEvents?.length > 0) {
      setSelectedEvent(mockEvents?.slice().reverse()[0]);
    }
  }, [mockEvents]);

  useEffect(() => {
    if (selectedEvent?.id) {
      setOffset(0);
      setLoadedUpdates([]);
    }
  }, [selectedEvent?.id]);

  useEffect(() => {
    if (mockUpdates?.length) {
      setLoadedUpdates((prev) => {
        const combined = [...prev, ...mockUpdates];
        const unique = Array.from(new Map(combined.map((u) => [u.id, u])).values());
        return unique.slice(0, maxUpdates);
      });
    }
  }, [mockUpdates]);

  const handleLike = () => {
    if (!selectedEvent?.id) return;

    const method = isLiked ? "DELETE" : "POST";
    const url = isLiked ? `/likes/${likeId}` : `/events/${selectedEvent?.id}/likes`;

    likeUpdate({
      url,
      method,
      invalidatesTags: [{ type: "singleEvent" }, { type: "event-updates" }],
    })
      .unwrap()
      .then((res) => {
        const updatedLikes = isLiked
          ? selectedEvent.likes.filter((like: any) => like.id !== likeId)
          : [...selectedEvent.likes, { id: res.id }];

        setSelectedEvent((prev: any) => ({
          ...prev,
          likes: updatedLikes,
        }));

        if (!isLiked && res?.id) {
          setLikeId(res.id);
        } else if (isLiked) {
          setLikeId(null);
        }

        setIsLiked(!isLiked);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error?.data?.message || "Failed to toggle like.",
          variant: "destructive",
        });
      });
  };


  const handleLoadMore = () => {
    if (loadedUpdates.length < maxUpdates) {
      setOffset((prev) => prev + limit);
    }
  };


  const handleComment = (updateId: string) => {
    setCommentingOn(updateId);
    setShowComments(!showComments);
  };

  const handleAddComment = () => {
    if (newComment.trim() && commentingOn) {
      const url = commentingOn === 'event' 
        ? `/events/${selectedEvent?.id}/comments`
        : `/updates/${commentingOn}/comments`;
      
      postComment({
        url,
        method: "POST",
        body: { content: newComment.trim() },
        invalidatesTags: [{ type: "singleEvent" }, { type: "event-updates" }],
      })
        .unwrap()
        .then((res) => {
          setNewComment("");
          // toast({
          //   title: "Success",
          //   description: "Comment added successfully!",
          // });
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error?.data?.message || "Failed to post comment.",
            variant: "destructive",
          });
        });
    }
  };

  const handleLikeUpdate = (updateId: string) => {
    likeUpdate({
      url: `/updates/${updateId}/likes`,
      method: "POST",
      invalidatesTags: [{ type: "event-updates" }],
    })
      .unwrap()
      .then((res) => {
        // toast({
        //   title: "Success",
        //   description: "Update liked!",
        // });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error?.data?.message || "Failed to like update.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-[1400px]">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-8 px-2 sm:px-0">Live Updates</h1>

        {isLoading && <p className="text-center text-gray-500">Loading Posts...</p>}
        
        {selectedEvent && (
          <div className="space-y-3 sm:space-y-5">
            {/* Main Thread (Event Post) */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6">
              {/* Thread Header */}
              <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <RadioIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                    <h2 className="font-bold text-gray-900 text-sm sm:text-base">BlaccTheddi</h2>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-gray-500 hidden sm:inline">·</span>
                      <span className="text-gray-500 text-xs sm:text-sm">{timeSince(selectedEvent.timestamp)}</span>
                      <Badge className="bg-accent text-white text-xs animate-pulse">LIVE</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm">@blacctheddi</p>
                </div>
              </div>

              {/* Thread Content */}
              <div className="ml-0 sm:ml-15">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 leading-tight">
                  {selectedEvent.title}
                </h3>

                {selectedEvent.image_url && (
                  <div className="mb-3 sm:mb-4 rounded-lg sm:rounded-xl overflow-hidden">
                    <img
                      src={selectedEvent.image_url}
                      alt={selectedEvent.title}
                      className="w-full h-48 sm:h-64 object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">
                  <CleanHTML html={selectedEvent.details} />
                </div>

                {/* Thread Stats */}
                <div className="flex items-center space-x-4 sm:space-x-6 text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">
                  <span className="flex items-center">
                    <MessageCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {selectedEvent?.updates.length ?? 0} updates
                  </span>
                  <span className="flex items-center">
                    <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {selectedEvent?.likes?.length || 0} likes
                  </span>
                </div>

                {/* Thread Actions */}
                <div className="flex items-center space-x-4 sm:space-x-8 text-gray-500">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${isLiked ? "text-red-600" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    <HeartIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`} />
                    <span className="hidden sm:inline">{selectedEvent?.likes?.length || 0}</span>
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center text-gray-500 hover:text-gray-800 text-xs sm:text-sm"
                    onClick={() => handleComment('event')}
                  >
                    <MessageCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">{selectedEvent?.comments?.length || 0}</span>
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center text-gray-500 hover:text-gray-800 text-xs sm:text-sm">
                        <Share2Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 flex flex-col space-y-2">
                      {(() => {
                        const shareData = generatePostShareData(
                          selectedEvent?.id || '',
                          selectedEvent?.title || 'Check out this event from BlaccTheddi',
                          selectedEvent?.details?.replace(/<[^>]*>/g, '').substring(0, 160),
                          selectedEvent?.image_url
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
              </div>

              {/* Comments Section for Main Thread */}
              {showComments && commentingOn === 'event' && (
                <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-4 sm:pt-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Comments</h4>
                  
                  {/* Add Comment Form */}
                  <div className="flex gap-2 items-center mb-3 sm:mb-4">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button 
                      size="sm" 
                      className="bg-accent hover:bg-red-700 text-xs" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      <SendIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                    {eventComments?.slice().reverse().map((comment: any) => (
                      <div key={comment.id} className="p-2 sm:p-3 rounded-lg bg-gray-50">
                        <p className="text-xs sm:text-sm text-gray-800">{comment.content}</p>
                        <span className="text-xs text-gray-500">{timeSince(comment.timestamp)}</span>
                      </div>
                    ))}
                    {(!eventComments || eventComments.length === 0) && (
                      <p className="text-xs sm:text-sm text-gray-500 text-center py-3 sm:py-4">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Thread Replies (Updates) */}
            {loadedUpdates?.length > 0 && (
              <div className="space-y-0">
                {loadedUpdates.map((update: any, index: number) => (
                  <div key={update.id} className="relative">
                    {/* Thread Line */}
                    <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {/* Reply Card */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 ml-6 sm:ml-12">
                      <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">BlaccTheddi</h4>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <span className="text-gray-500 hidden sm:inline">·</span>
                              <span className="text-gray-500 text-xs sm:text-sm">{timeSince(update.timestamp)}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs sm:text-sm">@blacctheddi</p>
                        </div>
                      </div>

                      <div className="ml-0 sm:ml-13">
                        <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{update.title}</h5>

                        {update.image_url && (
                          <div className="mb-3 rounded-lg sm:rounded-xl overflow-hidden">
                            <img
                              src={update.image_url}
                              alt={update.title}
                              className="w-full h-32 sm:h-48 object-cover"
                            />
                          </div>
                        )}

                        <div className="prose prose-sm max-w-none text-gray-800 mb-3 text-xs sm:text-sm">
                          <CleanHTML html={update.details} />
                        </div>

                        {/* Reply Actions */}
                        <div className="flex items-center space-x-4 sm:space-x-6 text-gray-500 text-xs sm:text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-gray-800"
                            onClick={() => handleLikeUpdate(update.id)}
                          >
                            <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{update.likes?.length || 0}</span>
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center text-gray-500 hover:text-gray-800"
                            onClick={() => handleComment(update.id)}
                          >
                            <MessageCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">{update.comments?.length || 0}</span>
                          </Button>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex items-center text-gray-500 hover:text-gray-800 text-xs sm:text-sm">
                                <Share2Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                <span className="hidden sm:inline">Share</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 flex flex-col space-y-2">
                              {(() => {
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
                      </div>

                      {/* Comments Section for Update */}
                      {showComments && commentingOn === update.id && (
                        <div className="mt-3 sm:mt-4 border-t border-gray-200 pt-3 sm:pt-4">
                          <h5 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Comments</h5>
                          
                          {/* Add Comment Form */}
                          <div className="flex gap-1 sm:gap-2 items-center mb-2 sm:mb-3">
                            <Input
                              placeholder="Write a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="flex-1 text-xs sm:text-sm"
                            />
                            <Button 
                              size="sm" 
                              className="bg-accent hover:bg-red-700 text-xs px-2 sm:px-3" 
                              onClick={handleAddComment}
                              disabled={!newComment.trim()}
                            >
                              <SendIcon className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Comments List */}
                          <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
                            {update.comments?.slice().reverse().map((comment: any) => (
                              <div key={comment.id} className="p-2 rounded bg-gray-50">
                                <p className="text-xs text-gray-800">{comment.content}</p>
                                <span className="text-xs text-gray-500">{timeSince(comment.timestamp)}</span>
                              </div>
                            ))}
                            {(!update.comments || update.comments.length === 0) && (
                              <p className="text-xs text-gray-500 text-center py-2">No comments yet.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {loadedUpdates.length < maxUpdates && (
                  <div className="text-center mt-4 sm:mt-6 cursor-pointer">
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      className="text-gray-600 cursor-pointer text-xs sm:text-sm px-4 sm:px-6"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Show more updates"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveUpdates;
