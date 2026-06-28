import { useCallback, useRef, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Connection, 
  addEdge, 
  Node, 
  Edge,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  OnNodesDelete,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';

import { StartNode, ActionNode, ConditionNode, EndNode } from './CustomNodes';
import { TableNode, RelationNode, IndexNode, ViewNode, ProcedureNode, TriggerNode } from './DatabaseNodes';
import { ApiEndpointNode } from './ApiNodes';
import { BlockNode, StepNode } from './InfographicNodes';
import { NodeData, NodeType } from '../types';

const nodeTypes = {
  // Flow Mode
  start: StartNode,
  action: ActionNode,
  condition: ConditionNode,
  end: EndNode,
  api: ActionNode, 
  webhook: ActionNode,
  email: ActionNode,
  prompt: ActionNode,
  http_request: ActionNode,
  auth: ActionNode,
  retry: ActionNode,
  queue: ActionNode,
  cache: ActionNode,
  loop: ActionNode,
  transform: ActionNode,
  switch: ConditionNode,
  // Database Mode
  table: TableNode,
  relation: RelationNode,
  index: IndexNode,
  view: ViewNode,
  procedure: ProcedureNode,
  trigger: TriggerNode,
  query: ActionNode,
  // API Mode
  endpoint: ApiEndpointNode,
  request: ActionNode,
  response: ApiEndpointNode,
  // Infographic Mode
  block: BlockNode,
  step: StepNode,
  card: BlockNode,
  timeline: StepNode,
};

const edgeTypes = {};

const defaultEdgeOptions = {
  style: { stroke: '#111111', strokeWidth: 2 },
  type: 'smoothstep',
  animated: true,
};

interface FlowCanvasProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  onInit: (instance: ReactFlowInstance) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick: () => void;
}

export default function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit,
  onNodeClick,
  onEdgeClick,
  onPaneClick
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={memoizedNodeTypes}
        edgeTypes={memoizedEdgeTypes}
        onDragOver={onDragOver}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        style={{ background: '#FAFAFA' }}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background 
          color="#0F172A0A" 
          gap={20} 
          variant={BackgroundVariant.Dots} 
        />
        <Controls 
          className="!bg-white !border-[#0F172A0F] !text-[#111111]" 
          style={{ 
            backgroundColor: '#FFFFFF', 
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
          }} 
        />
        <MiniMap 
          style={{ background: '#FFFFFF', border: '1px solid rgba(15, 23, 42, 0.08)' }}
          maskColor="rgba(0, 0, 0, 0.03)"
          nodeColor={(n) => {
            if (n.type === 'start') return '#10B981';
            if (n.type === 'end') return '#EF4444';
            if (n.type === 'condition') return '#F59E0B';
            return '#3B82F6';
          }}
          className="!bg-white !border-[#0F172A0F] !rounded-xl"
        />
      </ReactFlow>
    </div>
  );
}
