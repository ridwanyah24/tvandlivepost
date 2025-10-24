"use client"

import { VideoIcon } from "lucide-react"

import { useToolbarContext } from "@/components/editor/context/toolbar-context"
import { InsertVideoDialog } from "@/components/editor/plugins/videos-plugin"
import { SelectItem } from "@/components/ui/select"

export function InsertVideo() {
  const { activeEditor, showModal } = useToolbarContext()

  return (
    <SelectItem
      value="video"
      onPointerUp={(e) => {
        showModal("Insert Video", (onClose) => (
          <InsertVideoDialog activeEditor={activeEditor} onClose={onClose} />
        ))
      }}
      className=""
    >
      <div className="flex items-center gap-1">
        <VideoIcon className="size-4" />
        <span>Video</span>
      </div>
    </SelectItem>
  )
}
