'use client'
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LiveUpdateCard from "@/components/LiveUpdateCard";
import { RadioIcon, ClockIcon, UsersIcon, MessageCircleIcon, HeartIcon, SendIcon } from "lucide-react";
import { useGenericMutationMutation, useGetAllEventsQuery, useGetEventCommentsQuery, useGetEventUpdatesQuery, useGetSingleEventQuery } from "@/slice/requestSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { timeSince } from "@/utils/formatDate";
import { Input } from "../ui/input";


const LiveUpdates = () => {
  const { data: mockEvents, isLoading, isError: errorEvents } = useGetAllEventsQuery();
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [loadedUpdates, setLoadedUpdates] = useState<any[]>([]);
  const [likeUpdate] = useGenericMutationMutation();
  const [newComment, setNewComment] = useState("");
  const [postComment] = useGenericMutationMutation();
  const { data: eventComments } = useGetEventCommentsQuery({ id: selectedEvent?.id })
  const [offset, setOffset] = useState(0);
  const limit = 2; // how many per page
  const maxUpdates = 5;
  const [likeId, setLikeId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const { data: getSingleEvent } = useGetSingleEventQuery({ id: selectedEvent?.id })
  const {
    data: mockUpdates,
    isLoading: loading,
    isError: error,
  } = useGetEventUpdatesQuery(
    selectedEvent?.id
      ? { id: selectedEvent.id, limit, offset }
      : skipToken
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
        const unique = Array.from(new Map(combined.map(u => [u.id, u])).values()); // avoid duplicates
        return unique.slice(0, maxUpdates); // cap at 5
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
        // Update local like count
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


  const handleAddComment = () => {
    if (newComment.trim()) {
      postComment({
        url: `/events/${selectedEvent?.id}/comments`,
        method: "POST",
        body: {
          content: newComment.trim()
        },
        invalidatesTags: [{ type: "singleEvent" }, { type: "event-updates" }]
      }).unwrap().then((res) => {
        // Append new comment locally
        const newCommentObj = {
          id: res.id || Date.now(), // fallback if no id returned
          content: newComment.trim(),
          timestamp: new Date().toISOString(),
        };
        setSelectedEvent((prev: any) => ({
          ...prev,
          comments: [...prev.comments, newCommentObj],
        }));
        setNewComment("");
      }).catch((error) => {
        toast({
          title: "Error",
          description: error?.data?.message || "Failed to post comment.",
          variant: "destructive",
        });
      });
    }
  };


  const handleLoadMore = () => {
    if (loadedUpdates.length < maxUpdates) {
      setOffset((prev) => prev + limit);
    }
  };


  const handleComment = (updateId: string) => {
    console.log("Open comments for update:", updateId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <h1 className="lg:text-2xl text-lg font-semibold capitalize">Live Blog</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedEvent && (
              <Card className="mb-8 border-accent">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-accent rounded-full mr-3 animate-pulse" />
                      {selectedEvent.title}
                    </div>
                    <Badge variant="destructive" className="bg-accent text-accent-foreground">
                      LIVE
                    </Badge>

                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex items-center space-x-6 text-muted-foreground">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>{selectedEvent?.updates.length ?? 0} updates</span>
                    </div>
                  </div>
                  {selectedEvent.image_url && (
                    <div className="mb-4" >
                      <img
                        src={selectedEvent?.image_url}
                        alt={selectedEvent?.title}
                        className="w-full lg:h-[400px] h-[200px] object-cover object-center rounded-lg border border-border"
                      />
                    </div>
                  )}

                  <p>{selectedEvent.details}</p>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={`flex items-center space-x-2 transition-colors cursor-pointer ${isLiked ? "text-accent" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <HeartIcon className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                      <span className="hover:text-foreground">{selectedEvent?.likes.length}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      // onClick={handleCommentToggle}
                      className="flex items-center cursor-pointer space-x-2 text-muted-foreground hover:text-foreground"
                    >
                      <MessageCircleIcon className="w-4 h-4" />
                      <span>{selectedEvent?.comments.length}</span>
                    </Button>
                  </div>
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
                    <div className="space-y-2 pr-2 overflow-auto max-h-[400px]">
                      {eventComments?.slice().reverse().map((comment: any) => (
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
            )}

            {/* Updates Feed */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground flex items-center">
                <div className="w-2 h-2 bg-accent rounded-full mr-3 animate-pulse" />
                Live Updates
              </h3>

              {loadedUpdates?.map((update: any) => (
                <LiveUpdateCard
                  key={update.id}
                  update={update}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              ))}
            </div>

            {loadedUpdates.length < maxUpdates && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More Updates"}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <RadioIcon className="w-6 h-6 mr-2 text-accent" />
              Recent Live Blogs
            </h2>

            <div className="space-y-4">
              {mockEvents?.slice().reverse().map((event: any) => (
                <Card
                  key={event.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedEvent?.id === event.id
                    ? "border-accent shadow-lg"
                    : "border-border"
                    }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="destructive" className="bg-accent text-accent-foreground animate-pulse">
                        LIVE
                      </Badge>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {event.updates.length} updates
                        </div>
                      </div>
                    </div>
                    <div className="mb-4" >
                      <img
                        src={event?.image_url}
                        alt={event?.title}
                        className="w-full lg:h-[200px] h-[200px] object-cover object-center rounded-lg border border-border"
                      />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{event.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveUpdates