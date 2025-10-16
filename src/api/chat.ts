import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// 配置 OpenAI（实际项目中从环境变量获取）
const apiKey = process.env.OPENAI_API_KEY || 'your-api-key-here';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const result = streamText({
      model: openai('gpt-3.5-turbo', {
        apiKey,
      }),
      messages,
      system: `你是一个专业的写作助手，专门帮助用户进行文档创作、编辑和优化。
      
      你的特点：
      - 理解中文和英文
      - 擅长 Markdown 格式
      - 提供结构化的建议
      - 保持专业和友好的语调
      - 针对用户的具体需求提供个性化帮助
      
      请根据用户的请求提供有用的建议和帮助。`,
      maxTokens: 1000,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
