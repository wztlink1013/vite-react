'use client';

import ColorPickerDemo from '@/components/Color';

export default function Page() {
  return (
    <div className="border border-emerald-200">
      <div className="text-emerald-200">dashboard index page</div>
      <div>
        components folder component: <ColorPickerDemo />
      </div>
    </div>
  );
}
