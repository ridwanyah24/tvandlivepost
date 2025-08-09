import { $generateHtmlFromNodes } from "@lexical/html";
import { createEditor, EditorState } from "lexical";
import { TableNode, TableRowNode, TableCellNode } from "@lexical/table"; // add if you use tables
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HashtagNode } from "@lexical/hashtag";

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
      // HeadingNode
      HorizontalRuleNode,
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
