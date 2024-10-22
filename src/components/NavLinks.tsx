'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="p-2">
      <Link
        className={`link ${
          pathname === '/' ? 'active' : ''
        } border border-red-400 p-2`}
        href="/"
      >
        Home
      </Link>

      <Link
        className={`link ${
          pathname === '/dashboard' ? 'active' : ''
        } border border-red-400 p-2`}
        href="/dashboard"
      >
        dashboard
      </Link>
      <Link className={`link border border-red-400 p-2`} href="/login">
        login
      </Link>
      <Link className={`link border border-red-400 p-2`} href="/register">
        register
      </Link>
      <Link
        className={`link border border-red-400 p-2 text-blue-700`}
        href="/api"
      >
        api
      </Link>
      <Link
        className={`link border border-red-400 p-2 text-red-600`}
        href="/_test"
      >
        _test( -{'>'} 404page)
      </Link>
      <Link className={`link border border-red-400 p-2`} href="/blog/a">
        blog a post
      </Link>
      <Link className={`link border border-red-400 p-2`} href="/blog/b">
        blog b post
      </Link>
      <Link className={`link border border-red-400 p-2`} href="/shop/a">
        shop a
      </Link>
      <Link className={`link border border-red-400 p-2`} href="/shop/a/b">
        shop a/b
      </Link>
    </nav>
  );
}
