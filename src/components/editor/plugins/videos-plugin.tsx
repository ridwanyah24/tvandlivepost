"use client"

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { JSX, useEffect, useRef, useState } from "react"
import * as React from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils"
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
} from "lexical"

import {
  $createVideoNode,
  $isVideoNode,
  VideoNode,
  VideoPayload,
} from "@/components/editor/nodes/video-node"
import { CAN_USE_DOM } from "@/components/editor/shared/can-use-dom"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

export type InsertVideoPayload = Readonly<VideoPayload>

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null

export const INSERT_VIDEO_COMMAND: LexicalCommand<InsertVideoPayload> =
  createCommand("INSERT_VIDEO_COMMAND")

export function InsertVideoUriDialogBody({
  onClick,
}: {
  onClick: (payload: InsertVideoPayload) => void
}) {
  const [src, setSrc] = useState("")
  const [altText, setAltText] = useState("")
  const [controls, setControls] = useState(true)
  const [autoplay, setAutoplay] = useState(false)
  const [loop, setLoop] = useState(false)
  const [muted, setMuted] = useState(false)

  const isDisabled = src === ""

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="video-url">Video URL</Label>
        <Input
          id="video-url"
          placeholder="i.e. https://example.com/video.mp4"
          onChange={(e) => setSrc(e.target.value)}
          value={src}
          data-test-id="video-modal-url-input"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="alt-text">Alt Text</Label>
        <Input
          id="alt-text"
          placeholder="Video description"
          onChange={(e) => setAltText(e.target.value)}
          value={altText}
          data-test-id="video-modal-alt-text-input"
        />
      </div>
      <div className="grid gap-2">
        <Label>Video Options</Label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="controls"
              checked={controls}
              onCheckedChange={(checked) => setControls(checked as boolean)}
            />
            <Label htmlFor="controls">Show Controls</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoplay"
              checked={autoplay}
              onCheckedChange={(checked) => setAutoplay(checked as boolean)}
            />
            <Label htmlFor="autoplay">Autoplay</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="loop"
              checked={loop}
              onCheckedChange={(checked) => setLoop(checked as boolean)}
            />
            <Label htmlFor="loop">Loop</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="muted"
              checked={muted}
              onCheckedChange={(checked) => setMuted(checked as boolean)}
            />
            <Label htmlFor="muted">Muted</Label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={isDisabled}
          onClick={() => onClick({ altText, src, controls, autoplay, loop, muted })}
          data-test-id="video-modal-confirm-btn"
        >
          Confirm
        </Button>
      </DialogFooter>
    </div>
  )
}

export function InsertVideoUploadedDialogBody({
  onClick,
}: {
  onClick: (payload: InsertVideoPayload) => void
}) {
  const [src, setSrc] = useState("")
  const [altText, setAltText] = useState("")
  const [controls, setControls] = useState(true)
  const [autoplay, setAutoplay] = useState(false)
  const [loop, setLoop] = useState(false)
  const [muted, setMuted] = useState(false)

  const isDisabled = src === ""

  const loadVideo = (files: FileList | null) => {
    const reader = new FileReader()
    reader.onload = function () {
      if (typeof reader.result === "string") {
        setSrc(reader.result)
      }
      return ""
    }
    if (files !== null) {
      reader.readAsDataURL(files[0])
    }
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="video-upload">Video Upload</Label>
        <Input
          id="video-upload"
          type="file"
          onChange={(e) => loadVideo(e.target.files)}
          accept="video/*"
          data-test-id="video-modal-file-upload"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="alt-text">Alt Text</Label>
        <Input
          id="alt-text"
          placeholder="Video description"
          onChange={(e) => setAltText(e.target.value)}
          value={altText}
          data-test-id="video-modal-alt-text-input"
        />
      </div>
      <div className="grid gap-2">
        <Label>Video Options</Label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="controls"
              checked={controls}
              onCheckedChange={(checked) => setControls(checked as boolean)}
            />
            <Label htmlFor="controls">Show Controls</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoplay"
              checked={autoplay}
              onCheckedChange={(checked) => setAutoplay(checked as boolean)}
            />
            <Label htmlFor="autoplay">Autoplay</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="loop"
              checked={loop}
              onCheckedChange={(checked) => setLoop(checked as boolean)}
            />
            <Label htmlFor="loop">Loop</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="muted"
              checked={muted}
              onCheckedChange={(checked) => setMuted(checked as boolean)}
            />
            <Label htmlFor="muted">Muted</Label>
          </div>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isDisabled}
        onClick={() => onClick({ altText, src, controls, autoplay, loop, muted })}
        data-test-id="video-modal-file-upload-btn"
      >
        Confirm
      </Button>
    </div>
  )
}

export function InsertVideoDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor
  onClose: () => void
}): JSX.Element {
  const hasModifier = useRef(false)

  useEffect(() => {
    hasModifier.current = false
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey
    }
    document.addEventListener("keydown", handler)
    return () => {
      document.removeEventListener("keydown", handler)
    }
  }, [activeEditor])

  const onClick = (payload: InsertVideoPayload) => {
    activeEditor.dispatchCommand(INSERT_VIDEO_COMMAND, payload)
    onClose()
  }

  return (
    <Tabs defaultValue="url">
      <TabsList className="w-full">
        <TabsTrigger value="url" className="w-full">
          URL
        </TabsTrigger>
        <TabsTrigger value="file" className="w-full">
          File
        </TabsTrigger>
      </TabsList>
      <TabsContent value="url">
        <InsertVideoUriDialogBody onClick={onClick} />
      </TabsContent>
      <TabsContent value="file">
        <InsertVideoUploadedDialogBody onClick={onClick} />
      </TabsContent>
    </Tabs>
  )
}

export function VideosPlugin({
  captionsEnabled,
}: {
  captionsEnabled?: boolean
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([VideoNode])) {
      throw new Error("VideosPlugin: VideoNode not registered on editor")
    }

    return mergeRegister(
      editor.registerCommand<InsertVideoPayload>(
        INSERT_VIDEO_COMMAND,
        (payload) => {
          const videoNode = $createVideoNode(payload)
          $insertNodes([videoNode])
          if ($isRootOrShadowRoot(videoNode.getParentOrThrow())) {
            $wrapNodeInElement(videoNode, $createParagraphNode).selectEnd()
          }

          return true
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return $onDragStart(event)
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return $onDragover(event)
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return $onDrop(event, editor)
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  }, [captionsEnabled, editor])

  return null
}

function $onDragStart(event: DragEvent): boolean {
  const node = $getVideoNodeInSelection()
  if (!node) {
    return false
  }
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) {
    return false
  }
  const TRANSPARENT_IMAGE =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  const img = document.createElement("img")
  img.src = TRANSPARENT_IMAGE
  dataTransfer.setData("text/plain", "_")
  dataTransfer.setDragImage(img, 0, 0)
  dataTransfer.setData(
    "application/x-lexical-drag",
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
        controls: node.__controls,
        autoplay: node.__autoplay,
        loop: node.__loop,
        muted: node.__muted,
      },
      type: "video",
    })
  )

  return true
}

function $onDragover(event: DragEvent): boolean {
  const node = $getVideoNodeInSelection()
  if (!node) {
    return false
  }
  if (!canDropVideo(event)) {
    event.preventDefault()
  }
  return true
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = $getVideoNodeInSelection()
  if (!node) {
    return false
  }
  const data = getDragVideoData(event)
  if (!data) {
    return false
  }
  event.preventDefault()
  if (canDropVideo(event)) {
    const range = getDragSelection(event)
    node.remove()
    const rangeSelection = $createRangeSelection()
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range)
    }
    $setSelection(rangeSelection)
    editor.dispatchCommand(INSERT_VIDEO_COMMAND, data)
  }
  return true
}

function $getVideoNodeInSelection(): VideoNode | null {
  const selection = $getSelection()
  if (!$isNodeSelection(selection)) {
    return null
  }
  const nodes = selection.getNodes()
  const node = nodes[0]
  return $isVideoNode(node) ? node : null
}

function getDragVideoData(event: DragEvent): null | InsertVideoPayload {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag")
  if (!dragData) {
    return null
  }
  const { type, data } = JSON.parse(dragData)
  if (type !== "video") {
    return null
  }

  return data
}

declare global {
  interface DragEvent {
    rangeOffset?: number
    rangeParent?: Node
  }
}

function canDropVideo(event: DragEvent): boolean {
  const target = event.target
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest("code, span.editor-video") &&
    target.parentElement &&
    target.parentElement.closest("div.ContentEditable__root")
  )
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range
  const target = event.target as null | Element | Document
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
        ? (target as Document).defaultView
        : (target as Element).ownerDocument.defaultView
  const domSelection = getDOMSelection(targetWindow)
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY)
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0)
    range = domSelection.getRangeAt(0)
  } else {
    throw Error(`Cannot get the selection when dragging`)
  }

  return range
}
