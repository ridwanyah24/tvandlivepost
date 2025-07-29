'use client'
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
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
import { useGenericMutationMutation, useGetAllEventsQuery, useGetAnalyticsQuery, useGetRecentUpdatesQuery, useGetRecentVideosQuery } from "@/slice/requestSlice";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/hooks/redux-hooks";
import { selectCurrentAdminAccess } from "@/slice/authAdmin";
import { useRouter } from "next/navigation";
import { timeSince } from "@/utils/formatDate";



const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional()
});

const updateSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  details: z.string(),
  image_file: z
    .custom<File | undefined>((file) => file === undefined || file instanceof File, {
      message: "I am the trouble",
    }).optional()
    .refine((file) => file === undefined || file.size > 0, {
      message: "Image file is required",
    })
    .refine((file) => file === undefined || file.type.startsWith("image/"), {
      message: "Only image files are allowed",
    }),

});

const uploadVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  thumbnail: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: "Thumbnail is required" })
    .refine((file) => file.type.startsWith("image/"), {
      message: "Thumbnail must be an image file",
    }),
  video_file: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: "Video file is required" })
    .refine((file) => file.type.startsWith("video/"), {
      message: "Only video files are allowed",
    }),
});


const Admin = () => {
  const { toast } = useToast();
  const [createEvent, { isLoading, isError, isSuccess }] = useGenericMutationMutation();
  const [postUpdate, { isLoading: loading, isError: error, isSuccess: success }] = useGenericMutationMutation();
  const [eventId, setEventId] = useState("");
  const [uploadVideoMutation, { isLoading: loadingVideo, isError: errorVideo, isSuccess: successVideo }] = useGenericMutationMutation();


  const [endEvent, { isLoading: endingEvent, isError: errorEVent }] = useGenericMutationMutation();

  const { data: activeEvents, isLoading: loadingEvents, isError: eventsError } = useGetAllEventsQuery();
  const {data:analytics, isLoading:loadingAnalytics, isError: errorAnalytics} = useGetAnalyticsQuery();
 
  const {data:recentUpdates, isLoading:loadUpdates, isError:loadError } = useGetRecentUpdatesQuery();
  console.log(recentUpdates);
  
  const {data:recentVideos, isLoading:loadVideos, isError:loadvidError } = useGetRecentVideosQuery();


  const accessToken = useAppSelector(selectCurrentAdminAccess);
  console.log(accessToken);

  const router = useRouter();

  // Protect route
  useEffect(() => {
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You must be logged in to access the admin page.",
      });

      router.push("/auth"); // Redirect to login page
    }
  }, [accessToken, router, toast]);

  // You can optionally return null or a spinner until redirect completes
//   if (!accessToken) return null;

  const {
    register: registerEvent,
    handleSubmit: handleSubmitEvent,
    reset: resetEventForm,
    formState: { errors: eventErrors },
  } = useForm({
    resolver: zodResolver(createEventSchema),
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    setValue,
    watch,
    formState: { errors: updateErrors },
  } = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
  });

  const {
    register: registerVideo,
    handleSubmit: handleSubmitVideo,
    reset: resetVideo,
    setValue: setValueVideo,
    watch: watchVideo,
    formState: { errors: videoErrors },
  } = useForm({
    resolver: zodResolver(uploadVideoSchema),
  });
 

  const handleCreateEvent = (data: z.infer<typeof createEventSchema>) => {
    console.log(data);
    createEvent({
      url: '/admin/events',
      method: "POST",
      body: data,
      invalidatesTags: [{ type: "events" }]
    })
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Event created successfully!",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error?.data?.message || "Failed to create event.",
          variant: "destructive",
        });
      });
    resetEventForm();
  };

  const handleCreateUpdate = (data: z.infer<typeof updateSchema>) => {
    const formData = new FormData();
    // Append the update object as a JSON string
    formData.append("title", data.title);
    formData.append("details", data.details);

    // Append the image file
    if (data.image_file) {
      formData.append("image_file", data.image_file);
    }
    // Trigger the mutation with FormData
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    postUpdate({
      url: `/admin/events/${eventId}/updates`,
      method: "POST",
      body: formData,
    }).unwrap().then(() => {
      toast({
        title: "Success",
        description: "Update posted successfully!",
      });
    }).catch((error) => {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to post Update.",
        variant: "destructive",
      });
    });
    resetUpdate();
  };

  const handleUploadVideo = (data: z.infer<typeof uploadVideoSchema>) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("videoFile", data.video_file.name);
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail.name);

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    uploadVideoMutation({
      url: `/admin/videos`,
      method: "POST",
      body: formData,
    }).unwrap().then(() => {
      toast({
        title: "Success",
        description: "video posted successfully!",
      });
    }).catch((error) => {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to post video.",
        variant: "destructive",
      });
    });
    resetVideo();
  };

  const handleEndEvent = (eventId: string) => {
    endEvent({
      url: `/admin/events/${eventId}`,
      method: "DELETE",
      invalidatesTags: [{ type: "events" }]
    }).unwrap().then(() => {
      toast({
        title: "Success",
        description: "video posted successfully!",
      });
    }).catch((error) => {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to post video.",
        variant: "destructive",
      });
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
            <TabsTrigger value="events" className="flex items-center space-x-2 cursor-pointer">
              <RadioIcon className="w-4 h-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="updates" className="flex items-center space-x-2 cursor-pointer">
              <PlusIcon className="w-4 h-4" />
              <span>Updates</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center space-x-2 cursor-pointer">
              <TvIcon className="w-4 h-4" />
              <span>Videos</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 cursor-pointer">
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
                  <form onSubmit={handleSubmitEvent(handleCreateEvent)} className="space-y-4">
                    <div>
                      <Label htmlFor="event-title">Event Title</Label>
                      <Input id="event-title" {...registerEvent("title")} />
                      {eventErrors.title && <p className="text-sm text-red-500">{eventErrors.title.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea id="event-description" {...registerEvent("description")} />
                    </div>
                    <Button type="submit" className="cursor-pointer hover:bg-accent" disabled={isLoading}>Create Event</Button>
                  </form>
                </CardContent>
              </Card>

              {/* Active Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeEvents?.map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-semibold text-foreground">{event.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{event?.updates?.length} updates</span>
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
                            className={`border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer `} disabled={endingEvent}
                          >
                            <StopCircleIcon className="w-4 h-4 mr-1" />
                            {endingEvent ? "Ending Event" : "End"}
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
                <CardContent >
                  <form onSubmit={handleSubmitUpdate(handleCreateUpdate)} className="space-y-4">
                    <div>
                      <Label htmlFor="eventId">Select Event</Label>
                      <select
                        id="eventId"
                        // {...registerUpdate("eventId", { required: true })}
                        onChange={(e) => { setEventId(e.target.value) }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="">Choose an event...</option>
                        {activeEvents?.map((event: any) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                      {eventId === "" && <p className="text-red-500 text-sm">Event is required</p>}
                    </div>

                    <div>
                      <Label htmlFor="update.title">Update Title</Label>
                      <Input
                        id="update.title"
                        {...registerUpdate("title")}
                        placeholder="Enter update title"
                      />
                      {updateErrors.title && (
                        <p className="text-red-500 text-sm">{updateErrors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="update.details">Details</Label>
                      <Textarea
                        id="update.details"
                        {...registerUpdate("details")}
                        placeholder="Enter update details"
                        rows={4}
                      />
                      {updateErrors.details && (
                        <p className="text-red-500 text-sm">{updateErrors.details.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="image_file">Image (Optional)</Label>
                      <Input
                        id="image_file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setValue("image_file", file, { shouldValidate: true });
                          }
                        }}
                      />
                      {updateErrors.image_file && (
                        <p className="text-red-500 text-sm">{updateErrors.image_file.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Posting Update" : "Post Update"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Recent Updates */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(recentUpdates || []).map((update:any) => (
                      <div key={update.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground text-sm">{update.title}</h3>
                          <span className="text-xs text-muted-foreground">{timeSince(update.timestamp)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{update.eventTitle}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <HeartIcon className="w-3 h-3 mr-1" />
                            {update.likes.length}
                          </div>
                          <div className="flex items-center">
                            <MessageCircleIcon className="w-3 h-3 mr-1" />
                            {update.comments.length}
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
                  <form onSubmit={handleSubmitVideo(handleUploadVideo)} className="space-y-4">
                    <div>
                      <Label htmlFor="video-title">Video Title</Label>
                      <Input
                        id="video-title"
                        placeholder="Enter video title"
                        {...registerVideo("title")}
                      />
                      {videoErrors.title && (
                        <p className="text-red-500 text-sm mt-1">{videoErrors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="video-file">Video File</Label>
                      <Input
                        id="video-file"
                        type="file"
                        accept="video/*"
                        // {...registerVideo("video_file")}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setValueVideo("video_file", file, { shouldValidate: true });
                          }
                        }}
                      />
                      {videoErrors.video_file && (
                        <p className="text-red-500 text-sm mt-1">{videoErrors.video_file.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="thumbnail-file">Thumbnail</Label>
                      <Input
                        id="thumbnail-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setValueVideo("thumbnail", file, { shouldValidate: true });
                          }
                        }}
                      />
                      {videoErrors.thumbnail && (
                        <p className="text-red-500 text-sm mt-1">{videoErrors.thumbnail.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Upload Video
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Recent Videos */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentVideos?.map((video:any) => (
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
                    <div className="text-3xl font-bold text-accent mb-2">{analytics?.total_views}</div>
                    <div className="text-muted-foreground">Total Viewers</div>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">{analytics?.total_updates}</div>
                    <div className="text-muted-foreground">Live Updates</div>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">{analytics?.total_videos}</div>
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