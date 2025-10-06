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
import { Input } from "../ui/input";
import VideoCard from "../VideoCard";
import DOMPurify from "dompurify";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [newComment, setNewComment] = useState("");
  const [postComment] = useGenericMutationMutation();
  const { data: eventComments } = useGetEventCommentsQuery({ id: selectedEvent?.id });
  const { data } = useGetRecentVideosQuery();

  const [offset, setOffset] = useState(0);
  const limit = 2;
  const maxUpdates = 5;

  const [likeId, setLikeId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isVideoLiked, setIsVideoLiked] = useState(false);

  const router = useRouter();

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

  const handleAddComment = () => {
    if (newComment.trim()) {
      postComment({
        url: `/events/${selectedEvent?.id}/comments`,
        method: "POST",
        body: { content: newComment.trim() },
        invalidatesTags: [{ type: "singleEvent" }, { type: "event-updates" }],
      })
        .unwrap()
        .then((res) => {
          const newCommentObj = {
            id: res.id || Date.now(),
            content: newComment.trim(),
            timestamp: new Date().toISOString(),
          };

          setSelectedEvent((prev: any) => ({
            ...prev,
            comments: [...prev.comments, newCommentObj],
          }));

          setNewComment("");
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

  const handlePlay = (videoId: string | number) => {
    router.push(`/tv/${videoId}`);
  };

  const handleLoadMore = () => {
    if (loadedUpdates.length < maxUpdates) {
      setOffset((prev) => prev + limit);
    }
  };

  const handleLikeVideo = (id: number) => {
    if (!id) return;

    const method = isVideoLiked ? "DELETE" : "POST";
    const url = isVideoLiked ? `/likes/${likeId}` : `/tvs/${id}/likes`;

    likeVideo({
      url,
      method,
      invalidatesTags: [{ type: "all-videos" }],
    })
      .unwrap()
      .then((res) => {
        if (!isVideoLiked && res?.id) {
          setLikeId(res.id);
        } else if (isVideoLiked) {
          setLikeId(null);
        }
        setIsLiked(!isVideoLiked);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error?.data?.message || "Failed to toggle like.",
          variant: "destructive",
        });
      });
  };

  const handleComment = (updateId: string) => {
    console.log("Open comments for update:", updateId);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <h1 className="lg:text-3xl text-2xl font-bold tracking-tight mb-6">Live Post</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {!selectedEvent && <p>No Events to show</p>}

            {selectedEvent && (
              <article className="space-y-6">
                <header className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold leading-snug">{selectedEvent.title}</h2>
                    <Badge className="bg-accent text-white animate-pulse">LIVE</Badge>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" /> {selectedEvent?.updates.length ?? 0} updates
                    </span>
                  </div>
                </header>

                {selectedEvent.image_url && (
                  <div className="w-full overflow-hidden rounded-xl">
                    <img
                      src={selectedEvent.image_url}
                      alt={selectedEvent.title}
                      className="w-full lg:h-[480px] h-[250px] object-cover object-center"
                    />
                  </div>
                )}

                <div className="prose max-w-none">
                  <CleanHTML html={selectedEvent.details} />
                </div>

                {/* Updates integrated below */}
                {loadedUpdates?.length > 0 && (
                  <section className="space-y-8 mt-10">
                    {/* <h3 className="text-xl font-semibold border-l-4 border-red-600 pl-3">
                      Live Updates
                    </h3> */}
                    {loadedUpdates.map((update: any) => (
                      <LiveUpdateCard
                        key={update.id}
                        update={update}
                        onLike={handleLike}
                        onComment={handleComment}
                      />
                    ))}
                    {loadedUpdates.length < maxUpdates && (
                      <div className="text-center mt-8">
                        <Button
                          onClick={handleLoadMore}
                          variant="outline"
                          className="text-red-600 hover:bg-red-600 hover:text-white"
                          disabled={loading}
                        >
                          {loading ? "Loading..." : "Load More Updates"}
                        </Button>
                      </div>
                    )}
                  </section>
                )}

                {/* Interaction Section */}
                <section className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={`flex items-center space-x-2 ${isLiked ? "text-red-600" : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      <HeartIcon className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                      <span>{selectedEvent?.likes.length}</span>
                    </Button>

                    <Button variant="ghost" size="sm" className="flex items-center text-gray-500 hover:text-gray-800">
                      <MessageCircleIcon className="w-4 h-4 mr-1" /> {selectedEvent?.comments.length}
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex items-center text-gray-500 hover:text-gray-800">
                          <Share2Icon className="w-4 h-4 mr-1" /> Share
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 flex flex-col space-y-2">
                        <Button
                          variant="ghost"
                          className="justify-start text-sm"
                          onClick={() =>
                            window.open(
                              `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(selectedEvent?.title)}`,
                              "_blank"
                            )
                          }
                        >
                          <TwitterIcon className="w-4 h-4 mr-2" /> Twitter
                        </Button>

                        <Button
                          variant="ghost"
                          className="justify-start text-sm"
                          onClick={() =>
                            window.open(
                              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                              "_blank"
                            )
                          }
                        >
                          <LinkedinIcon className="w-4 h-4 mr-2" /> LinkedIn
                        </Button>

                        <Button
                          variant="ghost"
                          className="justify-start text-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast({ description: "Link copied to clipboard!" });
                          }}
                        >
                          <CopyIcon className="w-4 h-4 mr-2" /> Copy Link
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Comments */}
                  <div className="pt-4 space-y-3">
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button size="sm" className="bg-accent hover:bg-red-700" onClick={handleAddComment}>
                        <SendIcon />
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-auto">
                      {eventComments?.slice().reverse().map((comment: any) => (
                        <div key={comment.id} className="p-3 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-800">{comment.content}</p>
                          <span className="text-xs text-gray-500">{timeSince(comment.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </article>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <RadioIcon className="w-5 h-5 mr-2 text-red-600" /> Recent Live Blogs
              </h2>

              <div className="space-y-5">
                {mockEvents
                  ?.slice()
                  .reverse()
                  .map((event: any) => (
                    <div
                      key={event.id}
                      className={`cursor-pointer transition-all duration-200 hover:opacity-80 ${selectedEvent?.id === event.id ? "opacity-100" : "opacity-80"
                        }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="relative w-full overflow-hidden rounded-lg">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-[180px] object-cover object-center"
                        />
                        <Badge className="absolute top-2 left-2 bg-accent text-white animate-pulse">
                          LIVE
                        </Badge>
                      </div>
                      <h3 className="mt-2 font-medium text-gray-800 text-sm">{event.title}</h3>
                    </div>
                  ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUpIcon className="w-5 h-5 mr-2 text-red-600" /> Related Videos
              </h3>

              <div className="space-y-4">
                {data?.map((video: any) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={handlePlay}
                    onLike={handleLikeVideo}
                    size="large"
                  />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LiveUpdates;
