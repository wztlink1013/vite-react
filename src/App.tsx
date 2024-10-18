import {
  Button,
  Col,
  message,
  Popover,
  Row,
  Space,
  Tabs,
  Tree,
  Upload,
} from 'antd';
import React, {
  Profiler,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import styled from 'styled-components';
import type { TreeDataNode, UploadProps } from 'antd';
import {
  DeleteOutlined,
  DragOutlined,
  FileImageOutlined,
  InboxOutlined,
  Loading3QuartersOutlined,
} from '@ant-design/icons';
import { CheckCard } from '@ant-design/pro-components';

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
// Cover component
const { Dragger } = Upload;
const props: UploadProps = {
  name: 'file',
  multiple: true,
  action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
  onChange(info) {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};
const CoverChangeImage = () => {
  const globalBgImages = [
    {
      key: 'senlin',
      url: 'https://gw.alipayobjects.com/mdn/rms_66ee3f/afts/img/A*FyH5TY53zSwAAAAAAAAAAABkARQnAQ',
    },
    {
      key: 'q',
      url: 'https://gw.alipayobjects.com/mdn/rms_66ee3f/afts/img/A*FyH5TY53zSwAAAAAAAAAAABkARQnAQ',
    },
    {
      key: 'w',
      url: 'https://gw.alipayobjects.com/mdn/rms_66ee3f/afts/img/A*FyH5TY53zSwAAAAAAAAAAABkARQnAQ',
    },
    {
      key: 'e',
      url: 'https://gw.alipayobjects.com/mdn/rms_66ee3f/afts/img/A*FyH5TY53zSwAAAAAAAAAAABkARQnAQ',
    },
    {
      key: 'r',
      url: 'https://gw.alipayobjects.com/mdn/rms_66ee3f/afts/img/A*FyH5TY53zSwAAAAAAAAAAABkARQnAQ',
    },
    {
      key: 't',
      url: 'https://gw.alipayobjects.com/mdn/rms_66ee3f/afts/img/A*FyH5TY53zSwAAAAAAAAAAABkARQnAQ',
    },
  ];
  return (
    <CheckCard.Group
      style={{ width: '100%' }}
      size="small"
      onChange={(value) => {
        console.log('value', value);
      }}
      defaultValue="senlin"
    >
      <Row gutter={8}>
        {globalBgImages.map((item) => {
          const { key, url } = item;
          return (
            <Col>
              <CheckCard
                key={key}
                value={key}
                size="small"
                bordered={false}
                style={{ width: 100 }}
                cover={<img alt={key} src={url} />}
              />
            </Col>
          );
        })}
      </Row>
    </CheckCard.Group>
  );
};
const CoverUploadBox = () => {
  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        Click or drag file to this area to upload
      </p>
      <p className="ant-upload-hint">
        Support for a single or bulk upload. Strictly prohibited from
        uploading company data or other banned files.
      </p>
    </Dragger>
  );
};
const CoverSelectBox = () => {
  return (
    <div>
      <Tabs
        defaultActiveKey="changeExisted"
        tabBarExtraContent={
          <Space>
            <Button icon={<Loading3QuartersOutlined />} />
            <Button icon={<DeleteOutlined />} />
          </Space>
        }
        items={[
          {
            key: 'changeExisted',
            label: '官方图库',
            children: <CoverChangeImage />,
          },
          {
            key: 'uploadBox',
            label: '本地上传',
            children: <CoverUploadBox />,
          },
        ]}
      />
    </div>
  );
};
export const CoverActions = () => {
  return (
    <div className="border border-yellow-500">
      <Space.Compact block>
        <Popover
          content={<CoverSelectBox />}
          placement="bottom"
          trigger="click"
          overlayStyle={{
            width: 12 + 100 * 3 + 8 * 3 + 12,
          }}
        >
          <Button
            type="primary"
            // color="primary" variant="filled"
          >
            <FileImageOutlined />
            编辑头图
          </Button>
        </Popover>
        <Button type="primary">
          <DragOutlined />
          调整位置
        </Button>
      </Space.Compact>
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
            <CoverActions />
          </Suspense>
        )}
      </MainBox>
    </Profiler>
  );
}

export default App;
