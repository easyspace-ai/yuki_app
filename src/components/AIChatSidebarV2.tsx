'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  RefreshCw, 
  Sparkles,
  Settings,
  X,
  Loader2,
  MessageSquare,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AIChatSidebarProps {
  className?: string;
}

export const AIChatSidebarV2 = ({ className }: AIChatSidebarProps) => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 使用 AI SDK 的 useChat hook
  const {
    messages,
    input: chatInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    append,
    setMessages
  } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是你的 AI 写作助手，可以帮助你：\n\n• 📝 文档创作和编辑\n• 🎯 内容优化建议\n• 📊 结构化写作指导\n• 🔍 语法和风格检查\n\n有什么我可以帮助你的吗？',
      }
    ],
    onError: (error) => {
      console.error('Chat error:', error);
      toast({
        title: "连接失败",
        description: "无法连接到 AI 服务，请检查网络连接",
        variant: "destructive",
      });
    },
    onFinish: () => {
      setIsTyping(false);
    },
    onResponse: () => {
      setIsTyping(true);
    }
  });

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (!input.trim() || isLoading) return;

    if (e) {
      e.preventDefault();
    }

    const userMessage = input.trim();
    setInput('');

    // 使用 append 方法发送消息
    await append({
      role: 'user',
      content: userMessage,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "已复制",
        description: "内容已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制内容到剪贴板",
        variant: "destructive",
      });
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是你的 AI 写作助手，可以帮助你：\n\n• 📝 文档创作和编辑\n• 🎯 内容优化建议\n• 📊 结构化写作指导\n• 🔍 语法和风格检查\n\n有什么我可以帮助你的吗？',
      }
    ]);
    toast({
      title: "对话已清空",
      description: "开始新的对话",
    });
  };

  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toISOString()
      }))
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "导出成功",
      description: "聊天记录已导出",
    });
  };

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  // 快速回复建议
  const quickReplies = [
    "帮我写一份会议纪要",
    "优化这段文字的表达",
    "检查语法错误",
    "提供写作建议"
  ];

  const handleQuickReply = (reply: string) => {
    setInput(reply);
  };

  return (
    <div className={cn(
      "h-full bg-background border-l border-border flex flex-col transition-all duration-200 ease-out",
      isExpanded ? "w-80" : "w-12",
      className
    )}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        {isExpanded && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary text-primary-foreground">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-sm font-medium text-foreground">AI 写作助手</span>
            {isLoading && (
              <Badge variant="secondary" className="text-xs">
                <Loader2 className="w-2 h-2 animate-spin mr-1" />
                思考中
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center space-x-1">
          {isExpanded && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="h-6 w-6 p-0"
                title="清空对话"
                disabled={isLoading}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportChat}
                className="h-6 w-6 p-0"
                title="导出对话"
                disabled={messages.length <= 1}
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="设置"
                disabled={isLoading}
              >
                <Settings className="w-3 h-3" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
            title={isExpanded ? "收起" : "展开"}
          >
            {isExpanded ? <X className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* 消息区域 */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 group",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                      <Bot className="w-3 h-3" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm relative",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-foreground"
                  )}>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className={cn(
                      "flex items-center space-x-1 mt-2 transition-opacity",
                      message.role === 'assistant' 
                        ? "opacity-0 group-hover:opacity-100" 
                        : "opacity-0 group-hover:opacity-100"
                    )}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-5 w-5 p-0"
                        title="复制内容"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      {message.role === 'assistant' && index === messages.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reload()}
                          disabled={isLoading}
                          className="h-5 w-5 p-0"
                          title="重新生成"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-muted text-muted-foreground flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="bg-muted text-foreground rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>AI 正在思考...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 错误状态 */}
              {error && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-destructive text-destructive-foreground flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </div>
                  <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>连接失败，请重试</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reload()}
                        className="h-5 w-5 p-0 ml-2"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 快速回复建议 */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">快速开始：</div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickReplies.map((reply, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs h-8 p-2 text-left justify-start"
                        disabled={isLoading}
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator />

          {/* 输入区域 */}
          <div className="p-3">
            <form onSubmit={handleSendMessage} className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息... (Shift+Enter 换行，Enter 发送)"
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {isLoading ? "AI 正在回复..." : "按 Enter 发送，Shift+Enter 换行"}
                </div>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="h-8"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
            
            <div className="mt-2 text-xs text-muted-foreground text-center">
              AI 可能产生不准确的信息，请验证重要内容
            </div>
          </div>
        </>
      )}
    </div>
  );
};
