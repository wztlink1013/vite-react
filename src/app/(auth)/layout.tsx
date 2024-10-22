import { PropsWithChildren } from 'react';

export default function Page({ children }: PropsWithChildren) {
  return (
    <div className="border border-red-300">
      <div className="text-red-300">(auth) layout</div>
      {children}
    </div>
  );
}
