    import { useCallback, useEffect } from 'react';
    import {
        ReactFlow,
        Background,
        BackgroundVariant,
        useNodesState,
        useEdgesState,
        addEdge,
        Handle,
        Position,
        ReactFlowProvider,
        useReactFlow,
        BaseEdge,
        EdgeLabelRenderer,
        getBezierPath,
        MarkerType
    } from '@xyflow/react';
    import type {
        Connection,
        Edge,
        NodeProps,
        Node,
        EdgeProps,
        FinalConnectionState
    } from '@xyflow/react';
    import {
        Plus,
        Search,
        Columns3,
        Minus
    } from 'lucide-react';
    import '@xyflow/react/dist/style.css';

    // Импортируем компонент тулбара
    import { Toolbar } from './Toolbar';

    interface NodeData extends Record<string, unknown> {
        label: string;
        shape?: 'square' | 'circle' | 'diamond' | 'triangle';
        color?: string;
        textColor?: string;
        fontFamily?: string;
        onChange?: (id: string, val: string) => void;
    }

    const handleStyle = { background: '#000000', width: '6px', height: '6px' };

    function FigmaNode({ id, data }: NodeProps<Node<NodeData>>) {
        const shape = data.shape || 'square';
        const backgroundColor = data.color || '#FFFFFF';

        return (
            <div style={{
                width: '160px',
                height: '160px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <svg style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}>
                    {shape === 'square' && (
                        <rect x="1" y="1" width="158" height="158" fill={backgroundColor} stroke="#000000" strokeWidth="1.5" />
                    )}
                </svg>

                <Handle type="target" position={Position.Top} id="top-target" style={{ ...handleStyle, zIndex: 5 }} />

                <div style={{ zIndex: 2, width: '100%', padding: '20px', boxSizing: 'border-box' }}>
                    <textarea
                        value={data.label}
                        placeholder="Вопрос?"
                        onChange={(e) => data.onChange?.(id, e.target.value)}
                        rows={3}
                        style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '16px',
                            fontWeight: 400,
                            textAlign: 'center',
                            width: '100%',
                            resize: 'none',
                            background: 'transparent',
                            color: data.textColor || '#000000',
                            fontFamily: data.fontFamily || 'Inter, sans-serif'
                        }}
                    />
                </div>

                <Handle type="source" position={Position.Left} id="left-source" style={{ ...handleStyle, top: '50%', transform: 'translateY(-50%)', zIndex: 5 }} />
                <Handle type="source" position={Position.Right} id="right-source" style={{ ...handleStyle, top: '50%', transform: 'translateY(-50%)', zIndex: 5 }} />
                <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ ...handleStyle, zIndex: 5 }} />
            </div>
        );
    }

    function EditableEdge({
                              id,
                              sourceX,
                              sourceY,
                              targetX,
                              targetY,
                              sourcePosition,
                              targetPosition,
                              style = {},
                              markerEnd,
                              data
                          }: EdgeProps<Edge<{ label: string; onChange: (id: string, val: string) => void }>>) {
        const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

        return (
            <>
                <BaseEdge path={edgePath} style={{ ...style, stroke: '#000000', strokeWidth: 1.5 }} markerEnd={markerEnd} />
                <EdgeLabelRenderer>
                    <div style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                        background: '#FFFFFF',
                        border: '1.5px dashed #000000',
                        padding: '6px 10px',
                        zIndex: 10,
                    }}>
                        <input
                            value={data?.label || ''}
                            placeholder="Вариант ответа"
                            onChange={(e) => data?.onChange?.(id, e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '13px',
                                fontWeight: 400,
                                textAlign: 'center',
                                width: '100px',
                                background: 'transparent'
                            }}
                        />
                    </div>
                </EdgeLabelRenderer>
            </>
        );
    }

    const nodeTypes = { figmaNode: FigmaNode };
    const edgeTypes = { editable: EditableEdge };

    function AppContent() {
        const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
        const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
        const { screenToFlowPosition, zoomIn, zoomOut } = useReactFlow();

        const selectedNode = nodes.find(n => n.selected);

        const deleteSelectedNode = useCallback(() => {
            if (!selectedNode) return;
            setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
            setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
        }, [selectedNode, setNodes, setEdges]);

        // Функция для кнопки "Новое дерево"
        const resetFlow = () => {
            setNodes([]);
            setEdges([]);
        };

        const onColorChange = useCallback((color: string) => {
            if (!selectedNode) return;
            setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, color } } : n));
        }, [selectedNode, setNodes]);

        const onTextColorChange = useCallback((textColor: string) => {
            if (!selectedNode) return;
            setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, textColor } } : n));
        }, [selectedNode, setNodes]);

        const onFontChange = useCallback((fontFamily: string) => {
            if (!selectedNode) return;
            setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, fontFamily } } : n));
        }, [selectedNode, setNodes]);

        const onNodeLabelChange = useCallback((id: string, value: string) => {
            setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label: value } } : n));
        }, [setNodes]);

        const onEdgeLabelChange = useCallback((id: string, value: string) => {
            setEdges((eds) => eds.map((e) => e.id === id ? { ...e, data: { ...e.data, label: value } } : e));
        }, [setEdges]);

        useEffect(() => {
            setNodes([
                {
                    id: '1',
                    type: 'figmaNode',
                    position: { x: 450, y: 150 },
                    data: { label: 'Вопрос?', shape: 'square', color: '#FFFFFF', onChange: onNodeLabelChange }
                }
            ]);
        }, [onNodeLabelChange, setNodes]);

        const onConnect = useCallback((params: Connection) => {
            if (params.source === params.target) return;
            const edgeId = `e-${params.source}-${params.target}-${params.sourceHandle}`;
            setEdges((eds) => addEdge({
                ...params,
                id: edgeId,
                type: 'editable',
                data: { label: '', onChange: onEdgeLabelChange },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }
            }, eds));
        }, [setEdges, onEdgeLabelChange]);

        const onConnectEnd = useCallback((
            event: globalThis.MouseEvent | globalThis.TouchEvent,
            connectionState: FinalConnectionState
        ) => {
            if (!connectionState.isValid && connectionState.fromNode) {
                const clientX = 'clientX' in event ? event.clientX : ('changedTouches' in event && event.changedTouches?.[0] ? event.changedTouches[0].clientX : 0);
                const clientY = 'clientY' in event ? event.clientY : ('changedTouches' in event && event.changedTouches?.[0] ? event.changedTouches[0].clientY : 0);
                if (clientX === 0 && clientY === 0) return;

                const flowPos = screenToFlowPosition({ x: clientX, y: clientY });
                const newNodeId = String(Date.now());

                const newNode: Node<NodeData> = {
                    id: newNodeId,
                    type: 'figmaNode',
                    position: { x: flowPos.x - 80, y: flowPos.y - 80 },
                    data: { label: '', shape: 'square', color: '#FFFFFF', onChange: onNodeLabelChange }
                };

                const newEdge: Edge = {
                    id: `e-${connectionState.fromNode.id}-${newNodeId}-${connectionState.fromHandle?.id || ''}`,
                    source: connectionState.fromNode.id,
                    target: newNodeId,
                    sourceHandle: connectionState.fromHandle?.id || '',
                    targetHandle: 'top-target',
                    type: 'editable',
                    data: { label: '', onChange: onEdgeLabelChange },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }
                };

                setNodes((nds) => nds.concat(newNode));
                setEdges((eds) => eds.concat(newEdge));
            }
        }, [screenToFlowPosition, onNodeLabelChange, onEdgeLabelChange, setNodes, setEdges]);

        return (
            <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#FFFFFF', color: '#000000' }}>
                <aside style={{
                    width: '296px',
                    height: '100%',
                    background: '#FDFDFD',
                    borderRight: '1px solid #EFEFEF',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 16px',
                    zIndex: 10,
                    userSelect: 'none'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>Nodus</span>
                        <div style={{ display: 'flex', gap: '12px', color: '#666' }}>
                            <Search size={20} style={{ cursor: 'pointer' }} />
                            <Columns3 size={20} style={{ cursor: 'pointer' }} />
                        </div>
                    </div>

                    <button
                        onClick={resetFlow}
                        style={{
                            width: '100%', height: '48px', background: '#EDEDED', border: 'none', borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer', marginBottom: '32px'
                        }}>
                        <Plus size={18} strokeWidth={2.5} /> Новое дерево
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <div style={{
                            height: '44px', padding: '0 12px 0 16px', borderRadius: '12px', border: '1px solid #000000',
                            background: '#FFFFFF', display: 'flex', alignItems: 'center', cursor: 'pointer'
                        }}>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px' }}>Новый проект 3</span>
                        </div>
                    </div>
                </aside>

                <main style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {selectedNode && (
                        <Toolbar
                            onDelete={deleteSelectedNode}
                            onColorChange={onColorChange}
                            onTextColorChange={onTextColorChange}
                            onFontChange={onFontChange}
                        />
                    )}

                    <header style={{
                        height: '56px', width: '100%', background: '#FFFFFF', borderBottom: '1px solid #F5F5F5',
                        display: 'flex', alignItems: 'center', padding: '0 24px', zIndex: 5
                    }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px' }}>Новый проект 3</span>
                    </header>

                    <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onConnectEnd={onConnectEnd}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                        >
                            <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#CCCCCC" />
                        </ReactFlow>

                        <div style={{
                            position: 'absolute', bottom: '24px', right: '24px', height: '36px', background: '#F5F5F5',
                            borderRadius: '10px', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '16px', zIndex: 10
                        }}>
                            <Minus size={14} onClick={zoomOut} style={{ cursor: 'pointer', color: '#666666' }} />
                            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px' }}>100%</span>
                            <Plus size={14} onClick={zoomIn} style={{ cursor: 'pointer', color: '#666666' }} />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    export default function App() {
        return (
            <ReactFlowProvider>
                <AppContent />
            </ReactFlowProvider>
        );
    }