import { $generateHtmlFromNodes } from "@lexical/html";
import { createEditor, EditorState } from "lexical";
import { TableNode, TableRowNode, TableCellNode } from "@lexical/table"; // add if you use tables
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode} from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HashtagNode } from "@lexical/hashtag";
import { InlineImageNode } from "@/components/editor/nodes/inline-image-node";
import { PageBreakNode } from "@/components/editor/nodes/page-break-node";
import { ImageNode } from "@/components/editor/nodes/image-node";
import { YouTubeNode } from "@/components/editor/nodes/embeds/youtube-node";
import { FigmaNode } from "@/components/editor/nodes/embeds/figma-node";
import { TweetNode } from "@/components/editor/nodes/embeds/tweet-node";
import { EquationNode } from "@/components/editor/nodes/equation-node";
import { CollapsibleContainerNode } from "@/components/editor/nodes/collapsible-container-node";
import { CollapsibleContentNode } from "@/components/editor/nodes/collapsible-content-node";
import { PollNode } from "@/components/editor/nodes/poll-node";

export function editorStateToHTML(editorStateJSON: any) {
  const editor = createEditor({
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableRowNode,
      TableCellNode,
      LinkNode, 
      HashtagNode,
      HorizontalRuleNode,
      InlineImageNode, // Add your custom node here,
      ImageNode, // Add your custom node here
      PageBreakNode,
      YouTubeNode,
      TweetNode,
      FigmaNode,
      EquationNode,
      CollapsibleContainerNode,
      CollapsibleContentNode,
      PollNode
    ]
  });

  try {
    const editorState: EditorState = editor.parseEditorState(editorStateJSON);
    let html = "";
    editor.setEditorState(editorState);

    editor.update(() => {
      html = $generateHtmlFromNodes(editor);
    });

    return html;
  } catch (err) {
    console.error("Failed to parse Lexical state", err);
    return "";
  }
}
