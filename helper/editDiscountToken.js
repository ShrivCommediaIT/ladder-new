"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { 
  Bold, 
  Italic, 
  Heading2, 
  List, 
  Highlighter, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from "lucide-react";

export default function EditDiscountToken({ tempRulesList, onChange }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6 my-2 space-y-1',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6 my-2 space-y-1',
          },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'list_item'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline',
        },
      }),
      // Image.configure({
      //   inline: true,
      //   HTMLAttributes: {
      //     class: 'rounded-md max-w-full my-4 border border-slate-700',
      //   },
      // }),
    ],
    content: tempRulesList,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 text-slate-200 outline-none w-full bg-[#111827] rounded-b-lg',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  if (!editor || !mounted) return null;

  return (
    <div className="border border-slate-700 bg-slate-900 rounded-lg overflow-hidden shadow-lg transition-all focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-slate-600 bg-slate-800">

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive("bold") 
            ? "bg-cyan-500/20 text-cyan-400" 
            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive("italic") 
            ? "bg-cyan-500/20 text-cyan-400" 
            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-600 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive("heading", { level: 2 }) 
            ? "bg-cyan-500/20 text-cyan-400" 
            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive({ textAlign: 'left' }) 
            ? "bg-cyan-500/20 text-cyan-400" 
            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive({ textAlign: 'center' }) 
            ? "bg-cyan-500/20 text-cyan-400" 
            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive({ textAlign: 'right' }) 
            ? "bg-cyan-500/20 text-cyan-400" 
            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-600 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive("bulletList") 
            ? "bg-cyan-500/20 text-cyan-400" 
            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-600 mx-1"></div>

        {/* Text Color */}
        <div className="relative flex items-center p-1 rounded-md hover:bg-slate-700 gap-2 cursor-pointer group" title="Text Color">
          <input
            type="color"
            className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#ffffff'}
          />
        </div>

        {/* Highlight */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight({ color: "#a7f3d0" }).run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive("highlight") 
            ? "bg-emerald-500/20 text-emerald-400" 
            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title="Highlight Text"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-600 mx-1"></div>

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            } else if (url === "") {
              editor.chain().focus().unsetLink().run();
            }
          }}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive("link") 
            ? "bg-blue-500/20 text-blue-400" 
            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title="Insert/Edit Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Image */}
        {/* <button
          type="button"
          onClick={() => {
            const url = prompt("Enter Image URL");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="p-2 rounded-md transition-colors text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button> */}
      </div>

      {/* Editor Content Area */}
      <div 
        className="w-full bg-slate-900 cursor-text min-h-[150px]" 
        onClick={() => !editor.isFocused && editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}