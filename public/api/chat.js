// 简单的模拟 API 响应
// 在实际项目中，这里应该连接到真实的 AI 服务

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'Invalid messages format' });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return res.status(400).json({ message: 'Last message must be from user' });
  }

  // 模拟 AI 响应
  const responses = [
    `我理解你的需求："${lastMessage.content}"。让我为你提供一些建议...`,
    `关于"${lastMessage.content}"，我建议你可以考虑以下几个方面：\n\n1. 明确目标和受众\n2. 结构化内容组织\n3. 使用清晰的语言表达\n4. 添加具体的例子或案例`,
    `这是一个很好的问题！"${lastMessage.content}"涉及到多个层面的思考。让我为你详细分析一下...`,
    `基于你的请求"${lastMessage.content}"，我为你整理了以下要点：\n\n• 核心观点明确\n• 逻辑结构清晰\n• 语言表达准确\n• 内容充实有据`,
    `针对"${lastMessage.content}"这个话题，我建议你从以下几个角度来思考：\n\n**分析角度：**\n- 现状分析\n- 问题识别\n- 解决方案\n\n**实施建议：**\n- 具体步骤\n- 时间规划\n- 资源需求`
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  // 模拟延迟
  setTimeout(() => {
    res.status(200).json({
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: randomResponse,
      timestamp: new Date().toISOString()
    });
  }, 1000 + Math.random() * 2000);
}
