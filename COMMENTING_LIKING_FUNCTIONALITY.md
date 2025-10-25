# Commenting and Liking Functionality Implementation

This document outlines the implementation of commenting and liking functionality for both the main event thread and individual update replies in the Twitter-thread-like interface.

## Features Implemented

### 1. **Like Functionality**
- **Main Event Thread**: Users can like the main event post
- **Update Replies**: Users can like individual update replies
- **Visual Feedback**: Like buttons show current like counts
- **Real-time Updates**: Like counts update immediately

### 2. **Comment Functionality**
- **Main Event Thread**: Users can comment on the main event
- **Update Replies**: Users can comment on individual updates
- **Comment Display**: Comments show with timestamps and user info
- **Overflow Handling**: Comments section has scrollable overflow

### 3. **Interactive UI**
- **Click to Comment**: Click comment icon to show/hide comments section
- **Add Comments**: Input field with send button for new comments
- **Comment Threading**: Each post/update has its own comment thread
- **Visual Indicators**: Clear visual separation between different comment sections

## Implementation Details

### 1. **State Management**

```typescript
const [newComment, setNewComment] = useState("");
const [postComment] = useGenericMutationMutation();
const [showComments, setShowComments] = useState(false);
const [commentingOn, setCommentingOn] = useState<string | null>(null);
const { data: eventComments } = useGetEventCommentsQuery({ id: selectedEvent?.id });
```

**State Variables:**
- `newComment`: Current comment text being typed
- `postComment`: Mutation function for posting comments
- `showComments`: Whether comments section is visible
- `commentingOn`: ID of the post/update being commented on
- `eventComments`: Fetched comments for the main event

### 2. **Like Functionality**

**Main Event Like:**
```typescript
const handleLike = () => {
  if (!selectedEvent?.id) return;
  
  const method = isLiked ? "DELETE" : "POST";
  const url = isLiked ? `/likes/${likeId}` : `/events/${selectedEvent?.id}/likes`;
  
  likeUpdate({ url, method, invalidatesTags: [...] })
    .unwrap()
    .then((res) => {
      // Update local state
    });
};
```

**Update Like:**
```typescript
const handleLikeUpdate = (updateId: string) => {
  likeUpdate({
    url: `/updates/${updateId}/likes`,
    method: "POST",
    invalidatesTags: [{ type: "event-updates" }],
  })
    .unwrap()
    .then((res) => {
      toast({ title: "Success", description: "Update liked!" });
    });
};
```

### 3. **Comment Functionality**

**Comment Handler:**
```typescript
const handleComment = (updateId: string) => {
  setCommentingOn(updateId);
  setShowComments(!showComments);
};
```

**Add Comment:**
```typescript
const handleAddComment = () => {
  if (newComment.trim() && commentingOn) {
    const url = commentingOn === 'event' 
      ? `/events/${selectedEvent?.id}/comments`
      : `/updates/${commentingOn}/comments`;
    
    postComment({
      url,
      method: "POST",
      body: { content: newComment.trim() },
      invalidatesTags: [{ type: "singleEvent" }, { type: "event-updates" }],
    })
      .unwrap()
      .then((res) => {
        setNewComment("");
        toast({ title: "Success", description: "Comment added successfully!" });
      });
  }
};
```

## UI Components

### 1. **Main Event Thread Comments**

**Comment Button:**
```tsx
<Button 
  variant="ghost" 
  size="sm" 
  className="flex items-center text-gray-500 hover:text-gray-800"
  onClick={() => handleComment('event')}
>
  <MessageCircleIcon className="w-4 h-4 mr-1" />
  {selectedEvent?.comments?.length || 0}
</Button>
```

**Comments Section:**
```tsx
{showComments && commentingOn === 'event' && (
  <div className="mt-6 border-t border-gray-200 pt-6">
    <h4 className="text-lg font-semibold text-gray-900 mb-4">Comments</h4>
    
    {/* Add Comment Form */}
    <div className="flex gap-2 items-center mb-4">
      <Input
        placeholder="Write a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="flex-1"
      />
      <Button 
        size="sm" 
        className="bg-accent hover:bg-red-700" 
        onClick={handleAddComment}
        disabled={!newComment.trim()}
      >
        <SendIcon className="w-4 h-4" />
      </Button>
    </div>

    {/* Comments List with Overflow */}
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {eventComments?.slice().reverse().map((comment: any) => (
        <div key={comment.id} className="p-3 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-800">{comment.content}</p>
          <span className="text-xs text-gray-500">{timeSince(comment.timestamp)}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

### 2. **Update Reply Comments**

**Comment Button:**
```tsx
<Button 
  variant="ghost" 
  size="sm" 
  className="flex items-center text-gray-500 hover:text-gray-800"
  onClick={() => handleComment(update.id)}
>
  <MessageCircleIcon className="w-4 h-4 mr-1" />
  {update.comments?.length || 0}
</Button>
```

**Comments Section:**
```tsx
{showComments && commentingOn === update.id && (
  <div className="mt-4 border-t border-gray-200 pt-4">
    <h5 className="text-sm font-semibold text-gray-900 mb-3">Comments</h5>
    
    {/* Add Comment Form */}
    <div className="flex gap-2 items-center mb-3">
      <Input
        placeholder="Write a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="flex-1 text-sm"
      />
      <Button 
        size="sm" 
        className="bg-accent hover:bg-red-700 text-xs" 
        onClick={handleAddComment}
        disabled={!newComment.trim()}
      >
        <SendIcon className="w-3 h-3" />
      </Button>
    </div>

    {/* Comments List with Overflow */}
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {update.comments?.slice().reverse().map((comment: any) => (
        <div key={comment.id} className="p-2 rounded bg-gray-50">
          <p className="text-xs text-gray-800">{comment.content}</p>
          <span className="text-xs text-gray-500">{timeSince(comment.timestamp)}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

## Overflow Handling

### 1. **Main Event Comments**
- **Max Height**: `max-h-64` (256px)
- **Overflow**: `overflow-y-auto`
- **Scrollbar**: Appears when content exceeds height

### 2. **Update Reply Comments**
- **Max Height**: `max-h-48` (192px)
- **Overflow**: `overflow-y-auto`
- **Scrollbar**: Appears when content exceeds height

### 3. **Responsive Design**
- **Mobile**: Smaller max heights for better mobile experience
- **Desktop**: Larger max heights for better desktop experience
- **Tablet**: Medium max heights for tablet experience

## User Experience Features

### 1. **Visual Feedback**
- **Like Buttons**: Show current like counts
- **Comment Buttons**: Show current comment counts
- **Loading States**: Disabled states during API calls
- **Success Messages**: Toast notifications for successful actions

### 2. **Interactive Elements**
- **Click to Toggle**: Click comment icon to show/hide comments
- **Form Validation**: Disable send button when input is empty
- **Real-time Updates**: Counts update immediately after actions

### 3. **Error Handling**
- **API Errors**: Toast notifications for failed actions
- **Network Issues**: Graceful handling of network failures
- **Validation**: Client-side validation before API calls

## API Integration

### 1. **Like Endpoints**
- **Event Like**: `POST /events/{id}/likes`
- **Update Like**: `POST /updates/{id}/likes`
- **Unlike**: `DELETE /likes/{likeId}`

### 2. **Comment Endpoints**
- **Event Comment**: `POST /events/{id}/comments`
- **Update Comment**: `POST /updates/{id}/comments`
- **Get Comments**: `GET /events/{id}/comments`

### 3. **Data Invalidation**
- **Cache Tags**: `[{ type: "singleEvent" }, { type: "event-updates" }]`
- **Real-time Updates**: Comments and likes update immediately
- **Optimistic Updates**: UI updates before API confirmation

## Styling and Design

### 1. **Comment Sections**
- **Border**: Top border to separate from main content
- **Padding**: Consistent padding for visual hierarchy
- **Background**: Light gray background for comment items
- **Typography**: Different font sizes for different elements

### 2. **Interactive Elements**
- **Hover States**: Color changes on hover
- **Active States**: Visual feedback for active elements
- **Disabled States**: Grayed out appearance for disabled buttons

### 3. **Responsive Design**
- **Mobile**: Smaller text and padding
- **Desktop**: Larger text and padding
- **Tablet**: Medium text and padding

## Future Enhancements

### 1. **Advanced Features**
- **Comment Replies**: Nested comment replies
- **Comment Editing**: Edit and delete comments
- **Comment Moderation**: Report inappropriate comments

### 2. **Real-time Features**
- **Live Comments**: Real-time comment updates
- **Typing Indicators**: Show when users are typing
- **Notification System**: Notify users of new comments

### 3. **Analytics**
- **Engagement Metrics**: Track likes and comments
- **User Behavior**: Monitor interaction patterns
- **Performance**: Optimize comment loading

## Conclusion

The commenting and liking functionality provides:

1. **Full Interaction**: Users can like and comment on both main events and updates
2. **Threaded Comments**: Each post has its own comment thread
3. **Overflow Handling**: Scrollable comment sections prevent layout issues
4. **Real-time Updates**: Immediate feedback for user actions
5. **Responsive Design**: Works well on all device sizes

The implementation creates an engaging, interactive experience that encourages user participation and builds community around live updates.
