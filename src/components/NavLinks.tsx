'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function NavLinks() {
  const pathname = usePathname();
  const routes = [
    {
      href: '/',
      title: 'Home',
    },
    {
      href: '/dashboard',
      title: 'dashboard',
    },
    {
      href: '/login',
      title: 'login',
    },
    {
      href: '/register',
      title: 'register',
    },
    {
      href: '/api',
      title: 'api(return -> json data)',
      classNameStr: 'text-blue-700',
    },
    {
      href: '/_test',
      title: '_test( -> 404page)',
      classNameStr: 'text-red-600',
    },
    {
      href: '/blog/a',
      title: 'blog a post',
    },
    {
      href: '/blog/b',
      title: 'blog b post',
    },
    {
      href: '/shop/a',
      title: 'shop a',
    },
    {
      href: '/shop/a/b',
      title: 'shop a/b',
    },
  ];

  return (
    <nav className="p-2 flex flex-row flex-wrap space-x-1 space-y-1 border border-pink-600">
      <div className='text-pink-600'>root common component</div>
      {routes.map((route) => {
        const { href, title, classNameStr } = route;
        return (
          <Link
            key={href}
            href={href}
            className={`block border border-red-400 p-2 ${
              pathname === href ? 'underline' : ''
            } ${classNameStr || ''}`}
          >
            {title}
          </Link>
        );
      })}
    </nav>
  );
}
