import {
  forwardRef,
  memo,
  Profiler,
  Suspense,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';

const onRenderCallback = (
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });
};

const Child = memo(
  forwardRef(
    (
      props: {
        msg?: string;
        onClick?: () => void;
      },
      refs: any
    ) => {
      const childRef1 = useRef();
      const childRef2 = useRef();
      useImperativeHandle(refs, () => ({
        childRef1,
        childRef2,
      }));

      const sum = useMemo(
        () =>
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((acc, cur) => {
            acc += cur;
            console.info('>>> calculate sum >>>');
            return acc;
          }, 0),
        []
      );
      console.info('[child render]', sum);
      return (
        <div style={{
          border: '1px solid cyan'
        }}>
          {props?.msg || 'child default msg value'}
          <div>
            输入框1
            <input {...props} ref={childRef1} />
          </div>
          <div>
            输入框2
            <input {...props} ref={childRef2} />
          </div>
        </div>
      );
    }
  )
);
function App() {
  console.info('[App render]');
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState('hello');
  const buttonRef = useRef(null);

  const childRef = useRef(null);
  console.info('>>> refs >>>', buttonRef, childRef);
  const onChildClick = useCallback(() => {
    console.log('test lambda function rerender too.');
  }, []);
  const onAppClick = () => {
    fetch(`https://api.github.com/repos/vuejs/core/commits?per_page=3&sha=main`)
      .then((res) => res.json())
      .then((data) => {
        console.info('>>> fetch data >>>', data);
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
      <div
        style={{
          marginTop: '200px',
          textAlign: 'right',
        }}
      >
        <button ref={buttonRef} onClick={onAppClick}>
          count is {count}
        </button>
        <button onClick={() => childRef.current.childRef1.current.focus()}>
          聚焦子组件的输入框1
        </button>
        <button onClick={() => childRef.current.childRef2.current.focus()}>
          聚焦子组件的输入框2
        </button>
        {msg && (
          <Suspense fallback={<div>Loading...</div>}>
            <Child msg={msg} onClick={onChildClick} ref={childRef} />
          </Suspense>
        )}
      </div>
    </Profiler>
  );
}

export default App;
