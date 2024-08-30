import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { AllRichTextOptions } from "./allRichTextOptions";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
// @ts-ignore
import * as Y from "yjs";
// @ts-ignore
import { WebrtcProvider } from "y-webrtc";
import React, { useState, useCallback, useEffect } from "react";

const colors = [
  "#958DF1",
  "#F98181",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D"
];
const names = [
  "Lea Thompson",
  "Cyndi Lauper",
  "Tom Cruise",
  "Madonna",
  "Jerry Hall",
  "Joan Collins",
  "Winona Ryder",
  "Christina Applegate",
  "Alyssa Milano",
  "Molly Ringwald",
  "Ally Sheedy",
  "Debbie Harry",
  "Olivia Newton-John",
  "Elton John",
  "Michael J. Fox",
  "Axl Rose",
  "Emilio Estevez",
  "Ralph Macchio",
  "Rob Lowe",
  "Jennifer Grey",
  "Mickey Rourke",
  "John Cusack",
  "Matthew Broderick",
  "Justine Bateman",
  "Lisa Bonet"
];

const getRandomElement = (list: any) =>
  list[Math.floor(Math.random() * list.length)];

const getRandomColor = () => getRandomElement(colors);
const getRandomName = () => getRandomElement(names);

const getInitialUser = () => {
  return {
    name: getRandomName(),
    color: getRandomColor()
  };
};

// A new Y document
const ydoc = new Y.Doc();
// Registered with a WebRTC provider
const provider = new WebrtcProvider("test5", ydoc, { signaling: ['wss://y-webrtc-ckynwnzncc.now.sh', 'ws://localhost:4444'] });
console.info('>>> ydoc provider >>>', {ydoc, provider})

// Textarea where user can write the text
export const TextEditor = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(getInitialUser);

  console.info('>>> textEditor info >>>', {users, currentUser})
  const setName = useCallback(() => {
    const name = (window.prompt("Name") || "").trim().substring(0, 32);

    if (name) {
      return setCurrentUser({ ...currentUser, name });
    }
  }, [currentUser]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Underline,
      Image,
      Placeholder,
      // CollaborationCursor.configure({
      //   provider: provider,
      //   // @ts-ignore
      //   onUpdate: (updatedUsers) => {
      //     // @ts-ignore
      //     setUsers(updatedUsers);
      //   },
      //   user: currentUser
      // }),
      Collaboration.configure({
        document: ydoc
      })
    ],
    autofocus: "end"
  });

  useEffect(() => {
    if (editor && currentUser) {
      editor.chain().focus?.()?.user?.(currentUser)?.run?.();
    }
  }, [editor, currentUser]);

  return (
    <>
      <div className="editor">
        <AllRichTextOptions editor={editor} />
        <EditorContent className="editor__content" editor={editor} />
        <div className="editor__footer">
          <div className={`editor__status editor__status--online`}>
            {users.length} user {users.length === 1 ? "" : "s"} online
          </div>
          <div className="editor__name">
            <button onClick={setName}>{currentUser.name}</button>
          </div>
        </div>
      </div>
    </>
  );
};
