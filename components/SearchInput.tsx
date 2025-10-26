'use client';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'

const SearchInput = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('topic') || '';
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className='relative border border-black rounded-lg items-center flex-gap-2 px-2 py-1 h-fit'>
            <Image src="/icons/search.svg" alt="search" width={15} height={15} />
            <input
                placeholder='Search companions...'
                className='outline-none'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />

        </div>
    )
}

export default SearchInput