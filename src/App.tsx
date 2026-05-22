import { useCallback, useEffect, useState } from 'react';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    addEdge,
    Handle,
    Position,
    ReactFlowProvider,
    useReactFlow,
    useViewport,
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    MarkerType,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
import type {
    Connection,
    Edge,
    NodeProps,
    Node,
    EdgeProps,
    FinalConnectionState,
    NodeChange,
    EdgeChange
} from '@xyflow/react';
import {
    Plus,
    Search,
    Columns3,
    Minus,
    X,
    MoreHorizontal
} from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { Toolbar } from './Toolbar';

interface NodeData extends Record<string, unknown> {
    label: string;
    shape?: 'square' | 'circle' | 'diamond' ;
    color?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    onChange?: (id: string, val: string) => void;
}

interface Project {
    id: string;
    name: string;
    // Типизируем узлы явно
    nodes: Node<NodeData>[];
    edges: Edge[];
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
                pointerEvents: 'none' // ← исправлен пробел в p ointerEvents
            }}>
                {shape === 'square' && (
                    <rect x="1" y="1" width="158" height="158" fill={backgroundColor} stroke="#000000" strokeWidth="1.5" />
                )}
                {shape === 'circle' && (
                    <circle cx="80" cy="80" r="78" fill={backgroundColor} stroke="#000000" strokeWidth="1.5" />
                )}
                {shape === 'diamond' && (
                    <polygon points="80,4 156,80 80,156 4,80" fill={backgroundColor} stroke="#000000" strokeWidth="1.5" />
                )}

            </svg>

            <Handle type="target" position={Position.Top} id="top-target" style={{ ...handleStyle, zIndex: 5 }} />

            <div style={{ zIndex: 2, width: '100%', padding: '20px', boxSizing: 'border-box' }}>
                <textarea
                    className="nodrag nowheel"
                    value={data.label}
                    placeholder="Вопрос?"
                    onChange={(e) => data.onChange?.(id, e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    rows={3}
                    style={{
                        border: 'none',
                        outline: 'none',
                        pointerEvents: 'all',
                        fontSize: `${data.fontSize || 16}px`,
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
                        className="nodrag nowheel"
                        value={data?.label || ''}
                        placeholder="Ответ"
                        onChange={(e) => data?.onChange?.(id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        style={{
                            border: 'none',
                            outline: 'none',
                            pointerEvents: 'all',
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
    const [projects, setProjects] = useState<Project[]>(() => {
        const saved = localStorage.getItem('nodus-projects');
        try {
            return saved ? JSON.parse(saved) : [{
                id: '1',
                name: 'Новый проект 1',
                nodes: [{ id: '1', type: 'figmaNode', position: { x: 450, y: 150 }, data: { label: 'Вопрос?' } }],
                edges: []
            }];
        } catch (e) {
            console.error("Ошибка парсинга проектов:", e);
            return [];
        }
    });

    const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || '1');
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);
    const [activeWalkthrough, setActiveWalkthrough] = useState<{
        project: Project;
        currentNode: Node<NodeData>;
    } | null>(null);

    const { screenToFlowPosition, zoomIn, zoomOut } = useReactFlow();
    const { zoom } = useViewport();
    const zoomPercent = Math.round((zoom || 1) * 100);

    const runWalkthrough = (project: Project) => {
        setActiveMenuProjectId(null);
        const startNode = project.nodes.find(n => !project.edges.find(e => e.target === n.id)) || project.nodes[0];
        if (startNode) {
            setActiveWalkthrough({ project, currentNode: startNode });
        }
    };

    const goToNextNode = (edgeId: string) => {
        if (!activeWalkthrough) return;
        const edge = activeWalkthrough.project.edges.find(e => e.id === edgeId);
        if (!edge) return;
        const nextNode = activeWalkthrough.project.nodes.find(n => n.id === edge.target);
        if (nextNode) {
            setActiveWalkthrough({ ...activeWalkthrough, currentNode: nextNode });
        } else {
            alert("Проход завершен!");
            setActiveWalkthrough(null);
        }
    };

    useEffect(() => {
        localStorage.setItem('nodus-projects', JSON.stringify(projects));
    }, [projects]);

    const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

    const updateProjectData = (newNodes: Node<NodeData>[], newEdges: Edge[]) => {
        setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, nodes: newNodes, edges: newEdges } : p));
    };

    const createNewProject = () => {
        const defaultName = `Новый проект ${projects.length +1}`;
        const name = prompt("Введите имя нового проекта: ", defaultName);
        if (name === null) return;
        const newId = String(Date.now());
        const newProject: Project = {
            id: newId,
            name: name.trim() || defaultName,
            nodes: [{ id: '1', type: 'figmaNode', position: { x: 450, y: 150 }, data: { label: 'Вопрос?' } }],
            edges: []
        };
        setProjects([newProject,...projects]);
        setActiveProjectId(newId);
    };

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        const newNodes = applyNodeChanges(changes, activeProject.nodes) as Node<NodeData>[];
        updateProjectData(newNodes, activeProject.edges);
    }, [activeProject]);

    const onEdgesChange = useCallback((changes: EdgeChange[]) => {
        const newEdges = applyEdgeChanges(changes, activeProject.edges);
        updateProjectData(activeProject.nodes, newEdges);
    }, [activeProject]);

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<NodeData>) => {
        setProjects(prev => prev.map(p => p.id === activeProjectId ? {
            ...p,
            nodes: p.nodes.map(n => ({ ...n, selected: n.id === node.id }))
        } : p));
    }, [activeProjectId]);

    const onNodeDataChange = useCallback((key: string, value: unknown) => {
        const selectedNode = activeProject.nodes.find(n => n.selected);
        if (!selectedNode) return;
        updateProjectData(
            activeProject.nodes.map((n) =>
                n.id === selectedNode.id ? { ...n, data: { ...n.data, [key]: value } } : n
            ),
            activeProject.edges
        );
    }, [activeProject]);

    const deleteSelectedNode = useCallback(() => {
        const selectedNode = activeProject.nodes.find(n => n.selected);
        if (!selectedNode) return;
        const newNodes = activeProject.nodes.filter((n) => n.id !== selectedNode.id);
        const newEdges = activeProject.edges.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id);
        updateProjectData(newNodes, newEdges);
    }, [activeProject]);

    const onNodeLabelChange = useCallback((id: string, value: string) => {
        updateProjectData(
            activeProject.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, label: value } } : n),
            activeProject.edges
        );
    }, [activeProject]);

    const onEdgeLabelChange = useCallback((id: string, value: string) => {
        updateProjectData(
            activeProject.nodes,
            activeProject.edges.map((e) => e.id === id ? { ...e, data: { ...e.data, label: value } } : e)
        );
    }, [activeProject]);

    const onConnect = useCallback((params: Connection) => {
        if (params.source === params.target) return;
        const edgeId = `e-${params.source}-${params.target}-${params.sourceHandle}`;
        const newEdges = addEdge({
            ...params,
            id: edgeId,
            type: 'editable',
            data: { label: '', onChange: onEdgeLabelChange },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }
        }, activeProject.edges);
        updateProjectData(activeProject.nodes, newEdges);
    }, [activeProject, onEdgeLabelChange]);

    const onConnectEnd = useCallback((
        event: MouseEvent | TouchEvent,
        connectionState: FinalConnectionState
    ) => {
        if (!connectionState.isValid && connectionState.fromNode) {
            const clientX = 'clientX' in event ? event.clientX : ('changedTouches' in event && event.changedTouches?.[0] ? event.changedTouches[0].clientX : 0);
            const clientY = 'clientY' in event ? event.clientY : ('changedTouches' in event && event.changedTouches?.[0] ? event.changedTouches[0].clientY : 0);

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

            updateProjectData([...activeProject.nodes, newNode], [...activeProject.edges, newEdge]);
        }
    }, [screenToFlowPosition, activeProject, onNodeLabelChange, onEdgeLabelChange]);

    const nodesForFlow = activeProject.nodes.map(n => ({
        ...n,
        data: { ...n.data, onChange: onNodeLabelChange }
    }));
    const edgesForFlow = activeProject.edges.map(e => ({
        ...e,
        data: { ...e.data, onChange: onEdgeLabelChange }
    }));

    const selectedNode = activeProject.nodes.find(n => n.selected);

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#FFFFFF', color: '#000000' }}>
            {isSidebarVisible && (
                <aside style={{ width: '296px', height: '100%', background: '#FDFDFD', borderRight: '1px solid #EFEFEF', display: 'flex', flexDirection: 'column', padding: '24px 16px', zIndex: 10, userSelect: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>Nodus</span>
                        <div style={{ display: 'flex', gap: '12px', color: '#666' }}>
                            <Search size={20} style={{ cursor: 'pointer' }} onClick={() => setIsSearchVisible(!isSearchVisible)} />
                            <Columns3 size={20} style={{ cursor: 'pointer' }} onClick={() => setIsSidebarVisible(false)} />
                        </div>
                    </div>

                    {isSearchVisible && (
                        <div style={{ marginBottom: '16px', position: 'relative' }}>
                            <input autoFocus placeholder="Поиск проектов..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #EFEFEF', outline: 'none' }} />
                            <X size={14} style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer' }} onClick={() => { setIsSearchVisible(false); setSearchTerm(''); }} />
                        </div>
                    )}

                    <button onClick={createNewProject} style={{ width: '100%', height: '48px', background: '#EDEDED', border: 'none', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer', marginBottom: '32px' }}>
                        <Plus size={18} strokeWidth={2.5} /> Новое дерево
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                        {projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                            <div
                                key={p.id}
                                onClick={() => setActiveProjectId(p.id)}
                                style={{
                                    height: '44px', padding: '0 12px 0 16px', borderRadius: '12px',
                                    border: activeProjectId === p.id ? '1px solid #000000' : '1px solid #EFEFEF',
                                    background: activeProjectId === p.id ? '#F5F5F5' : '#FFFFFF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    cursor: 'pointer', position: 'relative'
                                }}
                            >
                                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px' }}>{p.name}</span>
                                <div
                                    onClick={(e) => { e.stopPropagation(); setActiveMenuProjectId(activeMenuProjectId === p.id ? null : p.id); }}
                                    style={{ padding: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    <MoreHorizontal size={18} color="#666" />
                                </div>
                                {activeMenuProjectId === p.id && (
                                    <div style={{
                                        position: 'absolute', top: '100%', right: '0', background: '#FFF',
                                        border: '1px solid #EFEFEF', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        zIndex: 100, width: '180px', padding: '8px', marginTop: '4px'
                                    }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); runWalkthrough(p); }}
                                            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', padding: '8px', cursor: 'pointer', fontFamily: 'Inter', fontSize: '13px' }}
                                        >
                                            ▶ Запустить проход
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>
            )}

            <main style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {!isSidebarVisible && (
                    <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
                        <Columns3 size={20} style={{ cursor: 'pointer', color: '#666' }} onClick={() => setIsSidebarVisible(true)} />
                    </div>
                )}

                {selectedNode && (
                    <Toolbar
                        onDelete={deleteSelectedNode}
                        onColorChange={(c) => onNodeDataChange('color', c)}
                        onTextColorChange={(c) => onNodeDataChange('textColor', c)}
                        onFontSizeChange={(s) => onNodeDataChange('fontSize', s)}
                        onShapeChange={(s) => onNodeDataChange('shape', s)}
                        currentData={selectedNode.data}
                    />
                )}

                <header style={{ height: '56px', width: '100%', background: '#FFFFFF', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', padding: '0 24px', zIndex: 5 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px' }}>{activeProject.name}</span>
                </header>

                <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                    <ReactFlow
                        nodes={nodesForFlow}
                        edges={edgesForFlow}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onConnectEnd={onConnectEnd}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                    >
                        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#CCCCCC" />
                    </ReactFlow>

                    <div style={{ position: 'absolute', bottom: '24px', right: '24px', height: '36px', background: '#F5F5F5', borderRadius: '10px', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '16px', zIndex: 10 }}>
                        <Minus size={14} onClick={() => zoomOut()} style={{ cursor: 'pointer', color: '#666666' }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px' }}>{zoomPercent}%</span>
                        <Plus size={14} onClick={() => zoomIn()} style={{ cursor: 'pointer', color: '#666666' }} />
                    </div>
                </div>

                {activeWalkthrough && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(255, 255, 255, 0.98)', zIndex: 1000,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '40px', boxSizing: 'border-box'
                    }}>
                        <button
                            onClick={() => setActiveWalkthrough(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={32} />
                        </button>

                        <div style={{ maxWidth: '600px', textAlign: 'center', marginBottom: '48px' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Inter' }}>{activeWalkthrough.currentNode.data.label}</h2>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {activeWalkthrough.project.edges
                                .filter(e => e.source === activeWalkthrough.currentNode.id)
                                .map(edge => (
                                    <button
                                        key={edge.id}
                                        onClick={() => goToNextNode(edge.id)}
                                        style={{
                                            padding: '16px 32px', borderRadius: '12px', border: '1px solid #000',
                                            background: '#FFF', cursor: 'pointer', fontWeight: 600, fontSize: '16px', fontFamily: 'Inter'
                                        }}
                                    >
                                        {(edge.data as { label?: string })?.label || "Далее "}
                                    </button>
                                ))
                            }
                        </div>

                        {activeWalkthrough.project.edges.filter(e => e.source === activeWalkthrough.currentNode.id).length === 0 && (
                            <p style={{ color: '#666', fontFamily: 'Inter' }}>Конец пути.</p>
                        )}
                    </div>
                )}
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