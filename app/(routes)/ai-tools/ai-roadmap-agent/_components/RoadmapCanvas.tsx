import React, { use, useState } from 'react'
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Controls, MiniMap, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TurboNode from './TurboNode';

const nodeTypes = {
    turbo: TurboNode
}

// https://reactflow.dev/learn
function RoadmapCanvas({ initialNodes, initialEdges }: any) {
    // const initialNodes = [
    //     { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
    //     { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
    // ];
    // const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = (changes: any) => setNodes((nds: any) => applyNodeChanges(changes, nds));
    const onEdgesChange = (changes: any) => setEdges((eds: any) => applyEdgeChanges(changes, eds));

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
            >
                <Controls />
                <MiniMap />
                {/* @ts-ignore */}
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
    )
}

export default RoadmapCanvas