import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Input } from 'antd';

const { TextArea } = Input;

const App: React.FC = () => {
  const [value, setValue] = useState('');
  const [lineCount, setLineCount] = useState(1);
  const [isAboutToWrap, setIsAboutToWrap] = useState(false);
  const textAreaRef = useRef(null);
  const [lineChangeStatus, setLineChangeStatus] = useState('');

  const handleChange = (e: any) => setValue(e.target.value);

  // useLayoutEffect(() => {
  //   // @ts-ignore
  //   const textAreaElement = textAreaRef.current?.resizableTextArea?.textArea;
  //   if (textAreaElement) {
  //     const lineHeight = parseInt(
  //       window.getComputedStyle(textAreaElement).lineHeight,
  //       10
  //     );
  //     const currentLineCount =
  //       Math.floor(textAreaElement.scrollHeight / lineHeight) || 1;
  //     setLineCount(currentLineCount);
  //     const aboutToWrap = textAreaElement.scrollHeight > textAreaElement.clientHeight;
  //     setIsAboutToWrap(aboutToWrap);
  //   }
  // }, [value]);
  const [contentWidth, setContentWidth] = useState(0);
  const calculateContentWidth = (text: any) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    // @ts-ignore
    context.font = window.getComputedStyle(textAreaRef.current).font; // 使用当前字体
    // @ts-ignore
    const metrics = context.measureText(text);
    return metrics.width;
  };
  const updateLineCount = () => {
    // @ts-ignore
    const textAreaElement = textAreaRef.current?.resizableTextArea?.textArea;
    if (textAreaElement) {
      const lineHeight = parseInt(
        window.getComputedStyle(textAreaElement).lineHeight,
        10
      );
      const currentLineCount =
        Math.floor(textAreaElement.scrollHeight / lineHeight) || 1;

      // 判断行数变化
      if (currentLineCount > lineCount) {
        setLineChangeStatus('行数增加');
      } else if (currentLineCount < lineCount) {
        setLineChangeStatus('行数减少');
      } else {
        setLineChangeStatus('');
      }
      setLineCount(currentLineCount);
    }
  };

  useEffect(() => {
    // @ts-ignore
    const textAreaElement = textAreaRef.current?.resizableTextArea?.textArea;
    if (textAreaElement) {
      const width = calculateContentWidth(value);
      setContentWidth(width);
    }
    updateLineCount();
  }, [value]);
  return (
    <>
      <div
        className={`chat-container ${
          lineChangeStatus && lineCount >= 2 ? '' : 'chat-input-area-dangle'
        }`}
      >
        <div className="chat-left-area">1️⃣</div>
        <div className="chat-input-area">
          <div className="chat-input-textarea-wrapper">
            <TextArea
              allowClear
              autoSize={{ minRows: 1, maxRows: 3 }}
              onChange={handleChange}
              ref={textAreaRef}
              value={value}
              rows={lineCount}
              onKeyUp={updateLineCount}
            />
          </div>
        </div>
        <div className="chat-right-area">2️⃣</div>
      </div>
      <p>当前行数: {lineCount}</p>
      {/* <p>{lineChangeStatus}</p> */}
      {contentWidth}
    </>
  );
};

export default App;
