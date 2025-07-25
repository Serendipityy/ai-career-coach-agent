"use client"
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image'
import Link from 'next/link';
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import ResumeUploadDialog from './ResumeUploadDialog';
import RoadmapGeneratorDialog from './RoadmapGeneratorDialog';

interface TOOL {
    name: string;
    desc: string;
    icon: string;
    button: string;
    path: string;
}

type AIToolCardProps = {
    tool: TOOL;
}

function AIToolCard({ tool }: AIToolCardProps) {
    const id = uuidv4();
    const iconSrc = tool.icon.startsWith('/') || tool.icon.startsWith('http')
        ? tool.icon
        : '/' + tool.icon;

    const { user } = useUser();
    const router = useRouter();
    const [openResumeUpload, setOpenResumeUpload] = useState(false);
    const [openRoadmapDialog, setOpenRoadmapDialog] = useState(false)
    const onClickButton = async () => {

        if (tool.name == 'AI Resume Analyzer') {
            setOpenResumeUpload(true);
            return;
        }
        if (tool.path == '/ai-tools/ai-roadmap-agent') {
            setOpenRoadmapDialog(true);
            return;
        }

        // Create New record to History Table
        const result = await axios.post('/api/history', {
            recordId: id,
            content: [],
            aiAgentType: tool.path
        })
        console.log(result)
        router.push(tool.path + "/" + id);
    }

    return (
        <div className='p-3 border rounded-lg'>
            <Image src={iconSrc} width={40} height={40} alt={tool.name} />
            <h2 className='font-bold mt-2'>{tool.name}</h2>
            <p className='text-gray-400'>{tool.desc}</p>
            {/* <Link href={tool.path + "/" + id}> */}
            <Button className='w-full mt-3'
                onClick={onClickButton}
            >{tool.button}</Button>
            {/* </Link> */}

            <ResumeUploadDialog openResumeUpload={openResumeUpload} setOpenResumeUpload={setOpenResumeUpload} />

            <RoadmapGeneratorDialog
                openDialog={openRoadmapDialog}
                setOpenDialog={() => setOpenRoadmapDialog(false)}
            />
        </div>
    )
}

export default AIToolCard