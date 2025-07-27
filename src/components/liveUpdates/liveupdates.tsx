'use client'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LiveUpdateCard from "@/components/LiveUpdateCard";
import { RadioIcon, ClockIcon, UsersIcon } from "lucide-react";

// Mock data - replace with API calls
const mockEvents = [
  {
    id: "1",
    title: "Tech Conference 2024",
    status: "live" as const,
    updateCount: 12,
    viewers: 1247,
  },
  {
    id: "2", 
    title: "Product Launch Event",
    status: "live" as const,
    updateCount: 8,
    viewers: 892,
  },
  {
    id: "3",
    title: "Weekly Team Meeting",
    status: "live" as const,
    updateCount: 5,
    viewers: 23,
  },
];

const mockUpdates = [
  {
    id: "1",
    eventId: "1",
    title: "CEO Takes the Stage",
    details: "The CEO has just taken the stage to deliver the opening keynote. The audience is packed and excitement is building as we prepare to hear about the company's latest innovations.",
    timestamp: "2024-01-15T14:30:00Z",
    likes: 42,
    comments: 8,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop"
  },
  {
    id: "2", 
    eventId: "1",
    title: "New Product Announcement",
    details: "A revolutionary new product has been announced! This cutting-edge technology promises to transform how we interact with digital content. More details to follow.",
    timestamp: "2024-01-15T14:25:00Z",
    likes: 87,
    comments: 15,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop"
  },
  {
    id: "3",
    eventId: "1",
    title: "Demo Session Starting",
    details: "The live demonstration is about to begin. Technical teams are setting up the equipment for what promises to be an impressive showcase of capabilities.",
    timestamp: "2024-01-15T14:20:00Z",
    likes: 23,
    comments: 4,
  },
  {
    id: "4",
    eventId: "2",
    title: "Product Launch Begins",
    details: "Welcome to our exciting product launch event! We're thrilled to share our latest innovations with you today.",
    timestamp: "2024-01-15T13:45:00Z",
    likes: 56,
    comments: 12,
  },
  {
    id: "5",
    eventId: "2", 
    title: "Feature Demonstration",
    details: "Our team is now demonstrating the key features of our new product. The response from the audience has been fantastic!",
    timestamp: "2024-01-15T13:30:00Z",
    likes: 34,
    comments: 7,
  },
];

const LiveUpdates = () => {
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0]);
  const [allUpdates] = useState(mockUpdates);
  
  // Filter updates based on selected event
  const updates = allUpdates.filter(update => update.eventId === selectedEvent.id);

  const handleLike = (updateId: string) => {
    // In real implementation, this would update the backend
    console.log("Liked update:", updateId);
  };

  const handleComment = (updateId: string) => {
    // Implementation for opening comment modal/section
    console.log("Open comments for update:", updateId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Events Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <RadioIcon className="w-6 h-6 mr-2 text-accent" />
              Live Events
            </h2>
            
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <Card 
                  key={event.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedEvent.id === event.id 
                      ? "border-(--accent) shadow-lg" 
                      : "border-border"
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-sm">{event.title}</h3>
                      <Badge 
                        variant="destructive" 
                        className="bg-accent text-accent-foreground animate-pulse"
                      >
                        LIVE
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {event.updateCount} updates
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="w-3 h-3 mr-1" />
                        {event.viewers}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Event Header */}
            <Card className="mb-8 border-accent">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-accent rounded-full mr-3 animate-pulse"></div>
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
                    <UsersIcon className="w-4 h-4 mr-2" />
                    <span>{selectedEvent.viewers} watching</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span>{selectedEvent.updateCount} updates</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Updates Feed */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground flex items-center">
                <div className="w-2 h-2 bg-accent rounded-full mr-3 animate-pulse"></div>
                Live Updates
              </h3>
              
              {updates.map((update) => (
                <LiveUpdateCard
                  key={update.id}
                  update={update}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Load More Updates
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveUpdates;