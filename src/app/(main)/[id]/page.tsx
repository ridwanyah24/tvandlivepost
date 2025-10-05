"use client";

import { use, useState, useMemo } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useGenericMutationMutation, useGetSingleEventQuery, useGetSingleUpdateQuery, useGetUpdateCommentsQuery } from "@/slice/requestSlice";
import { timeSince } from "@/utils/formatDate";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { CleanHTML, cleanHTMLToString } from "@/components/liveUpdates/liveupdates";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: singleUpdate, isLoading, error } = useGetSingleUpdateQuery({ id });
  const { data: updateComments } = useGetUpdateCommentsQuery({ id });
  const [postComment] = useGenericMutationMutation();
  const { data: updateEvent } = useGetSingleEventQuery({ id: singleUpdate?.event_id });
  const [showFull, setShowFull] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(true);

  const [expanded, setExpanded] = useState(false);
  const maxLength = 200;
  const description = cleanHTMLToString(updateEvent?.details)
  const isTruncated = description?.length > maxLength;
  const displayedText = expanded ? <CleanHTML html={updateEvent?.details} /> : description?.slice(0, maxLength);

  const relatedUpdates = useMemo(() => {
    if (!updateEvent?.updates) return [];
    return [...updateEvent.updates].sort(
      (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [updateEvent]);


  const currentIndex = useMemo(() => {
    return relatedUpdates?.findIndex((update: any) => update.id === singleUpdate?.id);
  }, [relatedUpdates, singleUpdate]);

  const prevUpdate = relatedUpdates[currentIndex - 1];
  const nextUpdate = relatedUpdates[currentIndex + 1];

  const handleAddComment = () => {
    if (newComment.trim()) {
      postComment({
        url: `/updates/${id}/comments`,
        method: "POST",
        body: { content: newComment.trim() },
        invalidatesTags: [{ type: "update-comments" }],
      }).unwrap()
        .catch((error) => {
          toast({
            title: "Error",
            description: error?.data?.message || "Failed to post comment.",
            variant: "destructive",
          });
        });
      setNewComment("");
    }
  };

  if (isLoading) return <p className="p-4"></p>;
  if (error || !singleUpdate) return <p className="p-4"></p>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column: Main Update */}
          <div className="w-full lg:w-2/3">
            <h1 className="text-4xl font-bold mb-4">{singleUpdate.title}</h1>
            <p className="text-muted-foreground mb-6">
              Posted on: {format(new Date(singleUpdate.timestamp), "PPPpp")}
            </p>

            {singleUpdate.image_url && (
              <div className="w-full h-[500px] relative mb-6 rounded-lg overflow-hidden">
                <Image
                  src={singleUpdate.image_url}
                  alt={singleUpdate.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="prose prose-neutral mb-6">
              {/* <p>{singleUpdate.details}</p> */}
              <CleanHTML html={singleUpdate?.details} />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mb-10">
              <Button
                variant="outline"
                onClick={() => prevUpdate && router.push(`/${prevUpdate.id}`)}
                disabled={!prevUpdate}
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => nextUpdate && router.push(`/${nextUpdate.id}`)}
                disabled={!nextUpdate}
              >
                Next →
              </Button>
            </div>

            {/* Event Preview Moved Below Main Update */}
            {updateEvent &&
              <div className="mt-10 flex flex-col  gap-4">
                {/* Image Section */}
                {updateEvent.image_url && (
                  <div className="w-full md:h-auto overflow-hidden rounded-md">
                    <img
                      src={updateEvent.image_url}
                      alt={updateEvent.title}
                      width={300}
                      height={100}
                      className="w-full max-h-[700px]"
                    />
                  </div>
                )}

                {/* Text Section */}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{updateEvent.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(updateEvent.timestamp), "PPPpp")}
                  </p>

                  {/* Description with toggle */}
                  <p>
                    {displayedText}
                    {isTruncated && !expanded && "..."}
                    {isTruncated && (
                      <button
                        onClick={()=>setExpanded(!expanded)}
                        className="text-accent cursor-pointer  ml-1 hover:underline text-sm"
                      >
                        {expanded ? "View less" : "View more"}
                      </button>
                    )}
                  </p>
                </div>
              </div>
            }

            {/* Comments */}
            {isCommenting && (
              <div className="mt-6 space-y-3 border-t border-border pt-4">
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
                <div className="space-y-2 pr-2 overflow-auto max-h-[400px]">
                  {updateComments?.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="border border-border p-2 rounded-md text-sm bg-muted flex flex-col gap-2 overflow-auto max-h-[100px]"
                    >
                      <span className="font-medium text-foreground">{comment.content}</span>
                      <span className="text-muted-foreground">{timeSince(comment.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Related Updates */}
          <div className="w-full lg:w-1/3">
            <h3 className="text-lg font-semibold mb-4 mt-10">Recent Updates</h3>
            <div className="space-y-4">
              {relatedUpdates?.map((update: any) => (
                <div key={update.id} className="border rounded-md bg-muted shadow-sm p-2">
                  {update.image_url && (
                    <Image
                      src={update.image_url}
                      alt={update.title}
                      width={400}
                      height={100}
                      className="object-fit w-full h-[250px] rounded mb-2 cursor-pointer"
                      onClick={() => router.push(`/${update.id}`)}
                    />
                  )}
                  <div className="flex items-center gap-2 text-xs mb-1">

                    <span className="text-muted-foreground">
                      {update.comments?.length || 0} updates
                    </span>
                  </div>
                  <p
                    // variant={update.id === singleUpdate.id ? "secondary" : "ghost"}
                    className="w-full text-left justify-start"
                  >
                    {update.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
