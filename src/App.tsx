import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Input, theme } from 'antd';

const { TextArea } = Input;

const App: React.FC = () => {
  const { token } = theme.useToken();
  const { borderRadiusLG, blue10 } = token

  const [value, setValue] = useState('');
  const [isDangle, setIsDangle] = useState(false);
  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const centerRef = useRef(null);
  const rightRef = useRef(null);
  const textAreaRef = useRef(null);

  const handleChange = (e: any) => setValue(e.target.value);

  const updateLineCount = () => {
    // @ts-ignore
    const textAreaElement = textAreaRef.current?.resizableTextArea?.textArea;
    if (
      textAreaElement &&
      containerRef?.current &&
      leftRef?.current &&
      rightRef.current
    ) {
      const textAreaRect = window.getComputedStyle(textAreaElement);
      const textLPadd = Number(textAreaRect.paddingLeft.slice(0, -2));
      const textRpadd = Number(textAreaRect.paddingRight.slice(0, -2));

      // @ts-ignore
      const containerWidth = containerRef.current.clientWidth;
      // @ts-ignore
      const leftWidth = leftRef.current.clientWidth;
      // @ts-ignore
      const rightWidth = rightRef.current.clientWidth;
      const centerWidth = containerWidth - leftWidth - rightWidth;

      const textAreaContentRect = getTextareaContentWidth(textAreaElement);

      if (
        // textarea的内容宽度
        textAreaContentRect.width +
          // textarea的padding间距
          textLPadd +
          textRpadd +
          // container的gap间距
          10 * 2 >=
        centerWidth
      ) {
        setIsDangle(true);
      } else {
        setIsDangle(false);
      }
    }
  };

  useEffect(() => {
    updateLineCount();
  }, [value]);
  return (
    <>
      <div
        className={`chat-container ${isDangle ? '' : 'chat-input-area-dangle'}`}
        ref={containerRef}
        style={{
          borderColor: blue10,
          borderRadius: `${borderRadiusLG}px`
        }}
      >
        <div ref={leftRef} className="chat-left-area">
          1️⃣
        </div>
        <div ref={centerRef} className="chat-input-area">
          <div className="chat-input-textarea-wrapper">
            <TextArea
              autoSize={{ minRows: 1, maxRows: 3 }}
              onChange={handleChange}
              ref={textAreaRef}
              value={value}
              onKeyUp={updateLineCount}
              variant="borderless"
              placeholder='发消息、输入 @ 或 / 选择技能'
            />
          </div>
        </div>
        <div ref={rightRef} className="chat-right-area">
          2️⃣2️⃣
        </div>
      </div>
    </>
  );
};

export default App;

function getTextareaContentWidth(textarea: any) {
  const text = textarea.value;
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.font = getComputedStyle(textarea).font;
  div.style.padding = getComputedStyle(textarea).padding;
  div.style.border = getComputedStyle(textarea).border;
  div.style.lineHeight = getComputedStyle(textarea).lineHeight;
  div.style.letterSpacing = getComputedStyle(textarea).letterSpacing;
  div.textContent = text;
  document.body.appendChild(div);
  const rect = div.getBoundingClientRect();
  document.body.removeChild(div);
  return rect;
}
