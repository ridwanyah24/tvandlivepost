import * as React from "react"
import { JSX, Suspense, useCallback, useEffect, useRef, useState } from "react"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { useLexicalEditable } from "@lexical/react/useLexicalEditable"
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection"
import { mergeRegister } from "@lexical/utils"
import type {
  BaseSelection,
  LexicalCommand,
  LexicalEditor,
  NodeKey,
} from "lexical"
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  ParagraphNode,
  RootNode,
  SELECTION_CHANGE_COMMAND,
  TextNode,
} from "lexical"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { ImageResizer } from "@/components/editor/editor-ui/image-resizer"
import { $isVideoNode } from "@/components/editor/nodes/video-node"

const videoCache = new Set()

export const RIGHT_CLICK_VIDEO_COMMAND: LexicalCommand<MouseEvent> =
  createCommand("RIGHT_CLICK_VIDEO_COMMAND")

function useSuspenseVideo(src: string) {
  if (!videoCache.has(src)) {
    throw new Promise((resolve) => {
      const video = document.createElement("video")
      video.src = src
      video.onloadeddata = () => {
        videoCache.add(src)
        resolve(null)
      }
      video.onerror = () => {
        videoCache.add(src)
        resolve(null) // Still resolve even on error to prevent infinite loading
      }
      // Add timeout to prevent infinite loading
      setTimeout(() => {
        if (!videoCache.has(src)) {
          videoCache.add(src)
          resolve(null)
        }
      }, 5000)
    })
  }
}

function LazyVideo({
  altText,
  className,
  videoRef,
  src,
  width,
  height,
  maxWidth,
  controls,
  autoplay,
  loop,
  muted,
  onError,
}: {
  altText: string
  className: string | null
  height: "inherit" | number
  videoRef: { current: null | HTMLVideoElement }
  maxWidth: number
  src: string
  width: "inherit" | number
  controls: boolean
  autoplay: boolean
  loop: boolean
  muted: boolean
  onError: () => void
}): JSX.Element {
  useSuspenseVideo(src)
  return (
    <video
      className={className || undefined}
      src={src}
      ref={videoRef}
      style={{
        height,
        maxWidth,
        width,
      }}
      controls={controls}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      onError={(e) => {
        console.error("Video load error:", e, "Source:", src)
        onError()
      }}
      onLoadStart={() => console.log("Video loading started:", src)}
      onCanPlay={() => console.log("Video can play:", src)}
      draggable="false"
    />
  )
}

function BrokenVideo({ src }: { src: string }): JSX.Element {
  const isUrl = src.startsWith('http') || src.startsWith('https')
  
  return (
    <div
      style={{
        height: 200,
        width: 200,
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px dashed #ccc",
        color: "#666",
        flexDirection: "column",
        padding: "10px",
      }}
    >
      <div>Video Error</div>
      <div style={{ fontSize: "10px", marginTop: "5px", wordBreak: "break-all" }}>
        {src.substring(0, 50)}...
      </div>
      {isUrl && (
        <div style={{ fontSize: "8px", marginTop: "5px", textAlign: "center" }}>
          URL videos may not work in editor preview.<br/>
          They will render as iframe in final output.
        </div>
      )}
    </div>
  )
}

export default function VideoComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
  showCaption,
  caption,
  captionsEnabled,
  controls,
  autoplay,
  loop,
  muted,
}: {
  altText: string
  caption: LexicalEditor
  height: "inherit" | number
  maxWidth: number
  nodeKey: NodeKey
  resizable: boolean
  showCaption: boolean
  src: string
  width: "inherit" | number
  captionsEnabled: boolean
  controls: boolean
  autoplay: boolean
  loop: boolean
  muted: boolean
}): JSX.Element {
  const videoRef = useRef<null | HTMLVideoElement>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey)
  const [isResizing, setIsResizing] = useState<boolean>(false)
  const { isCollabActive } = useCollaborationContext()
  const [editor] = useLexicalComposerContext()
  const [selection, setSelection] = useState<BaseSelection | null>(null)
  const activeEditorRef = useRef<LexicalEditor | null>(null)
  const [isLoadError, setIsLoadError] = useState<boolean>(false)
  const isEditable = useLexicalEditable()

  const $onDelete = useCallback(
    (payload: KeyboardEvent) => {
      const deleteSelection = $getSelection()
      if (isSelected && $isNodeSelection(deleteSelection)) {
        const event: KeyboardEvent = payload
        event.preventDefault()
        editor.update(() => {
          deleteSelection.getNodes().forEach((node) => {
            if ($isVideoNode(node)) {
              node.remove()
            }
          })
        })
      }
      return false
    },
    [editor, isSelected]
  )

  const $onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection()
      const buttonElem = buttonRef.current
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        if (showCaption) {
          // Move focus into nested editor
          $setSelection(null)
          event.preventDefault()
          caption.focus()
          return true
        } else if (
          buttonElem !== null &&
          buttonElem !== document.activeElement
        ) {
          event.preventDefault()
          buttonElem.focus()
          return true
        }
      }
      return false
    },
    [caption, isSelected, showCaption]
  )

  const $onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (
        activeEditorRef.current === caption ||
        buttonRef.current === event.target
      ) {
        $setSelection(null)
        editor.update(() => {
          setSelected(true)
          const parentRootElement = editor.getRootElement()
          if (parentRootElement !== null) {
            parentRootElement.focus()
          }
        })
        return true
      }
      return false
    },
    [caption, editor, setSelected]
  )

  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload

      if (isResizing) {
        return true
      }
      if (event.target === videoRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected)
        } else {
          clearSelection()
          setSelected(true)
        }
        return true
      }

      return false
    },
    [isResizing, isSelected, setSelected, clearSelection]
  )

  const onRightClick = useCallback(
    (event: MouseEvent): void => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection()
        const domElement = event.target as HTMLElement
        if (
          domElement.tagName === "VIDEO" &&
          $isRangeSelection(latestSelection) &&
          latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(RIGHT_CLICK_VIDEO_COMMAND, event as MouseEvent)
        }
      })
    },
    [editor]
  )

  useEffect(() => {
    let isMounted = true
    const rootElement = editor.getRootElement()
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()))
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(
        RIGHT_CLICK_VIDEO_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === videoRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
            event.preventDefault()
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        $onEscape,
        COMMAND_PRIORITY_LOW
      )
    )

    rootElement?.addEventListener("contextmenu", onRightClick)

    return () => {
      isMounted = false
      unregister()
      rootElement?.removeEventListener("contextmenu", onRightClick)
    }
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    $onDelete,
    $onEnter,
    $onEscape,
    onClick,
    onRightClick,
    setSelected,
  ])

  const setShowCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isVideoNode(node)) {
        node.setShowCaption(true)
      }
    })
  }

  const onResizeEnd = (
    nextWidth: "inherit" | number,
    nextHeight: "inherit" | number
  ) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false)
    }, 200)

    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isVideoNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight)
      }
    })
  }

  const onResizeStart = () => {
    setIsResizing(true)
  }

  const draggable = isSelected && $isNodeSelection(selection) && !isResizing
  const isFocused = (isSelected || isResizing) && isEditable
  const isUrl = src.startsWith('http') || src.startsWith('https')
  
  return (
    <Suspense fallback={<div>Loading video...</div>}>
      <>
        <div draggable={draggable}>
          {isLoadError ? (
            <BrokenVideo src={src} />
          ) : isUrl ? (
            // For URL videos, show a preview with iframe
            <div
              className={`max-w-full cursor-default ${
                isFocused
                  ? `${$isNodeSelection(selection) ? "draggable cursor-grab active:cursor-grabbing" : ""} focused ring-primary ring-2 ring-offset-2`
                  : null
              }`}
              style={{
                height: height === "inherit" ? 200 : height,
                width: width === "inherit" ? 400 : width,
                maxWidth,
                border: "2px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9f9f9",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
                Video URL
              </div>
              <div style={{ fontSize: "10px", wordBreak: "break-all", textAlign: "center" }}>
                {src}
              </div>
              <div style={{ fontSize: "8px", marginTop: "5px", color: "#666" }}>
                Will render as iframe in output
              </div>
            </div>
          ) : (
            <LazyVideo
              className={`max-w-full cursor-default ${
                isFocused
                  ? `${$isNodeSelection(selection) ? "draggable cursor-grab active:cursor-grabbing" : ""} focused ring-primary ring-2 ring-offset-2`
                  : null
              }`}
              src={src}
              altText={altText}
              videoRef={videoRef}
              width={width}
              height={height}
              maxWidth={maxWidth}
              controls={controls}
              autoplay={autoplay}
              loop={loop}
              muted={muted}
              onError={() => setIsLoadError(true)}
            />
          )}
        </div>

        {showCaption && (
          <div className="video-caption-container absolute right-0 bottom-1 left-0 m-0 block min-w-[100px] overflow-hidden border-t bg-white/90 p-0">
            <LexicalNestedComposer
              initialEditor={caption}
              initialNodes={[RootNode, TextNode, ParagraphNode]}
            >
              <AutoFocusPlugin />
              <HistoryPlugin />
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="VideoNode__contentEditable user-select-text word-break-break-word caret-primary relative block min-h-5 w-[calc(100%-20px)] cursor-text resize-none border-0 p-2.5 text-sm whitespace-pre-wrap outline-none"
                    placeholderClassName="VideoNode__placeholder text-sm text-muted-foreground overflow-hidden absolute top-2.5 left-2.5 pointer-events-none text-ellipsis user-select-none whitespace-nowrap inline-block"
                    placeholder="Enter a caption..."
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </LexicalNestedComposer>
          </div>
        )}
        {resizable && $isNodeSelection(selection) && isFocused && (
          <ImageResizer
            showCaption={showCaption}
            setShowCaption={setShowCaption}
            editor={editor}
            buttonRef={buttonRef}
            imageRef={videoRef}
            maxWidth={maxWidth}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
            captionsEnabled={!isLoadError && captionsEnabled}
          />
        )}
      </>
    </Suspense>
  )
}
