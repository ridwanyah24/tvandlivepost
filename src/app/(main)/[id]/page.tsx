"use client";

import { use } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useGetSingleUpdateQuery } from "@/slice/requestSlice";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useGetSingleUpdateQuery({ id });

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error || !data) return <p className="p-4">Update not found.</p>;

  const {
    title,
    timestamp,
    image_url,
    event,
  } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-2">
          Posted on: {format(new Date(timestamp), "PPPpp")}
        </p>

        {image_url && (
          <div className="w-full h-64 relative mb-6 rounded-lg overflow-hidden">
            <Image
              src={data?.image_url}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Related Event:</p>
            <p className="text-lg font-medium">{event?.title}</p>
            <p className="text-sm">Status: {event?.status}</p>
          </div>

          <div className="prose prose-neutral">
            <p>{data?.details}</p>
          </div>
        </div>
      </div>
    </div>
  );
}