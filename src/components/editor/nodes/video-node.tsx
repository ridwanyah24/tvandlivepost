import * as React from "react"
import { JSX, Suspense } from "react"
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { $applyNodeReplacement, createEditor, DecoratorNode } from "lexical"

const VideoComponent = React.lazy(() => import("../editor-ui/video-component"))

export interface VideoPayload {
  altText: string
  caption?: LexicalEditor
  height?: number
  key?: NodeKey
  maxWidth?: number
  showCaption?: boolean
  src: string
  width?: number
  captionsEnabled?: boolean
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
}

function $convertVideoElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLIFrameElement) {
    const iframe = domNode as HTMLIFrameElement
    if (iframe.src.startsWith("file:///")) {
      return null
    }
    const { title: altText, src, width, height } = iframe
    const node = $createVideoNode({ 
      altText: altText || "Video", 
      height: height ? parseInt(height.toString()) : undefined, 
      src, 
      width: width ? parseInt(width.toString()) : undefined, 
      controls: true,
      autoplay: false,
      loop: false,
      muted: false
    })
    return { node }
  } else if (domNode instanceof HTMLVideoElement) {
    const video = domNode as HTMLVideoElement
    if (video.src.startsWith("file:///")) {
      return null
    }
    const { src, width, height, controls, autoplay, loop, muted } = video
    const altText = video.getAttribute('alt') || 'Video'
    const node = $createVideoNode({ 
      altText, 
      height, 
      src, 
      width, 
      controls: controls !== undefined,
      autoplay: autoplay !== undefined,
      loop: loop !== undefined,
      muted: muted !== undefined
    })
    return { node }
  }
  return null
}

export type SerializedVideoNode = Spread<
  {
    altText: string
    caption: SerializedEditor
    height?: number
    maxWidth: number
    showCaption: boolean
    src: string
    width?: number
    controls: boolean
    autoplay: boolean
    loop: boolean
    muted: boolean
  },
  SerializedLexicalNode
>

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __width: "inherit" | number
  __height: "inherit" | number
  __maxWidth: number
  __showCaption: boolean
  __caption: LexicalEditor
  __captionsEnabled: boolean
  __controls: boolean
  __autoplay: boolean
  __loop: boolean
  __muted: boolean

  static getType(): string {
    return "video"
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__captionsEnabled,
      node.__controls,
      node.__autoplay,
      node.__loop,
      node.__muted,
      node.__key
    )
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const { 
      altText, 
      height, 
      width, 
      maxWidth, 
      caption, 
      src, 
      showCaption,
      controls,
      autoplay,
      loop,
      muted
    } = serializedNode
    const node = $createVideoNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
      controls,
      autoplay,
      loop,
      muted,
    })
    const nestedEditor = node.__caption
    const editorState = nestedEditor.parseEditorState(caption.editorState)
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState)
    }
    return node
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("iframe")
    element.setAttribute("src", this.__src)
    element.setAttribute("title", this.__altText)
    element.setAttribute("width", this.__width.toString())
    element.setAttribute("height", this.__height.toString())
    element.setAttribute("frameborder", "0")
    element.setAttribute("allowfullscreen", "true")
    element.setAttribute("allow", "autoplay; fullscreen; picture-in-picture")
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (node: Node) => ({
        conversion: $convertVideoElement,
        priority: 0,
      }),
      video: (node: Node) => ({
        conversion: $convertVideoElement,
        priority: 0,
      }),
    }
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: "inherit" | number,
    height?: "inherit" | number,
    showCaption?: boolean,
    caption?: LexicalEditor,
    captionsEnabled?: boolean,
    controls?: boolean,
    autoplay?: boolean,
    loop?: boolean,
    muted?: boolean,
    key?: NodeKey
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__maxWidth = maxWidth
    this.__width = width || "inherit"
    this.__height = height || "inherit"
    this.__showCaption = showCaption || false
    this.__caption =
      caption ||
      createEditor({
        nodes: [],
      })
    this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined
    this.__controls = controls !== undefined ? controls : true
    this.__autoplay = autoplay !== undefined ? autoplay : false
    this.__loop = loop !== undefined ? loop : false
    this.__muted = muted !== undefined ? muted : false
  }

  exportJSON(): SerializedVideoNode {
    return {
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === "inherit" ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      type: "video",
      version: 1,
      width: this.__width === "inherit" ? 0 : this.__width,
      controls: this.__controls,
      autoplay: this.__autoplay,
      loop: this.__loop,
      muted: this.__muted,
    }
  }

  setWidthAndHeight(
    width: "inherit" | number,
    height: "inherit" | number
  ): void {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable()
    writable.__showCaption = showCaption
  }

  setControls(controls: boolean): void {
    const writable = this.getWritable()
    writable.__controls = controls
  }

  setAutoplay(autoplay: boolean): void {
    const writable = this.getWritable()
    writable.__autoplay = autoplay
  }

  setLoop(loop: boolean): void {
    const writable = this.getWritable()
    writable.__loop = loop
  }

  setMuted(muted: boolean): void {
    const writable = this.getWritable()
    writable.__muted = muted
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span")
    const theme = config.theme
    const className = theme.video
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  updateDOM(): false {
    return false
  }

  getSrc(): string {
    return this.__src
  }

  getAltText(): string {
    return this.__altText
  }

  getControls(): boolean {
    return this.__controls
  }

  getAutoplay(): boolean {
    return this.__autoplay
  }

  getLoop(): boolean {
    return this.__loop
  }

  getMuted(): boolean {
    return this.__muted
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <VideoComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          maxWidth={this.__maxWidth}
          nodeKey={this.getKey()}
          showCaption={this.__showCaption}
          caption={this.__caption}
          captionsEnabled={this.__captionsEnabled}
          controls={this.__controls}
          autoplay={this.__autoplay}
          loop={this.__loop}
          muted={this.__muted}
          resizable={true}
        />
      </Suspense>
    )
  }
}

export function $createVideoNode({
  altText,
  height,
  maxWidth = 500,
  captionsEnabled,
  src,
  width,
  showCaption,
  caption,
  controls = true,
  autoplay = false,
  loop = false,
  muted = false,
  key,
}: VideoPayload): VideoNode {
  return $applyNodeReplacement(
    new VideoNode(
      src,
      altText,
      maxWidth,
      width,
      height,
      showCaption,
      caption,
      captionsEnabled,
      controls,
      autoplay,
      loop,
      muted,
      key
    )
  )
}

export function $isVideoNode(
  node: LexicalNode | null | undefined
): node is VideoNode {
  return node instanceof VideoNode
}
