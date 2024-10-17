import { Button } from 'antd';
import React, {
  Profiler,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import styled from 'styled-components';

// Perfomance component
const onRenderCallback = (
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  console.log('[Profiler]', {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });
};

// Child component
const Child = React.memo((props?: { msg?: string; onClick?: () => void }) => {
  const sum = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((acc, cur) => {
        acc += cur;
        console.info('[child render] calculate sum');
        return acc;
      }, 0),
    []
  );
  console.info('[child render]', sum);
  return (
    <div className="border border-cyan-500 flex justify-between">
      <div>Child Component: </div>
      <div>{props?.msg || 'child default msg value'}</div>
    </div>
  );
});

// Main component
const MainBox = styled.div`
  margin-top: 200px;
  text-align: right;
  border: 1px solid pink;
`;
function App() {
  console.info('[App render]');
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState('hello');
  const onChildClick = useCallback(() => {
    console.log('[App render] test lambda function rerender too.');
  }, []);
  const onAppClick = () => {
    fetch(`https://api.github.com/repos/vuejs/core/commits?per_page=3&sha=main`)
      .then((res) => res.json())
      .then((data) => {
        console.info('[App render] fetch data', data);
        flushSync(() => {
          setCount((count) => count + 1);
        });
        flushSync(() => {
          setMsg('hello world');
        });
      });
  };
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MainBox>
        <button onClick={onAppClick}>count is {count}</button>
        {msg && (
          <Suspense fallback={<div>Loading...</div>}>
            <Child msg={msg} onClick={onChildClick} />
            <Button color="default" variant="filled">
              Antd Button
            </Button>
          </Suspense>
        )}
      </MainBox>
    </Profiler>
  );
}

export default App;
