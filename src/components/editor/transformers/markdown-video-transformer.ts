import { TextMatchTransformer } from "@lexical/markdown"

import {
  $createVideoNode,
  $isVideoNode,
  VideoNode,
} from "@/components/editor/nodes/video-node"

export const VIDEO: TextMatchTransformer = {
  dependencies: [VideoNode],
  export: (node) => {
    if (!$isVideoNode(node)) {
      return null
    }

    return `<iframe src="${node.getSrc()}" title="${node.getAltText()}" width="800" height="450" frameborder="0" allowfullscreen="true" allow="autoplay; fullscreen; picture-in-picture"></iframe>`
  },
  importRegExp: /<iframe[^>]*src="([^"]*)"[^>]*>/,
  regExp: /<iframe[^>]*src="([^"]*)"[^>]*>$/,
  replace: (textNode, match) => {
    const [, src] = match
    const videoNode = $createVideoNode({
      altText: "Video",
      maxWidth: 800,
      src,
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
    })
    textNode.replace(videoNode)
  },
  trigger: ">",
  type: "text-match",
}
