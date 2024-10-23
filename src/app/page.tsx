'use client';

import Image from 'next/image';
import { Button } from 'antd';

export default function Home() {
  console.info('>>> root page >>>');
  return (
    <div className="p-2 border border-solid border-yellow-200 rounded text-yellow-200">
      <div>root page(home page)</div>
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
          <Button type="primary">antd button</Button>
        </div>
      </div>
    </div>
  );
}
