'use client';

import Image from 'next/image';
import { Button } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectInfo, setInfo } from '@/store/reducer/user';

export default function Home() {
  const userInfo = useAppSelector(selectInfo);
  const dispatch = useAppDispatch();
  return (
    <div className="p-2 border border-solid border-slate-400 rounded">
      <div className="text-slate-400">root page(home page)</div>
      <div className="flex flex-row justify-between">
        <div>
          public file:
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
        </div>
        <div>
          <Button>antd button</Button>
        </div>
      </div>
      <div>
        <Button
          onClick={() => {
            dispatch(setInfo({ name: String(Math.random()) }));
          }}
        >
          set user name is Math.random()
        </Button>
        userInfo name:{userInfo.name || ''}
      </div>
    </div>
  );
}
