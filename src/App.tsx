import { EditorContent, 
  // FloatingMenu, 
  useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';
import './tiptap.scss';

import GlobalDragHandle from './tiptap-extension-global-drag-handle';
import AutoJoiner from 'tiptap-extension-auto-joiner';

/**
 * 计算两个字符串表示的数字的和
 * @param a {string} 表示第一个加数的字符串
 * @param b {string} 表示第二个加数的字符串
 * @returns {number} 两个加数的和
 */
export const getSum = (a: string, b: string): number => {
  return parseInt(a) + parseInt(b);
};

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      GlobalDragHandle.configure({
        // dragHandleWidth: 20, // default

        // // The scrollTreshold specifies how close the user must drag an element to the edge of the lower/upper screen for automatic
        // // scrolling to take place. For example, scrollTreshold = 100 means that scrolling starts automatically when the user drags an
        // // element to a position that is max. 99px away from the edge of the screen
        // // You can set this to 0 to prevent auto scrolling caused by this extension
        // scrollTreshold: 100, // default
      }),
      AutoJoiner.configure({
        // elementsToJoin: ['bulletList', 'orderedList'], // default
      }),
    ],
    content: `
      <p>
        This is an example of a Medium-like editor. Enter a new line and some buttons will appear.
      </p>
      <p></p>
      <p></p>
    `,
  });

  const [isEditable, setIsEditable] = React.useState(true);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  return (
    <>
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={isEditable}
            onChange={() => setIsEditable(!isEditable)}
          />
          Editable
        </label>
      </div>
      {/* {editor && (
        <FloatingMenu
          editor={editor}
          tippyOptions={{ duration: 100, offset: [0, -72] }}
          shouldShow={(props) => {
            return true
          }}
        >
          <div className="floating-menu">
            <button
              onClick={() =>
                editor.chain().focus().setHeading({ level: 1 }).run()
              }
              className={
                editor.isActive('heading', { level: 1 }) ? 'is-active' : ''
              }
            >
              H1
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive('heading', { level: 2 }) ? 'is-active' : ''
              }
            >
              H2
            </button>
          </div>
        </FloatingMenu>
      )} */}
      <EditorContent editor={editor} />
    </>
  );
};
