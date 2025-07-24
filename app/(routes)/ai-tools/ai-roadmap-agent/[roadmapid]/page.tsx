"use client";
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import RoadmapCanvas from '../_components/RoadmapCanvas';
import RoadmapGeneratorDialog from '@/app/(routes)/dashboard/_components/RoadmapGeneratorDialog';

function RoadmapGeneratorAgent() {
    const { roadmapid } = useParams();
    const [roadMapDetail, setRoadMapDetail] = useState<any>(null);
    const [openRoadmapDialog, setOpenRoadmapDialog] = useState(false);

    useEffect(() => {
        roadmapid && GetRoadmapDetails();
    }, [roadmapid])


    const GetRoadmapDetails = async () => {
        const result = await axios.get('/api/history?recordId=' + roadmapid);
        let content = result.data?.content;
        // Parse if content is a string
        if (typeof content === 'string') {
            try {
                content = JSON.parse(content);
            } catch (e) {
                content = null;
            }
        }
        setRoadMapDetail(content);
    }
    // Only render when data is available and valid
    const hasValidNodes = Array.isArray(roadMapDetail?.initialNodes) && roadMapDetail.initialNodes.length > 0;
    const hasValidEdges = Array.isArray(roadMapDetail?.initialEdges);

    // Debug: log nodes and edges before rendering
    if (hasValidNodes) {
        // eslint-disable-next-line no-console
        console.log('initialNodes:', roadMapDetail.initialNodes);
    }
    if (hasValidEdges) {
        // eslint-disable-next-line no-console
        console.log('initialEdges:', roadMapDetail.initialEdges);
    }

    // Force all node types to 'turbo' for correct rendering
    const turboNodes = hasValidNodes
        ? roadMapDetail.initialNodes.map((node: any) => ({ ...node, type: 'turbo' }))
        : [];

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            <div className='border rounded-xl p-5'>
                <h2 className='font-bold text-2xl'>{roadMapDetail?.roadmapTitle || 'No Title'}</h2>
                <p className='mt-3 text-gray-500'><strong>Description:</strong><br />{roadMapDetail?.description || 'No description available.'}</p>
                <h2 className='mt-5 font-medium text-blue-600'>Duration: {roadMapDetail?.duration || 'N/A'}</h2>

                <Button onClick={() => setOpenRoadmapDialog(true)} className='mt-5 w-full'>+ Create Another Roadmap</Button>
            </div>
            {/* https://reactflow.dev/learn */}
            <div className='md:col-span-2 w-full h-[80vh]'>
                {hasValidNodes && hasValidEdges ? (
                    <RoadmapCanvas initialNodes={turboNodes} initialEdges={roadMapDetail.initialEdges} />
                ) : (
                    <div className='flex items-center justify-center h-full text-gray-400'>No roadmap content available.</div>
                )}
            </div>
            <RoadmapGeneratorDialog openDialog={openRoadmapDialog} setOpenDialog={() => setOpenRoadmapDialog(false)} />
        </div >
    )
}

export default RoadmapGeneratorAgent