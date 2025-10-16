'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  RefreshCw, 
  Sparkles,
  Settings,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatSidebarProps {
  className?: string;
}

export const AIChatSidebar = ({ className }: AIChatSidebarProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的 AI 助手，可以帮助你处理文档、回答问题或协助创作。有什么我可以帮助你的吗？',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 模拟 AI 响应（实际项目中替换为真实的 AI API 调用）
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // 简单的响应逻辑
    const responses = [
      `我理解你的问题："${userMessage}"。让我为你分析一下...`,
      `关于"${userMessage}"，我建议你可以考虑以下几个方面...`,
      `这是一个很好的问题！"${userMessage}"涉及到多个层面的思考...`,
      `基于你的需求"${userMessage}"，我为你整理了以下要点...`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(userMessage.content);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "发送失败",
        description: "消息发送失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        content: '你好！我是你的 AI 助手，可以帮助你处理文档、回答问题或协助创作。有什么我可以帮助你的吗？',
        timestamp: new Date()
      }
    ]);
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const previousUserMessage = messages[messageIndex - 1];
    if (!previousUserMessage || previousUserMessage.role !== 'user') return;

    setIsLoading(true);
    try {
      const newResponse = await generateAIResponse(previousUserMessage.content);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newResponse, timestamp: new Date() }
          : msg
      ));
    } catch (error) {
      toast({
        title: "重新生成失败",
        description: "无法重新生成响应，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

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
            <span className="text-sm font-medium text-foreground">AI 助手</span>
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
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="设置"
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
            {isExpanded ? <X className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* 消息区域 */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                      <Bot className="w-3 h-3" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-foreground"
                  )}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={cn(
                      "text-xs mt-1 opacity-70",
                      message.role === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content)}
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => regenerateResponse(message.id)}
                          disabled={isLoading}
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
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
            </div>
          </ScrollArea>

          <Separator />

          {/* 输入区域 */}
          <div className="p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息... (Shift+Enter 换行，Enter 发送)"
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground text-center">
              AI 可能产生不准确的信息，请验证重要内容
            </div>
          </div>
        </>
      )}
    </div>
  );
};
