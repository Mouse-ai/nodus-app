import React, { useState } from 'react';
import {
    Trash2,
    Square,
    Circle,
    Triangle,
    Diamond,
    Baseline,
    PaintBucket,
    ChevronDown
} from 'lucide-react';

// --- Константы ---
const COLORS = [
    '#FFFFFF', '#F5F5F5', '#E0E0E0', '#9E9E9E',
    '#FFEBEE', '#FCE4EC', '#F3E5F5', '#E8EAF6',
    '#E3F2FD', '#E1F5FE', '#E0F7FA', '#E0F2F1',
    '#E8F5E9', '#F1F8E9', '#FFFDE7', '#FFF3E0'
];

const FONT_SIZES = [12, 14, 16, 18, 24, 32, 48];

// --- Стили ---
const toolbarContainerStyle: React.CSSProperties = {
    position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
    background: '#fff', padding: '6px', borderRadius: '14px', border: '1px solid #EFEFEF',
    display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
};

const btnStyle: React.CSSProperties = {
    width: '36px', height: '36px', borderRadius: '10px', border: 'none',
    background: 'transparent', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s'
};

const dividerStyle: React.CSSProperties = { width: '1px', height: '24px', background: '#F0F0F0', margin: '0 4px' };

const colorGridStyle: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '8px'
};

// --- Вспомогательные компоненты ---
const MenuWrapper = ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <div style={{
        position: 'absolute', top: '120%', left: '50%', transform: 'translateX(-50%)',
        background: '#fff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        border: '1px solid #EFEFEF', padding: '8px', zIndex: 100, minWidth: '120px'
    }}>
        {title && <div style={{ fontSize: '10px', color: '#999', marginBottom: '8px', textAlign: 'center', fontWeight: 600 }}>{title}</div>}
        {children}
    </div>
);

// --- Интерфейс ---
interface ToolbarProps {
    onDelete: () => void;
    onColorChange: (color: string) => void;
    onTextColorChange: (color: string) => void;
    onFontSizeChange: (size: number) => void;
    onShapeChange: (shape: 'square' | 'circle' | 'diamond' | 'triangle') => void;
    currentData: { color?: string, textColor?: string, fontSize?: number, shape?: string };
}

export function Toolbar({ onDelete, onColorChange, onTextColorChange, onFontSizeChange, onShapeChange, currentData }: ToolbarProps) {
    const [activeMenu, setActiveMenu] = useState<'shape' | 'size' | 'text' | 'bg' | null>(null);

    const toggleMenu = (menu: 'shape' | 'size' | 'text' | 'bg') => {
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    return (
        <div style={toolbarContainerStyle}>
            {/* Shape Selector */}
            <div style={{ position: 'relative' }}>
                <button onClick={() => toggleMenu('shape')} style={btnStyle} title="Изменить форму">
                    <Square size={18} />
                </button>
                {activeMenu === 'shape' && (
                    <MenuWrapper title="SHAPE">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button onClick={() => { onShapeChange('square'); setActiveMenu(null); }} style={btnStyle}><Square size={16} /></button>
                            <button onClick={() => { onShapeChange('circle'); setActiveMenu(null); }} style={btnStyle}><Circle size={16} /></button>
                            <button onClick={() => { onShapeChange('triangle'); setActiveMenu(null); }} style={btnStyle}><Triangle size={16} /></button>
                            <button onClick={() => { onShapeChange('diamond'); setActiveMenu(null); }} style={btnStyle}><Diamond size={16} /></button>
                        </div>
                    </MenuWrapper>
                )}
            </div>

            <div style={dividerStyle} />

            {/* Font Size */}
            <div style={{ position: 'relative' }}>
                <button onClick={() => toggleMenu('size')} style={{ ...btnStyle, width: 'auto', padding: '0 8px', gap: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{currentData?.fontSize || 16}</span>
                    <ChevronDown size={12} />
                </button>
                {activeMenu === 'size' && (
                    <MenuWrapper title="SIZE">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {FONT_SIZES.map(size => (
                                <button key={size} onClick={() => { onFontSizeChange(size); setActiveMenu(null); }} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px' }}>
                                    {size}px
                                </button>
                            ))}
                        </div>
                    </MenuWrapper>
                )}
            </div>

            <div style={dividerStyle} />

            {/* Text Color */}
            <div style={{ position: 'relative' }}>
                <button onClick={() => toggleMenu('text')} style={btnStyle}>
                    <Baseline size={18} color={currentData?.textColor || '#000'} />
                </button>
                {activeMenu === 'text' && (
                    <MenuWrapper title="TEXT">
                        <div style={colorGridStyle}>
                            {COLORS.map(c => (
                                <button key={c} onClick={() => { onTextColorChange(c); setActiveMenu(null); }}
                                        style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: '1px solid #EEE', cursor: 'pointer' }} />
                            ))}
                        </div>
                    </MenuWrapper>
                )}
            </div>

            {/* Background Color */}
            <div style={{ position: 'relative' }}>
                <button onClick={() => toggleMenu('bg')} style={btnStyle}>
                    <PaintBucket size={18} />
                </button>
                {activeMenu === 'bg' && (
                    <MenuWrapper title="FILL">
                        <div style={colorGridStyle}>
                            {COLORS.map(c => (
                                <button key={c} onClick={() => { onColorChange(c); setActiveMenu(null); }}
                                        style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: '1px solid #EEE', cursor: 'pointer' }} />
                            ))}
                        </div>
                    </MenuWrapper>
                )}
            </div>

            <div style={dividerStyle} />

            {/* Delete */}
            <button onClick={onDelete} style={{ ...btnStyle, color: '#FF4D4D' }} title="Удалить">
                <Trash2 size={18} />
            </button>
        </div>
    );
}