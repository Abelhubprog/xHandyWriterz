import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import {
  Bold, Italic, Underline, Code, Link, Image, Video, Music,
  Quote, List, ListOrdered, Table, AlignLeft, AlignCenter,
  AlignRight, Heading1, Heading2, Heading3, Type, Palette,
  Eye, Save, Upload, MessageSquare, Users, Clock, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { ContentBlock, EditorState } from '@/types/publishing';

interface RichEditorProps {
  initialContent?: ContentBlock[];
  onContentChange?: (content: ContentBlock[]) => void;
  onSave?: () => void;
  readOnly?: boolean;
  showCollaboration?: boolean;
  documentId?: string;
  className?: string;
}

interface EditorTool {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

export const RichEditor: React.FC<RichEditorProps> = ({
  initialContent = [],
  onContentChange,
  onSave,
  readOnly = false,
  showCollaboration = false,
  documentId,
  className = '',
}) => {
  const [content, setContent] = useState<ContentBlock[]>(initialContent);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    documentId: documentId || '',
    content,
    collaborators: [],
    lastSaved: new Date().toISOString(),
    hasChanges: false,
  });
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [currentFont, setCurrentFont] = useState('Inter');
  const [fontSize, setFontSize] = useState(16);

  const editorRef = useRef<HTMLDivElement>(null);

  // Font options for enterprise publishing
  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro',
    'Merriweather', 'Georgia', 'Times New Roman',
    'Fira Code', 'JetBrains Mono', 'Source Code Pro'
  ];

  const addBlock = useCallback((type: ContentBlock['type'], initialData = {}) => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: { text: '', ...initialData },
      order: content.length,
    };

    const newContent = [...content, newBlock];
    setContent(newContent);
    onContentChange?.(newContent);
    setEditorState(prev => ({ ...prev, content: newContent, hasChanges: true }));
  }, [content, onContentChange]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    const newContent = content.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    setContent(newContent);
    onContentChange?.(newContent);
    setEditorState(prev => ({ ...prev, content: newContent, hasChanges: true }));
  }, [content, onContentChange]);

  const deleteBlock = useCallback((blockId: string) => {
    const newContent = content.filter(block => block.id !== blockId);
    setContent(newContent);
    onContentChange?.(newContent);
    setEditorState(prev => ({ ...prev, content: newContent, hasChanges: true }));
  }, [content, onContentChange]);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const blockIndex = content.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= content.length) return;

    const newContent = [...content];
    [newContent[blockIndex], newContent[newIndex]] = [newContent[newIndex], newContent[blockIndex]];

    // Update order
    newContent.forEach((block, index) => {
      block.order = index;
    });

    setContent(newContent);
    onContentChange?.(newContent);
    setEditorState(prev => ({ ...prev, content: newContent, hasChanges: true }));
  }, [content, onContentChange]);

  // Editor toolbar tools
  const tools: EditorTool[] = [
    {
      id: 'heading1',
      label: 'Heading 1',
      icon: Heading1,
      action: () => addBlock('heading', { level: 1 }),
    },
    {
      id: 'heading2',
      label: 'Heading 2',
      icon: Heading2,
      action: () => addBlock('heading', { level: 2 }),
    },
    {
      id: 'heading3',
      label: 'Heading 3',
      icon: Heading3,
      action: () => addBlock('heading', { level: 3 }),
    },
    { id: 'sep1', label: '', icon: Separator, action: () => {}, separator: true },
    {
      id: 'paragraph',
      label: 'Paragraph',
      icon: Type,
      action: () => addBlock('paragraph'),
    },
    {
      id: 'code',
      label: 'Code Block',
      icon: Code,
      action: () => addBlock('code', { language: 'javascript' }),
    },
    {
      id: 'quote',
      label: 'Quote',
      icon: Quote,
      action: () => addBlock('quote'),
    },
    { id: 'sep2', label: '', icon: Separator, action: () => {}, separator: true },
    {
      id: 'image',
      label: 'Image',
      icon: Image,
      action: () => addBlock('image'),
    },
    {
      id: 'video',
      label: 'Video',
      icon: Video,
      action: () => addBlock('video'),
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: Music,
      action: () => addBlock('audio'),
    },
    { id: 'sep3', label: '', icon: Separator, action: () => {}, separator: true },
    {
      id: 'list',
      label: 'Bullet List',
      icon: List,
      action: () => addBlock('list', { type: 'bullet' }),
    },
    {
      id: 'ordered',
      label: 'Numbered List',
      icon: ListOrdered,
      action: () => addBlock('list', { type: 'ordered' }),
    },
    {
      id: 'table',
      label: 'Table',
      icon: Table,
      action: () => addBlock('table', { rows: 3, cols: 3 }),
    },
  ];

  const handleSave = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      lastSaved: new Date().toISOString(),
      hasChanges: false,
    }));
    onSave?.();
  }, [onSave]);

  // Auto-save functionality
  useEffect(() => {
    if (!editorState.hasChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [editorState.hasChanges, handleSave]);

  const renderBlock = (block: ContentBlock) => {
    const isSelected = selectedBlockId === block.id;

    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.content.level || 1}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            key={block.id}
            className={`
              font-bold mb-4 cursor-text
              ${block.content.level === 1 ? 'text-3xl lg:text-4xl' : ''}
              ${block.content.level === 2 ? 'text-2xl lg:text-3xl' : ''}
              ${block.content.level === 3 ? 'text-xl lg:text-2xl' : ''}
              ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
            `}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onFocus={() => setSelectedBlockId(block.id)}
            onBlur={(e) => {
              updateBlock(block.id, {
                content: { ...block.content, text: e.currentTarget.textContent || '' }
              });
            }}
            style={{ fontFamily: currentFont, fontSize: `${fontSize + (block.content.level === 1 ? 12 : block.content.level === 2 ? 8 : 4)}px` }}
          >
            {block.content.text}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p
            key={block.id}
            className={`mb-4 leading-relaxed cursor-text ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onFocus={() => setSelectedBlockId(block.id)}
            onBlur={(e) => {
              updateBlock(block.id, {
                content: { ...block.content, text: e.currentTarget.textContent || '' }
              });
            }}
            style={{ fontFamily: currentFont, fontSize: `${fontSize}px` }}
          >
            {block.content.text}
          </p>
        );

      case 'code':
        return (
          <div key={block.id} className={`mb-4 ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
            <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center justify-between">
              <span className="text-gray-300 text-sm">{block.content.language || 'javascript'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCodeEditor(!showCodeEditor)}
                className="text-gray-300 hover:text-white"
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-gray-950 rounded-b-lg p-4">
              {showCodeEditor ? (
                <Editor
                  height="200px"
                  language={block.content.language || 'javascript'}
                  value={block.content.code || ''}
                  onChange={(value) => {
                    updateBlock(block.id, {
                      content: { ...block.content, code: value || '' }
                    });
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'Fira Code, JetBrains Mono, monospace',
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              ) : (
                <pre className="text-gray-100 font-mono text-sm overflow-x-auto">
                  <code>{block.content.code || '// Enter your code here'}</code>
                </pre>
              )}
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className={`mb-4 ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
            {block.content.src ? (
              <div className="relative">
                <img
                  src={block.content.src}
                  alt={block.content.alt || ''}
                  className="w-full rounded-lg"
                  onClick={() => setSelectedBlockId(block.id)}
                />
                {block.content.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic text-center">
                    {block.content.caption}
                  </p>
                )}
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
                onClick={() => setSelectedBlockId(block.id)}
              >
                <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Click to add an image</p>
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div key={block.id} className={`mb-4 ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
            {block.content.src ? (
              <div className="relative">
                <video
                  src={block.content.src}
                  controls
                  className="w-full rounded-lg"
                  onClick={() => setSelectedBlockId(block.id)}
                />
                {block.content.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic text-center">
                    {block.content.caption}
                  </p>
                )}
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
                onClick={() => setSelectedBlockId(block.id)}
              >
                <Video className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Click to add a video</p>
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div key={block.id} className={`mb-4 ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
            {block.content.src ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <audio
                  src={block.content.src}
                  controls
                  className="w-full"
                  onClick={() => setSelectedBlockId(block.id)}
                />
                {block.content.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    {block.content.caption}
                  </p>
                )}
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
                onClick={() => setSelectedBlockId(block.id)}
              >
                <Music className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Click to add an audio file</p>
              </div>
            )}
          </div>
        );

      case 'quote':
        return (
          <blockquote
            key={block.id}
            className={`
              border-l-4 border-blue-500 pl-6 py-4 mb-4 italic text-lg
              bg-blue-50 rounded-r-lg cursor-text
              ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
            `}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onFocus={() => setSelectedBlockId(block.id)}
            onBlur={(e) => {
              updateBlock(block.id, {
                content: { ...block.content, text: e.currentTarget.textContent || '' }
              });
            }}
            style={{ fontFamily: currentFont, fontSize: `${fontSize + 2}px` }}
          >
            {block.content.text || 'Enter your quote here...'}
          </blockquote>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`rich-editor ${className}`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-wrap">
            {tools.map((tool) => (
              tool.separator ? (
                <Separator key={tool.id} orientation="vertical" className="h-6" />
              ) : (
                <Button
                  key={tool.id}
                  variant={tool.isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={tool.action}
                  disabled={tool.disabled || readOnly}
                  title={tool.label}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              )
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Font Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={currentFont}
                onChange={(e) => setCurrentFont(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                {fontOptions.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-16"
              />
              <span className="text-sm text-gray-500">{fontSize}px</span>
            </div>

            {/* Collaboration Status */}
            {showCollaboration && (
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {editorState.collaborators.length} collaborator(s)
                </span>
              </div>
            )}

            {/* Save Status */}
            <div className="flex items-center space-x-2">
              {editorState.hasChanges ? (
                <>
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-600">Unsaved changes</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Saved</span>
                </>
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!editorState.hasChanges || readOnly}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        className="max-w-4xl mx-auto px-6 pb-20"
        style={{ fontFamily: currentFont }}
      >
        {content.length === 0 ? (
          <div className="text-center py-12">
            <Type className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Start writing your content</p>
            <Button onClick={() => addBlock('paragraph')}>
              Add your first paragraph
            </Button>
          </div>
        ) : (
          content.map(renderBlock)
        )}
      </div>

      {/* Floating Add Block Button */}
      {!readOnly && content.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => addBlock('paragraph')}
            size="lg"
            className="rounded-full shadow-lg"
          >
            <Type className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RichEditor;
