import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useTheme } from 'next-themes';

// Wrapper to handle SSR if needed (though we are SPA) and container sizing
const KnowledgeGraph = ({ notes, onNodeClick }) => {
    // Transform notes into graph data
    // Nodes: { id: note.title, group: 1 }
    // Links: { source: note.title, target: linkedNoteTitle }

    // We need to parse content for [[Link]] to build edges
    const data = useMemo(() => {
        const nodes = [];
        const links = [];
        const nodeSet = new Set();

        // 1. Create nodes for all notes
        notes.forEach(note => {
            if (!nodeSet.has(note.title)) {
                nodes.push({ id: note.title, group: 1, val: 5 }); // val = size
                nodeSet.add(note.title);
            }
        });

        // 2. Parse links
        notes.forEach(note => {
            const regex = /\[\[(.*?)\]\]/g;
            let match;
            while ((match = regex.exec(note.content)) !== null) {
                const targetTitle = match[1];

                // If target exists as a note, link it
                // Even if it doesn't exist yet, we might want to show it as a potential node?
                // Let's only link existing nodes for now to avoid clutter
                if (nodeSet.has(targetTitle)) {
                    links.push({
                        source: note.title,
                        target: targetTitle
                    });
                }
            }
        });

        return { nodes, links };
    }, [notes]);

    return (
        <div className="w-full h-[400px] border border-white/10 rounded-xl overflow-hidden bg-black/20">
            <ForceGraph2D
                graphData={data}
                nodeLabel="id"
                nodeColor={node => '#3b82f6'} // primary blue
                linkColor={() => '#ffffff33'}
                backgroundColor="transparent"
                onNodeClick={node => onNodeClick(node.id)}
                width={800} // This should be responsive, but fixed for now
                height={400}
                nodeRelSize={6}
            />
        </div>
    );
};

export default KnowledgeGraph;
