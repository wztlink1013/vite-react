import { PropsWithChildren, ReactNode } from 'react';

export default function Page({ children, auth_left, auth_right }: {
  children: ReactNode,
  auth_left: ReactNode,
  auth_right: ReactNode,
}) {
  return (
    <div className="border border-red-300">
      <div className="text-red-300">(auth) layout</div>
      {auth_left}
      {auth_right}
      {children}
    </div>
  );
}
