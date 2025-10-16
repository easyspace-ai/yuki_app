'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';

type PromptItem = {
  id: string;
  title: string;
  content: string;
};

interface PromptManagerProps {
  className?: string;
}

export default function PromptManager({ className }: PromptManagerProps) {
  const [items, setItems] = useState<PromptItem[]>([
    { id: 'p-1', title: '写会议纪要', content: '请根据以下要点整理一份会议纪要：参会人员、议题、决策、待办...' },
    { id: 'p-2', title: '润色段落', content: '请优化以下文本的表达，使其更简洁、连贯且专业：' },
  ]);
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q));
  }, [items, filter]);

  const startEdit = (item?: PromptItem) => {
    if (item) {
      setEditingId(item.id);
      setDraftTitle(item.title);
      setDraftContent(item.content);
    } else {
      setEditingId('new');
      setDraftTitle('');
      setDraftContent('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftTitle('');
    setDraftContent('');
  };

  const saveEdit = () => {
    const title = draftTitle.trim();
    const content = draftContent.trim();
    if (!title || !content) return;
    if (editingId === 'new') {
      setItems(prev => [{ id: `p-${Date.now()}`, title, content }, ...prev]);
    } else if (editingId) {
      setItems(prev => prev.map(i => (i.id === editingId ? { ...i, title, content } : i)));
    }
    cancelEdit();
  };

  const remove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className={className + ' h-full flex flex-col overflow-hidden'}>
      <div className="p-3 flex items-center gap-2">
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="搜索提示词..." className="h-8" />
        <Button size="sm" onClick={() => startEdit()} className="h-8"><Plus className="w-4 h-4" /></Button>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-1 gap-0 flex-1 min-h-0">
        {editingId && (
          <div className="p-3 space-y-2">
            <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="标题" />
            <Textarea value={draftContent} onChange={(e) => setDraftContent(e.target.value)} placeholder="内容" className="min-h-[100px]" />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={cancelEdit}><X className="w-4 h-4 mr-1" />取消</Button>
              <Button size="sm" onClick={saveEdit}><Check className="w-4 h-4 mr-1" />保存</Button>
            </div>
          </div>
        )}
        <ScrollArea className="flex-1 min-h-0 px-3">
          <div className="space-y-2 py-2">
            {filtered.map(item => (
              <div key={item.id} className="rounded-md border p-3 bg-card text-card-foreground">
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate mr-2">{item.title}</div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(item)} title="编辑">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(item.id)} title="删除">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">
                  {item.content}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-sm text-muted-foreground py-8 text-center">暂无匹配项</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}


