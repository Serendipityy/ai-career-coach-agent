import { Handle, Position } from '@xyflow/react'
import Link from 'next/link'
import React from 'react'

function TurboNode({ data }: any) {
    console.log('TurboNode data:', data);
    const title = data?.title || 'No Title';
    const description = data?.description || 'No description available.';
    const link = data?.link || '#';
    return (
        <div className='rounded-lg border-gray-300 bg-yellow-100 shadow-md w-64 p-5'>
            <div className='font-bold text-lg text-gray-800'>{title}</div>
            <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{description}</p>
            <Link href={link} target='_blank' className='text-blue-600 underline text-sm mt-2 inline-block'>
                Learn More
            </Link>
            <Handle type='target' position={Position.Top} />
            <Handle type='source' position={Position.Bottom} />
        </div>
    )
}

export default TurboNode