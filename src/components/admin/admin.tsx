import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SettingsIcon, 
  PlusIcon, 
  EyeIcon, 
  HeartIcon, 
  MessageCircleIcon,
  TvIcon,
  RadioIcon,
  StopCircleIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/text-area";

const Admin = () => {
  const { toast } = useToast();
  
  // Form states
  const [eventForm, setEventForm] = useState({
    title: "",
    description: ""
  });
  
  const [updateForm, setUpdateForm] = useState({
    eventId: "",
    title: "",
    details: "",
    image: null as File | null
  });
  
  const [videoForm, setVideoForm] = useState({
    title: "",
    videoFile: null as File | null,
    thumbnail: null as File | null
  });

  // Mock data
  const activeEvents = [
    {
      id: "1",
      title: "Tech Conference 2024",
      status: "live",
      updates: 12,
      viewers: 1247
    },
    {
      id: "2",
      title: "Product Launch Event",
      status: "live", 
      updates: 8,
      viewers: 892
    }
  ];

  const recentUpdates = [
    {
      id: "1",
      eventTitle: "Tech Conference 2024",
      title: "CEO Takes the Stage",
      likes: 42,
      comments: 8,
      timestamp: "2 minutes ago"
    },
    {
      id: "2",
      eventTitle: "Product Launch Event",
      title: "New Product Announcement",
      likes: 87,
      comments: 15,
      timestamp: "5 minutes ago"
    }
  ];

  const recentVideos = [
    {
      id: "1",
      title: "Tech Innovation Summit 2024",
      views: 15400,
      likes: 892,
      comments: 156,
      status: "published"
    },
    {
      id: "2",
      title: "Product Launch Highlights",
      views: 8900,
      likes: 654,
      comments: 89,
      status: "published"
    }
  ];

  const handleCreateEvent = () => {
    if (!eventForm.title.trim()) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Event created successfully!"
    });
    
    setEventForm({ title: "", description: "" });
  };

  const handleCreateUpdate = () => {
    if (!updateForm.eventId || !updateForm.title.trim() || !updateForm.details.trim()) {
      toast({
        title: "Error", 
        description: "Event, title and details are required",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Update posted successfully!"
    });
    
    setUpdateForm({ eventId: "", title: "", details: "", image: null });
  };

  const handleUploadVideo = () => {
    if (!videoForm.title.trim()) {
      toast({
        title: "Error",
        description: "Video title is required",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Video uploaded successfully!"
    });
    
    setVideoForm({ title: "", videoFile: null, thumbnail: null });
  };

  const handleEndEvent = (eventId: string) => {
    toast({
      title: "Event Ended",
      description: "Event has been marked as ended and removed from live feed"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-accent" />
            Admin Console
          </h1>
          <p className="text-muted-foreground">Manage events, updates, and videos</p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <RadioIcon className="w-4 h-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="updates" className="flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Updates</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center space-x-2">
              <TvIcon className="w-4 h-4" />
              <span>Videos</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <EyeIcon className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Event */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({...prev, title: e.target.value}))}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({...prev, description: e.target.value}))}
                      placeholder="Enter event description"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreateEvent} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Create Event
                  </Button>
                </CardContent>
              </Card>

              {/* Active Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-semibold text-foreground">{event.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{event.updates} updates</span>
                            <span>{event.viewers} viewers</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive" className="bg-accent text-accent-foreground">
                            LIVE
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEndEvent(event.id)}
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <StopCircleIcon className="w-4 h-4 mr-1" />
                            End
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Update */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Live Update</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="update-event">Select Event</Label>
                    <select
                      id="update-event"
                      value={updateForm.eventId}
                      onChange={(e) => setUpdateForm(prev => ({...prev, eventId: e.target.value}))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                      <option value="">Choose an event...</option>
                      {activeEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="update-title">Update Title</Label>
                    <Input
                      id="update-title"
                      value={updateForm.title}
                      onChange={(e) => setUpdateForm(prev => ({...prev, title: e.target.value}))}
                      placeholder="Enter update title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="update-details">Details</Label>
                    <Textarea
                      id="update-details"
                      value={updateForm.details}
                      onChange={(e) => setUpdateForm(prev => ({...prev, details: e.target.value}))}
                      placeholder="Enter update details"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="update-image">Image (Optional)</Label>
                    <Input
                      id="update-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUpdateForm(prev => ({...prev, image: e.target.files?.[0] || null}))}
                    />
                  </div>
                  <Button onClick={handleCreateUpdate} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Post Update
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Updates */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUpdates.map((update) => (
                      <div key={update.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground text-sm">{update.title}</h3>
                          <span className="text-xs text-muted-foreground">{update.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{update.eventTitle}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <HeartIcon className="w-3 h-3 mr-1" />
                            {update.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageCircleIcon className="w-3 h-3 mr-1" />
                            {update.comments}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Video */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Video</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="video-title">Video Title</Label>
                    <Input
                      id="video-title"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm(prev => ({...prev, title: e.target.value}))}
                      placeholder="Enter video title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="video-file">Video File</Label>
                    <Input
                      id="video-file"
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoForm(prev => ({...prev, videoFile: e.target.files?.[0] || null}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail-file">Thumbnail</Label>
                    <Input
                      id="thumbnail-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setVideoForm(prev => ({...prev, thumbnail: e.target.files?.[0] || null}))}
                    />
                  </div>
                  <Button onClick={handleUploadVideo} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Upload Video
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Videos */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentVideos.map((video) => (
                      <div key={video.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground text-sm">{video.title}</h3>
                          <Badge variant="secondary">{video.status}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <EyeIcon className="w-3 h-3 mr-1" />
                            {video.views.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <HeartIcon className="w-3 h-3 mr-1" />
                            {video.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageCircleIcon className="w-3 h-3 mr-1" />
                            {video.comments}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 border border-border rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">2,139</div>
                    <div className="text-muted-foreground">Total Viewers</div>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">20</div>
                    <div className="text-muted-foreground">Live Updates</div>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">5</div>
                    <div className="text-muted-foreground">Videos Published</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;