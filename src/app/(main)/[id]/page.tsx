"use client";

import { use, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useGenericMutationMutation, useGetSingleUpdateQuery, useGetUpdateCommentsQuery } from "@/slice/requestSlice";
import { timeSince } from "@/utils/formatDate";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data:singleUpdate, isLoading, error } = useGetSingleUpdateQuery({ id });
  const [postComment, { isLoading: loadingComment, isError }] = useGenericMutationMutation();
  const { data: updateComments } = useGetUpdateCommentsQuery({ id: id });
 
  const [isCommenting, setIsCommenting] = useState(true);
  const [newComment, setNewComment] = useState("");


  if (isLoading) return <p className="p-4"></p>;
  if (error || !singleUpdate) return <p className="p-4">Update not found.</p>;

  const {
    title,
    timestamp,
    image_url,
    event,
  } = singleUpdate;

  const handleAddComment = () => {
    if (newComment.trim()) {
      postComment({
        url: `/updates/${id}/comments`,
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-10">{title}</h1>
        <p className="text-muted-foreground mb-10">
          Posted on: {format(new Date(timestamp), "PPPpp")}
        </p>

        {image_url && (
          <div className="w-full max-h-[500px] h-[500px] relative mb-6 rounded-lg overflow-hidden">
            <Image
              src={singleUpdate?.image_url}
              alt={title}
              fill
              className="object-fit"
            />
          </div>
        )}

        <div className="space-y-4 mb-5">
          {/* <div>
            <p className="text-sm text-muted-foreground">Related Event:</p>
            <p className="text-lg font-medium">{event?.title}</p>
            <p className="text-sm">Status: {event?.status}</p>
          </div> */}

          <div className="prose prose-neutral">
            <p>{singleUpdate?.details}</p>
          </div>
        </div>
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
            <div className="space-y-2  pr-2">
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
      </div>
    </div>
  );
}