import { useState, useRef, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { DirectoryTree } from "./DirectoryTree";
import { DraggableTabSystem } from "./DraggableTabSystem";
import { RightSidebar } from "./RightSidebar";
import { ThemeSwitch } from "./ThemeSwitch";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { PanelLeft, PanelRight } from "lucide-react";

interface Tab {
  id: string;
  title: string;
  content: string;
  type: "markdown";
}

export const ObsidianLayout = () => {
  const [openTabs, setOpenTabs] = useState<Tab[]>([
    { id: "tab1", title: "新标签页", content: "# 欢迎使用 Obsidian 风格编辑器\n\n开始编写您的内容...", type: "markdown" },
  ]);
  const [activeTab, setActiveTab] = useState("tab1");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const { toast } = useToast();
  
  // 计算面板尺寸
  const getMainPanelSize = () => {
    if (leftSidebarOpen && rightSidebarOpen) return 60;
    if (leftSidebarOpen || rightSidebarOpen) return 80;
    return 100;
  };
  
  const getSidebarSize = () => {
    if (leftSidebarOpen && rightSidebarOpen) return 20;
    return 20;
  };

  // 强制重新渲染ResizablePanelGroup的key
  const panelGroupKey = `${leftSidebarOpen ? 'L' : 'l'}-${rightSidebarOpen ? 'R' : 'r'}`;

  const handleTabClose = (tabId: string) => {
    const newTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(newTabs);
    
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const handleFileOpen = (fileName: string) => {
    // Check if file is already open
    const existingTab = openTabs.find(tab => tab.title === fileName);
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: fileName,
      content: `# ${fileName}\n\n这是 ${fileName} 的内容...`,
      type: "markdown"
    };
    
    setOpenTabs([...openTabs, newTab]);
    setActiveTab(newTab.id);
  };

  const handleFileCreate = (fileName: string, type: string) => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: fileName,
      content: type === "markdown" ? `# ${fileName}\n\n` : "",
      type: "markdown"
    };
    
    setOpenTabs([...openTabs, newTab]);
    setActiveTab(newTab.id);
    toast({
      title: "文件已创建",
      description: `${fileName} 已成功创建`,
    });
  };

  const handleFileDelete = (fileName: string) => {
    // Close tab if open
    const tabToClose = openTabs.find(tab => tab.title === fileName);
    if (tabToClose) {
      handleTabClose(tabToClose.id);
    }
    
    toast({
      title: "文件已删除",
      description: `${fileName} 已被删除`,
      variant: "destructive",
    });
  };

  const handleNewFile = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: "新标签页",
      content: "# 新文档\n\n开始编写...",
      type: "markdown"
    };
    
    setOpenTabs([...openTabs, newTab]);
    setActiveTab(newTab.id);
  };

  const handleSave = () => {
    toast({
      title: "已保存",
      description: "文档已保存到本地",
    });
  };

  const handleTabAdd = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: "新标签页",
      content: "# 新文档\n\n开始编写...",
      type: "markdown"
    };
    
    setOpenTabs([...openTabs, newTab]);
    setActiveTab(newTab.id);
  };

  const handleTabsReorder = (newTabs: Tab[]) => {
    setOpenTabs(newTabs);
  };

  const handleContentChange = (tabId: string, content: string) => {
    setOpenTabs(tabs => 
      tabs.map(tab => 
        tab.id === tabId ? { ...tab, content } : tab
      )
    );
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  // 添加延迟以确保DOM更新完成
  useEffect(() => {
    // 当侧边栏状态改变时，强制重新计算布局
    const timer = setTimeout(() => {
      // 触发窗口resize事件来重新计算布局
      window.dispatchEvent(new Event('resize'));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [leftSidebarOpen, rightSidebarOpen]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewFile: handleNewFile,
    onSave: handleSave,
    onCloseTab: () => {
      if (activeTab) {
        handleTabClose(activeTab);
      }
    },
  });

  return (
    <div className="h-screen bg-white text-gray-900 overflow-hidden">
      <ResizablePanelGroup 
        direction="horizontal" 
        className="h-full"
        key={panelGroupKey}
      >
        {/* Left Sidebar - Conditionally Rendered */}
        {leftSidebarOpen && (
          <>
        <ResizablePanel defaultSize={getSidebarSize()} minSize={15} maxSize={35}>
              <div className="h-full flex flex-col">
                {/* Left Sidebar Tab Headers */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                  <div className="flex items-center space-x-1">
                    <button className="p-1.5 border-2 border-red-500 hover:bg-gray-200 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
        </div>
                  <button 
                    onClick={toggleLeftSidebar}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <PanelLeft className="w-4 h-4" />
                  </button>
      </div>

                {/* Left Sidebar Content - Calendar */}
                <div className="flex-1 p-4">
          <DirectoryTree 
            onFileOpen={handleFileOpen}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
          />
                </div>
                
                {/* Left Sidebar Footer */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span className="text-sm text-gray-600">cms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
        </ResizablePanel>
        
            <ResizableHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
          </>
        )}
        
        {/* Main Content Area */}
        <ResizablePanel defaultSize={getMainPanelSize()} minSize={40}>
          <div className="h-full flex flex-col">
            {/* Main Content Header - Dynamic Based on Sidebar State */}
            <div className="bg-gray-50 text-gray-900 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Show sidebar toggle buttons when sidebars are closed */}
                {!leftSidebarOpen && (
                  <button 
                    onClick={toggleLeftSidebar}
                    className="p-1 hover:bg-gray-200 rounded transition-colors mr-2"
                  >
                    <PanelRight className="w-4 h-4" />
                  </button>
                )}
                
                <span className="text-sm">Year 2025 &gt; Week 42 &gt;</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">2025-10-16</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                
                {/* Show sidebar toggle buttons when sidebars are closed */}
                {!rightSidebarOpen && (
                  <button 
                    onClick={toggleRightSidebar}
                    className="p-1 hover:bg-gray-200 rounded transition-colors ml-2"
                  >
                    <PanelLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Main Content Body */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-gray-900 mb-4">2025-10-16</div>
              <div className="text-sm text-gray-500">按/键输入命令</div>
              
              {/* Original Tab System - Hidden for now */}
              <div className="hidden">
          <DraggableTabSystem 
            tabs={openTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onTabClose={handleTabClose}
            onTabSplit={(tabId, direction) => {
                    // TODO: Implement tab split functionality
            }}
            onTabsReorder={handleTabsReorder}
            onTabAdd={handleTabAdd}
            onContentChange={handleContentChange}
          />
              </div>
            </div>
          </div>
        </ResizablePanel>
        
        {/* Right Sidebar - Conditionally Rendered */}
        {rightSidebarOpen && (
          <>
            <ResizableHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
        
            <ResizablePanel defaultSize={getSidebarSize()} minSize={15} maxSize={35}>
              <div className="h-full flex flex-col">
                {/* Right Sidebar Tab Headers */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                  <div className="flex items-center space-x-1">
                    <button className="p-1.5 border-b-2 border-gray-800 text-gray-800 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  <button 
                    onClick={toggleRightSidebar}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <PanelRight className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Right Sidebar Content */}
                <div className="flex-1 p-4">
                  <div className="space-y-4">
                    <textarea 
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={6}
                      placeholder="在此输入您的消息。按@提及资源"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">gemma3:4b@ollama</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      <Toaster />
    </div>
  );
};