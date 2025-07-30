'use client'
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LiveUpdateCard from "@/components/LiveUpdateCard";
import { RadioIcon, ClockIcon, UsersIcon } from "lucide-react";
import { useGetAllEventsQuery, useGetEventUpdatesQuery } from "@/slice/requestSlice";
import { skipToken } from "@reduxjs/toolkit/query";


const LiveUpdates = () => {
  const { data: mockEvents, isLoading, isError } = useGetAllEventsQuery();
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [loadedUpdates, setLoadedUpdates] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const limit = 2; // how many per page
  const maxUpdates = 5;

  // Set default event when events are fetched
  useEffect(() => {
    if (mockEvents && mockEvents.length > 0) {
      setSelectedEvent(mockEvents[0]);
    }
  }, [mockEvents]);

  useEffect(() => {
    if (selectedEvent) {
      setOffset(0);
      setLoadedUpdates([]); // reset updates when event changes
    }
  }, [selectedEvent]);

  const { data: mockUpdates, isLoading: loading, isError: error } = useGetEventUpdatesQuery(
    selectedEvent?.id
      ? { id: selectedEvent.id, limit, offset }
      : skipToken
  );

  useEffect(() => {
    if (mockUpdates?.length) {
      setLoadedUpdates((prev) => {
        const combined = [...prev, ...mockUpdates];
        const unique = Array.from(new Map(combined.map(u => [u.id, u])).values()); // avoid duplicates
        return unique.slice(0, maxUpdates); // cap at 5
      });
    }
  }, [mockUpdates]);

  const handleLoadMore = () => {
    if (loadedUpdates.length < maxUpdates) {
      setOffset((prev) => prev + limit);
    }
  };

  const handleLike = (updateId: string) => {
    console.log("Liked update:", updateId);
  };

  const handleComment = (updateId: string) => {
    console.log("Open comments for update:", updateId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <RadioIcon className="w-6 h-6 mr-2 text-accent" />
              Live Events
            </h2>

            <div className="space-y-4">
              {mockEvents?.map((event: any) => (
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
                      <h3 className="font-semibold text-foreground text-sm">{event.title}</h3>
                      <Badge variant="destructive" className="bg-accent text-accent-foreground animate-pulse">
                        LIVE
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {event.updates.length} updates
                      </div>

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

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
                <CardContent>
                  <div className="flex items-center space-x-6 text-muted-foreground">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>{selectedEvent?.updates.length ?? 0} updates</span>
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
        </div>
      </div>
    </div>
  );
};

export default LiveUpdates