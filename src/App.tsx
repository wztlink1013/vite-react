import React, { Profiler, Suspense, useCallback, useMemo, useState } from 'react'
import { flushSync } from 'react-dom';
import { Nav } from './components/nav';
import { TextEditor } from './components/textEditor';

const onRenderCallback = (
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
) => {
  console.log({ id, phase, actualDuration, baseDuration, startTime, commitTime });
};

const Child = React.memo((props?: {
  msg?: string
  onClick?: () => void
}) => {
  const sum = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((acc, cur) => {
        acc += cur;
        console.info('>>> calculate sum >>>');
        return acc;
      }, 0),
    [],
  );
  console.info('[child render]', sum)
  return (
    <div>
      {props?.msg || 'child default msg value'}
    </div>
  )
})
function App() {
  console.info('[App render]')
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState('hello');
  const onChildClick = useCallback(() => {
    console.log('test lambda function rerender too.')
  }, [])
  const onAppClick = () => {
    fetch(`https://api.github.com/repos/vuejs/core/commits?per_page=3&sha=main`)
    .then(res => res.json())
    .then(data => {
      console.info('>>> fetch data >>>', data)
      flushSync(() => {
        setCount((count) => count + 1)
      });
      flushSync(() => {
        setMsg('hello world')
      });
    })
  }
  return (
    <>
    {/* <Profiler id="App" onRender={onRenderCallback}>
      <div style={{
        marginTop: '200px',
        textAlign: 'right'
      }}>
        <button onClick={onAppClick}>
          count is {count}
        </button>
        {msg && (
          <Suspense fallback={<div>Loading...</div>}>
            <Child msg={msg} onClick={onChildClick} />
          </Suspense>
          )}
      </div>
    </Profiler> */}
      <div className="App">
        <div className="editor-wrapper">
          <Nav />
          <TextEditor />
        </div>
      </div>
    </>
  )
}

export default App
