'use client'

import React, { useEffect, useState } from 'react'
import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue } from './ui/select'
import { useSearchParams, useRouter } from 'next/navigation';
import { formUrlQuery } from '@jsmastery/utils';
import { removeKeysFromUrlQuery } from '@jsmastery/utils';
import { subjects } from '@/constants';

const SubjectFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("subject") || "";

    const [subject, setSubject] = useState(query);

    useEffect(() => {
        let newUrl = "";

        if (subject === "all") {
            newUrl = removeKeysFromUrlQuery({
                params: searchParams.toString(),
                keysToRemove: ["subject"],
            });
        } else {
            newUrl = formUrlQuery({
                params: searchParams.toString(),
                key: "subject",
                value: subject,
            });
        }

        router.push(newUrl, { scroll: false });
    }, [subject]);


    return (
        <Select onValueChange={setSubject} value={subject}>
            <SelectTrigger className="input capitalize">
                <SelectValue placeholder="Subject" />
            </SelectTrigger>

            <SelectContent className="capitalize">
                <SelectItem value="all">All subjects</SelectItem>

                {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                        {subject}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default SubjectFilter