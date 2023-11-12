'use client';

import {
  useSearchParams,
  useRouter,
  usePathname
} from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const countdown = 300;

export default function Search({ placeholder }: { placeholder: string }) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Search...${term}`);

    const params = new URLSearchParams(searchParams);

    /**
     * 検索した時は、初期値をpage=1としている。
     * 検索した時に複数の条件一致があった時、page=1（先頭）から見ていくことにしたいため。
     */
    params.set('page', '1');

    if(term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    // return '/dashboard/invoices'
    // console.log(`${pathname}`);

    // return 'query=hogehoge'
    // console.log(`${params.toString()}`);

    // update URL
    replace(`${pathname}?${params.toString()}`);
  }, countdown)

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        // クエリパラメータ付きでブラウザアクセスした時に、inputにqueryのワードが入力されている状態にする
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
