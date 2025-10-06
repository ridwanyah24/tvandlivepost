'use client'
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  SettingsIcon,
  PlusIcon,
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  TvIcon,
  RadioIcon,
  StopCircleIcon,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGenericMutationMutation, useGetAllCategoriesQuery, useGetAllEventsQuery, useGetAllVideosQuery, useGetAnalyticsQuery, useGetEventUpdatesQuery, useGetRecentUpdatesQuery, useGetRecentVideosQuery } from "@/slice/requestSlice";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/hooks/redux-hooks";
import { selectCurrentAdminAccess } from "@/slice/authAdmin";
import { useRouter } from "next/navigation";
import { timeSince } from "@/utils/formatDate";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Editor } from "@/components/blocks/editor-x/editor"
import { editorStateToHTML } from "@/utils/checkHtml";
import { LoadingModal } from "@/components/VideoCard";
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $getSelection } from "lexical";
import { update } from "lodash-es";



const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string(),
  image_file: z
    .custom<File | undefined>((file) => file === undefined || file instanceof File, {
      message: "I am the trouble",
    }).optional()
    .refine((file) => file === undefined || file.size > 0, {
      message: "Image file is required",
    })
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
  description: z.string(),
  category_ids: z.array(z.number()).min(1),
});


const Admin = () => {
  const { toast } = useToast();
  const [createEvent, { isLoading, isError, isSuccess }] = useGenericMutationMutation();
  const [postUpdate, { isLoading: loading, isError: error, isSuccess: success }] = useGenericMutationMutation();
  const [eventId, setEventId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [updateId, setUpdateId] = useState("");
  const { data: videoCategories, isLoading: loadingCategories, isError: errorGetCat } = useGetAllCategoriesQuery();
  const [endEvent, { isLoading: endingEvent, isError: errorEVent }] = useGenericMutationMutation();
  const { data: activeEvents, isLoading: loadingEvents, isError: eventsError } = useGetAllEventsQuery();
  const { data: analytics, isLoading: loadingAnalytics, isError: errorAnalytics } = useGetAnalyticsQuery();
  const { data: recentUpdates, isLoading: loadUpdates, isError: loadError } = useGetRecentUpdatesQuery();
  const { data: allEventUpdates, isLoading: loadAllEventUpdates, isError: loadAllEventUpdatesError } = useGetEventUpdatesQuery({ limit: 10000000, offset: 0, id: eventId });
  const { data: recentVideos, isLoading: loadVideos, isError: loadvidError } = useGetRecentVideosQuery();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { data: mockVideos, isLoading: laodingVideos } = useGetAllVideosQuery(selectedCategory === "all" ? {} : { category_ids: [parseInt(selectedCategory)] });
  const [videoId, setVideoId] = useState("");

  const accessToken = useAppSelector(selectCurrentAdminAccess);

  const router = useRouter();

  const htmlToLexical = (html: string) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");
    return (editor: any) => {
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().clear();
      $getRoot().append(...nodes);
    };
  };

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


  const {
    register: registerEvent,
    handleSubmit: handleSubmitEvent,
    reset: resetEventForm,
    setValue: setEventValue,
    watch: watchEvent,
    formState: { errors: eventErrors },
  } = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      description: ""
    }
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
    const formData = new FormData();
    let htmlDescription = "";
    try {
      const parsedState = JSON.parse(data.description);
      htmlDescription = editorStateToHTML(parsedState);
      console.log(htmlDescription);

    } catch (err) {
      console.error("Failed to parse Lexical state", err);
    }
    // Append the update object as a JSON string
    formData.append("title", data.title);
    formData.append("details", htmlDescription);
    if (data.image_file) {
      formData.append("image_file", data.image_file);
    }

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    createEvent({
      url: '/admin/events',
      method: "POST",
      body: formData,
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


  const handleEventSelect = (id: string) => {
    setEventId(id);

    console.log(id);


    const selectedEvent = activeEvents.find((ev: any) => ev.id == id);
    console.log(selectedEvent);

    if (selectedEvent) {
      resetEventForm(
        {
          title: selectedEvent.title,
          description: JSON.stringify(htmlToLexical(selectedEvent.details)),
          image_file: undefined, // user may re-upload
        },
        {
          keepDefaultValues: true, // ✅ ensures select isn't reset
        }
      );
    }
  };


  const handleUpdateSelect = (id: string) => {
    setUpdateId(id);

    console.log(id);

    const selectedUpdate = allEventUpdates.find((ev: any) => ev.id == id);
    console.log(selectedUpdate);

    if (selectedUpdate) {
      resetUpdate(
        {
          title: selectedUpdate.title,
          details: JSON.stringify(htmlToLexical(selectedUpdate.details)),
          image_file: undefined, // user may re-upload
        },
        {
          keepDefaultValues: true, // ✅ ensures select isn't reset
        }
      );
    }
  };


  const handleUpdateEvent = (data: z.infer<typeof createEventSchema>) => {
    console.log(eventId);

    const formData = new FormData();
    let htmlDescription = "";
    try {
      const parsedState = JSON.parse(data.description);
      htmlDescription = editorStateToHTML(parsedState);
      console.log(htmlDescription);

    } catch (err) {
      console.error("Failed to parse Lexical state", err);
    }
    // Append the update object as a JSON string
    formData.append("title", data.title);
    formData.append("details", htmlDescription);
    if (data.image_file) {
      formData.append("image_file", data.image_file);
    }

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    createEvent({
      url: `/admin/events/${eventId}`,
      method: "PATCH",
      body: formData,
      invalidatesTags: [{ type: "events" }]
    })
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Event updated successfully!",
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
    let htmlDescription = "";
    try {
      const parsedState = JSON.parse(data.details);
      htmlDescription = editorStateToHTML(parsedState);
      console.log(htmlDescription);

    } catch (err) {
      console.error("Failed to parse Lexical state", err);
    }
    formData.append("title", data.title);
    formData.append("details", htmlDescription);

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
      invalidatesTags: [{ type: "updates" }]
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


  const handleEditEventUpdate = (data: z.infer<typeof updateSchema>) => {
    const formData = new FormData();
    let htmlDescription = "";
    try {
      const parsedState = JSON.parse(data.details);
      htmlDescription = editorStateToHTML(parsedState);
      console.log(htmlDescription);

    } catch (err) {
      console.error("Failed to parse Lexical state", err);
    }
    formData.append("title", data.title);
    formData.append("details", htmlDescription);

    // Append the image file
    if (data.image_file) {
      formData.append("image_file", data.image_file);
    }
    // Trigger the mutation with FormData
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    postUpdate({
      url: `/admin/updates/${updateId}/`,
      method: "PATCH",
      body: formData,
      invalidatesTags: [{ type: "updates" }]
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


  const handleDeleteEventUpdate = () => {
    if (!updateId) return;
    postUpdate({
      url: `/admin/updates/${updateId}/`,
      method: "DELETE",
      invalidatesTags: [{ type: "updates" }]
    }).unwrap().then(() => {
      toast({
        title: "Success",
        description: "Update deleted successfully!",
      });
      resetUpdate();
      setUpdateId("");
    }).catch((error) => {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete Update.",
        variant: "destructive",
      });
    });
  }


  const handleDeleteVideo = () => {
    if (!videoId) return;
    postUpdate({
      url: `/admin/videos/${videoId}/`,
      method: "DELETE",
      invalidatesTags: [{ type: "videos" }]
    }).unwrap().then(() => {
      toast({
        title: "Success",
        description: "Video deleted successfully!",
      });
      resetUpdate();
      setUpdateId("");
    }).catch((error) => {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete Video.",
        variant: "destructive",
      });
    });
  }


  function safeKey(filename: string) {
    return filename
      .normalize("NFKD") // normalize unicode
      .replace(/[^\x00-\x7F]/g, "") // strip non-ASCII
      .replace(/\s+/g, "_"); // replace spaces
  }

  const handleUploadVideo = async (data: z.infer<typeof uploadVideoSchema>) => {
    try {
      setUploading(true);

      const file = data.video_file;
      if (!file) {
        toast({
          title: "Error",
          description: "No video file selected.",
          variant: "destructive",
        });
        return;
      }

      // 1. Initiate multipart upload
      const initRes = await postUpdate({
        url: `/admin/videos/multipart/initiate`,
        method: "POST",
        body: {
          filename: safeKey(file.name),
          content_type: file.type || "video/mp4",
        },
      }).unwrap();

      const { upload_id, key } = initRes;
      if (!upload_id || !key) {
        throw new Error("Failed to initiate multipart upload. Missing upload_id or key.");
      }

      // 2. Upload file in chunks
      const parts = await uploadVideoMultipart(file, key, upload_id, postUpdate);

      if (!parts.length) {
        throw new Error("No parts uploaded — upload failed.");
      }

      // 3. Finalize upload with metadata
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      data.category_ids.forEach((id) =>
        formData.append("category_ids", String(id))
      );
      if (data.thumbnail) {
        formData.append("thumbnail", data.thumbnail);
      }
      formData.append("key", key);
      formData.append("upload_id", upload_id);
      formData.append("parts", JSON.stringify(parts));

      await postUpdate({
        url: `/admin/videos`,
        method: "POST",
        body: formData,
      }).unwrap();

      toast({
        title: "Success",
        description: "Video posted successfully!",
      });
      resetVideo();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to post video.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };


  async function uploadVideoMultipart(
    file: { size: number; slice: (start: number, end: number) => Blob },
    key: string,
    uploadId: string,
    postUpdate: ReturnType<typeof useGenericMutationMutation>[0]
  ) {
    const chunkSize = 5 * 1024 * 1024; // 5MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    const parts: { ETag: string; PartNumber: number }[] = [];
    const CONCURRENCY = 4;

    async function uploadPart(partNumber: number, blob: Blob) {
      try {

        // Step 2a. Get presigned URL for this chunk
        const { url } = await postUpdate({
          url: `/admin/videos/multipart/sign-part`,
          method: "POST",
          body: { key, upload_id: uploadId, part_number: partNumber },
        }).unwrap();

        if (!url) throw new Error(`No presigned URL for part ${partNumber}`);

        // Step 2b. Upload directly to S3/R2
        const uploadRes = await fetch(url, {
          method: "PUT",
          body: blob,
        });

        if (!uploadRes.ok) {
          const text = await uploadRes.text().catch(() => "");
          throw new Error(
            `Part ${partNumber} upload failed: ${uploadRes.status} ${uploadRes.statusText} ${text}`
          );
        }

        const etag = uploadRes.headers.get("ETag");
        if (!etag) throw new Error(`Missing ETag for part ${partNumber}`);

        return { ETag: etag.replace(/"/g, ""), PartNumber: partNumber };
      } finally {
        // reset uploading state after this part finishes (success or fail)
      }
    }

    // Upload in parallel batches
    for (let i = 0; i < totalChunks; i += CONCURRENCY) {
      const batch: Promise<{ ETag: string; PartNumber: number }>[] = [];
      for (let j = 0; j < CONCURRENCY && i + j < totalChunks; j++) {
        const partNumber = i + j + 1;
        const start = (i + j) * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const blob = file.slice(start, end);
        batch.push(uploadPart(partNumber, blob));
      }

      const results = await Promise.all(batch); // throws if any part fails
      parts.push(...results);
    }

    console.log("✅ All parts uploaded:", parts);
    return parts;
  }


  const handleEndEvent = (eventId: string) => {
    endEvent({
      url: `/admin/events/${eventId}`,
      method: "DELETE",
      invalidatesTags: [{ type: "events" }]
    }).unwrap().then(() => {
      toast({
        title: "Success",
        description: "Event Ended",
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

        <Tabs defaultValue="events" className="w-full">

          <div className="mb-4 overflow-x-auto no-scrollbar w-full">
            <TabsList className="lg:grid lg:grid-cols-5 ">
              <TabsTrigger value="events" className="flex items-center cursor-pointer  w-full">
                <RadioIcon className="w-4 h-4" />
                <span>Add Blog</span>
              </TabsTrigger>

              <TabsTrigger value="updates" className="flex items-center space-x-2 cursor-pointer w-full">
                <PlusIcon className="w-4 h-4" />
                <span>Live Updates</span>
              </TabsTrigger>

              <TabsTrigger value="videos" className="flex items-center space-x-2 cursor-pointer w-full">
                <TvIcon className="w-4 h-4" />
                <span>Post Videos</span>
              </TabsTrigger>

              <TabsTrigger value="analytics" className="flex items-center space-x-2 cursor-pointer w-full">
                <EyeIcon className="w-4 h-4" />
                <span>View Analytics</span>
              </TabsTrigger>

              <TabsTrigger value="editEvent" className="flex items-center space-x-2 cursor-pointer w-full ">
                <RadioIcon className="w-4 h-4" />
                <span>Edit Event & Updates</span>
              </TabsTrigger>
            </TabsList>
          </div>


          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Create Event */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Blog Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmitEvent(handleCreateEvent)} className="space-y-4">
                    <div>
                      <Label htmlFor="event-title">Heading</Label>
                      <Input id="event-title" {...registerEvent("title")} className="" />
                      {eventErrors.title && <p className="text-sm text-red-500">{eventErrors.title.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="event-description">Body</Label>
                      {/* <Textarea id="event-description" {...registerEvent("description")} /> */}
                      <Editor
                        editorSerializedState={
                          watchEvent("description")
                            ? JSON.parse(watchEvent("description"))
                            : undefined
                        }
                        onSerializedChange={(state: any) => {
                          setEventValue("description", JSON.stringify(state), { shouldValidate: true });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_file">Cover Image</Label>
                      <Input
                        id="image_file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEventValue("image_file", file, { shouldValidate: true });
                          }
                        }}
                      />
                      {eventErrors.image_file && (
                        <p className="text-red-500 text-sm">{eventErrors.image_file.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="cursor-pointer bg-accent" disabled={isLoading}>Post Blog</Button>
                  </form>
                </CardContent>
              </Card>

              {/* Active Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Blogs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeEvents?.map((event: any) => (
                      <div key={event.id} className="flex cursor-pointer items-center justify-between p-4 border border-border rounded-lg" >
                        <div>
                          <h3 className="font-semibold text-foreground cursor-pointer" onClick={() => router.push("/")}>{event.title}</h3>
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
            <div className="grid grid-cols-1 gap-6">
              {/* Create Update */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Live Update</CardTitle>
                </CardHeader>
                <CardContent >
                  <form onSubmit={handleSubmitUpdate(handleCreateUpdate)} className="space-y-4">
                    <div>
                      <Label htmlFor="eventId">Select Blog Post</Label>
                      <select
                        id="eventId"
                        // {...registerUpdate("eventId", { required: true })}
                        onChange={(e) => { setEventId(e.target.value) }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="">Choose a Live Post...</option>
                        {activeEvents?.map((event: any) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                      {updateErrors.title && <p className="text-red-500 text-sm">Event is required</p>}
                    </div>

                    <div>
                      <Label htmlFor="update.title">Title of the Update</Label>
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
                      {/* <Textarea
                        id="update.details"
                        {...registerUpdate("details")}
                        placeholder="Enter update details"
                        rows={4}
                      /> */}
                      <Editor
                        editorSerializedState={
                          watch("details")
                            ? JSON.parse(watch("details"))
                            : undefined
                        }
                        onSerializedChange={(state: any) => {
                          setValue("details", JSON.stringify(state), { shouldValidate: true });
                        }}
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
                    {(recentUpdates || []).map((update: any) => (
                      <div key={update.id} className="p-4 border border-border rounded-lg cursor-pointer" onClick={() => router.push(`/${update.id}`)}>
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
                    <Popover>
                      <Label htmlFor="category">Choose Video Categories</Label>
                      <PopoverTrigger
                        id="category"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-left"
                      >

                        {watchVideo("category_ids")?.length > 0
                          ? `${watchVideo("category_ids").length} selected`
                          : "Select Video Categories"}
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandGroup>
                            {loadingCategories ? (
                              <div className="p-4 text-sm text-muted-foreground">
                                Loading categories...
                              </div>
                            ) : (
                              videoCategories?.map((cat: any) => {
                                const selected = watchVideo("category_ids")?.includes(cat.id);

                                return (
                                  <CommandItem
                                    key={cat.id}
                                    onSelect={() => {
                                      const current = watchVideo("category_ids") || [];
                                      const updated = selected
                                        ? current.filter((id) => id !== cat.id)
                                        : [...current, cat.id];

                                      setValueVideo("category_ids", updated, {
                                        shouldValidate: true,
                                      });
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-4 h-4 border border-border rounded-sm flex items-center justify-center ${selected ? "bg-accent text-white" : "bg-background"
                                          }`}
                                      >
                                        {selected && <Check className="w-3 h-3" />}
                                      </span>
                                      {cat.name}
                                    </div>
                                  </CommandItem>
                                );
                              })
                            )}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                      {videoErrors.category_ids && (
                        <p className="text-red-500 text-sm mt-1">
                          {videoErrors.category_ids.message}
                        </p>
                      )}
                    </Popover>

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
                      <Label htmlFor="video-description">Video Description</Label>
                      <Textarea
                        id="video-description"
                        placeholder="Enter video Description"
                        {...registerVideo("description")}
                      />
                      {videoErrors.description && (
                        <p className="text-red-500 text-sm mt-1">{videoErrors.description?.message}</p>
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
                      {videoErrors?.thumbnail && (
                        <p className="text-red-500 text-sm mt-1">{videoErrors.thumbnail.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={uploading || loading}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
                    >
                      {/* Upload Video */}
                      {uploading || loading ? "Posting Video" : "Upload Video"}
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
                    {recentVideos?.map((video: any) => (
                      <div key={video.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground text-sm">{video.title}</h3>
                          {/* <Badge variant="secondary">{video.status}</Badge> */}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <EyeIcon className="w-3 h-3 mr-1" />
                            {video.views}
                          </div>
                          <div className="flex items-center">
                            <HeartIcon className="w-3 h-3 mr-1" />
                            {video.likes.length}
                          </div>
                          <div className="flex items-center">
                            <MessageCircleIcon className="w-3 h-3 mr-1" />
                            {video.comments.length}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delete Video</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmitEvent(handleUpdateEvent)} className="space-y-4">
                    <Label htmlFor="eventId">Delete Video</Label>
                    <select
                      id="eventId"
                      // {...registerUpdate("eventId", { required: true })}
                      onChange={(e) => { setVideoId(e.target.value) }}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                      <option value="">Choose a Video Title.</option>
                      {mockVideos?.map((event: any) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>

                    <Button className="cursor-pointer bg-accent" disabled={isLoading} onClick={handleDeleteVideo}>Delete Video</Button>
                  </form>
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

          {/* Edit Events & Updates */}
          <TabsContent value="editEvent" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Edit Event */}
              <Card>
                <CardHeader>
                  <CardTitle>Edit Blog Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmitEvent(handleUpdateEvent)} className="space-y-4">
                    <Label htmlFor="eventId">Select Blog Post</Label>
                    <select
                      id="eventId"
                      // {...registerUpdate("eventId", { required: true })}
                      onChange={(e) => { handleEventSelect(e.target.value) }}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                      <option value="">Choose a Live Post...</option>
                      {activeEvents?.map((event: any) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>

                    <div>
                      <Label htmlFor="event-title">Heading</Label>
                      <Input id="event-title" {...registerEvent("title")} className="" />
                      {eventErrors.title && <p className="text-sm text-red-500">{eventErrors.title.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="event-description">Body</Label>
                      <Editor
                        editorSerializedState={
                          watchEvent("description")
                            ? JSON.parse(watchEvent("description"))
                            : undefined
                        }
                        onSerializedChange={(state: any) => {
                          setEventValue("description", JSON.stringify(state), { shouldValidate: true });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_file">Cover Image</Label>
                      <Input
                        id="image_file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEventValue("image_file", file, { shouldValidate: true });
                          }
                        }}
                      />
                      {eventErrors.image_file && (
                        <p className="text-red-500 text-sm">{eventErrors.image_file.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="cursor-pointer bg-accent" disabled={isLoading}>Edit Blog</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Edit Live Update</CardTitle>
                </CardHeader>
                <CardContent >
                  <form onSubmit={handleSubmitUpdate(handleEditEventUpdate)} className="space-y-4">
                    <div>
                      <Label htmlFor="eventId">Select Blog Post</Label>
                      <select
                        id="eventId"
                        // {...registerUpdate("eventId", { required: true })}
                        onChange={(e) => { setEventId(e.target.value) }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="">Choose a Live Post...</option>
                        {activeEvents?.map((event: any) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                      {eventErrors.title && <p className="text-red-500 text-sm">Event is required</p>}
                    </div>

                    <div>
                      <Label htmlFor="eventId">Select Blog Update</Label>
                      <select
                        id="eventId"
                        // {...registerUpdate("eventId", { required: true })}
                        onChange={(e) => { handleUpdateSelect(e.target.value) }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="">Choose a Live Update...</option>
                        {allEventUpdates?.map((event: any) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                      {updateErrors.title && <p className="text-red-500 text-sm">Update is required</p>}
                    </div>

                    <div>
                      <Label htmlFor="update.title">Title of the Update</Label>
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
                      <Editor
                        editorSerializedState={
                          watch("details")
                            ? JSON.parse(watch("details"))
                            : undefined
                        }
                        onSerializedChange={(state: any) => {
                          setValue("details", JSON.stringify(state), { shouldValidate: true });
                        }}
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
                    <div className="flex  gap-2 items-center">
                      <Button
                        type="submit"
                        className="w-full border border-accent bg-white text-accent hover:bg-accent/30 cursor-pointer"
                        disabled={loading}
                      >
                        {loading ? "Edit Update" : "Edit Update"}
                      </Button>
                      <Button onClick={handleDeleteEventUpdate} variant="destructive" className="w-full bg-accent text-accent-foreground hover:bg- cursor-pointer">
                        Delete Update
                      </Button>
                    </div>

                  </form>
                </CardContent>
              </Card>

            </div>
          </TabsContent>


        </Tabs>
        <LoadingModal open={uploading || loading} />
      </div>
    </div >
  );
};

export default Admin;