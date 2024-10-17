import { Button, Tree } from 'antd';
import React, {
  Profiler,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import styled from 'styled-components';
import type { TreeDataNode } from 'antd';

// Perfomance component
const onRenderCallback = (
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  // console.log('[Profiler]', {
  //   id,
  //   phase,
  //   actualDuration,
  //   baseDuration,
  //   startTime,
  //   commitTime,
  // });
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
// toc component
type TreeOriginDataItem = {
  level: number;
  text: string;
  id: string;
  children?: TreeOriginDataItem[];
};
const Toc = () => {
  console.info('[Toc render]');

  const data: TreeOriginDataItem[] = [
    {
      level: 3,
      text: 'asdfa',
      id: 'mopgcz',
    },
    {
      level: 4,
      text: 'asdfasfdf',
      id: 'pch3be',
    },
    {
      level: 2,
      text: 'rqwer6qwrw',
      id: 'kab96p',
    },
    {
      level: 2,
      text: 'rqwerqwrw',
      id: '4fonwd',
    },
    {
      level: 1,
      text: 'ee',
      id: 'rwe',
    },
  ];
  // const test2 = {
  //   title: '标题',
  //   key: 'doc-slug',
  //   level: 0,
  //   children: [
  //     {
  //       title: 'asdfa',
  //       key: 'mopgcz',
  //       level: 3,
  //       children: [
  //         {
  //           title: 'asdfasfdf',
  //           key: 'pch3be',
  //           level: 4,
  //           children: [],
  //         },
  //       ],
  //     },
  //     {
  //       title: 'rqwer6qwrw',
  //       key: 'kab96p',
  //       level: 2,
  //       children: [],
  //     },
  //     {
  //       title: 'rqwerqwrw',
  //       key: '4fonwd',
  //       level: 2,
  //       children: [],
  //     },
  //     {
  //       title: 'ee',
  //       key: 'rwe',
  //       level: 1,
  //       children: [],
  //     },
  //   ],
  // };
  const buildTree = (
    data: TreeOriginDataItem[],
    title = '标题',
    key = 'doc-slug'
  ): TreeDataNode[] => {
    const root = {
      title,
      key,
      level: 0,
      children: [],
    };

    const stack = [root]; // 初始化根节点作为栈的初始元素

    data.forEach((item) => {
      const node = {
        title: item.text,
        key: item.id,
        level: item.level,
        children: [],
      };

      // 找到当前节点的父节点
      while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
        stack.pop(); // 弹出栈顶元素，直到找到比当前节点level小的元素作为父节点
      }
      // @ts-ignore 将当前节点作为其父节点的子节点
      stack[stack.length - 1].children.push(node);
      // 将当前节点入栈，等待处理它的子节点
      stack.push(node);
    });

    return [root];
  };
  const tree = buildTree(data);
  // setTreeData(tree);
  console.warn('tree', tree);
  return (
    <div className="border border-yellow-500">
      <Tree treeData={tree} />
    </div>
  );
};

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
            <Toc />
          </Suspense>
        )}
      </MainBox>
    </Profiler>
  );
}

export default App;
