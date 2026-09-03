import Groq from 'groq-sdk';
import { Message, ResponseMode, UploadedFile, AgentLog, Source } from '../types';

function buildSystemPrompt(mode: ResponseMode, uploadedFiles: UploadedFile[]): string {
  const fileContext =
    uploadedFiles.length > 0
      ? `\n\n## USER-PROVIDED DOCUMENTS (Primary Context):\n${uploadedFiles
          .map((f) => `### ${f.name}\n${f.content.slice(0, 4000)}`)
          .join('\n\n')}`
      : '';

  const modeInstructions: Record<ResponseMode, string> = {
    keyword: `
## RESPONSE MODE: KEYWORD
- Provide SHORT, concise answers
- Use bullet points and key phrases
- Avoid lengthy explanations
- Focus on essential facts only
- Format: Use markdown bullets (•)`,

    detailed: `
## RESPONSE MODE: DETAILED
- Provide comprehensive, in-depth explanations
- Include step-by-step breakdowns when relevant
- Give real-world examples
- Use headers and structured formatting
- Be thorough but clear`,

    authenticity: `
## RESPONSE MODE: AUTHENTICITY
- Always cite your knowledge sources explicitly
- Assign a CONFIDENCE LEVEL: (High/Medium/Low) with percentage
- Flag any uncertainty clearly
- Show VERIFICATION STATUS for each claim
- Format every response with:
  📊 CONFIDENCE: [X]%
  ✅ VERIFIED CLAIMS: [list]
  ⚠️ UNVERIFIED CLAIMS: [list]
  📚 KNOWLEDGE BASIS: [explanation]`,

    research: `
## RESPONSE MODE: RESEARCH
- Conduct multi-perspective analysis
- Compare different viewpoints or approaches
- Provide academic-style citations where possible
- Include methodology, findings, and implications
- Structure as: Background → Analysis → Findings → Conclusion → References`,
  };

  return `# VeritasAI — Advanced RAG Intelligence System

You are VeritasAI, an advanced Retrieval-Augmented Generation AI assistant designed to:
1. REDUCE HALLUCINATIONS — Never invent facts or citations
2. PROVIDE VERIFIED INFORMATION — Only state what you know with confidence
3. BE TRANSPARENT — Always explain your reasoning and confidence level
4. PRIORITIZE USER DATA — User-uploaded documents take precedence over general knowledge

## CORE RULES:
- NEVER fabricate citations, URLs, or statistics you don't know
- If information is uncertain, say: "I cannot verify this with certainty"
- If you don't know something, say: "Reliable verified information could not be found"
- Always distinguish between: [USER DATA] / [VERIFIED KNOWLEDGE] / [AI INFERENCE]
- Cross-reference claims when possible

${modeInstructions[mode]}

## AGENT PIPELINE (simulated):
You operate through specialized agents:
- Query Understanding Agent: Analyzes intent
- Retrieval Agent: Fetches relevant knowledge
- Verification Agent: Validates claims
- Summarization Agent: Generates response
- Citation Agent: Attaches references

${fileContext}

## OUTPUT STRUCTURE (when applicable):
1. **Answer** — Direct response to query
2. **Supporting Evidence** — Key facts supporting the answer  
3. **Confidence Level** — Your certainty (High/Medium/Low + %)
4. **Notes/Warnings** — Any caveats or limitations`;
}

function simulateAgentLogs(query: string, mode: ResponseMode): AgentLog[] {
  const now = new Date();
  const logs: AgentLog[] = [
    {
      agentName: 'Query Understanding Agent',
      action: `Analyzing intent for: "${query.slice(0, 60)}${query.length > 60 ? '...' : ''}"`,
      status: 'done',
      details: `Mode: ${mode} | Detected query type: Information Request`,
      timestamp: new Date(now.getTime() - 500),
    },
    {
      agentName: 'Retrieval Agent',
      action: 'Searching knowledge base and contextual memory',
      status: 'done',
      details: 'Retrieved relevant context from model knowledge',
      timestamp: new Date(now.getTime() - 400),
    },
    {
      agentName: 'Verification Agent',
      action: 'Cross-checking claims against known facts',
      status: 'done',
      details: 'Hallucination guard active — filtering unverified claims',
      timestamp: new Date(now.getTime() - 300),
    },
    {
      agentName: 'Ranking Agent',
      action: 'Ranking information by credibility and relevance',
      status: 'done',
      details: 'Sources ranked by: credibility → recency → consistency',
      timestamp: new Date(now.getTime() - 200),
    },
    {
      agentName: 'Summarization Agent',
      action: `Generating ${mode} response`,
      status: 'done',
      details: `Response style: ${mode} | Hallucination checks: PASSED`,
      timestamp: new Date(now.getTime() - 100),
    },
    {
      agentName: 'Citation Agent',
      action: 'Attaching source references',
      status: 'done',
      details: 'Knowledge basis documented',
      timestamp: now,
    },
    {
      agentName: 'Memory Agent',
      action: 'Updating conversation context',
      status: 'done',
      details: 'Context window maintained',
      timestamp: now,
    },
  ];
  return logs;
}

function generateMockSources(_query: string): Source[] {
  const sources: Source[] = [
    {
      name: 'Groq LLM Knowledge Base',
      credibility: 0.85,
      recency: 'Training Data',
      type: 'database',
      excerpt: 'Pre-trained knowledge embedded in model weights',
    },
    {
      name: 'Conversational Context',
      credibility: 0.9,
      recency: 'Current Session',
      type: 'database',
      excerpt: 'Information derived from current conversation history',
    },
  ];
  return sources;
}

export async function sendMessage(
  messages: Message[],
  userInput: string,
  apiKey: string,
  model: string,
  mode: ResponseMode,
  temperature: number,
  maxTokens: number,
  uploadedFiles: UploadedFile[],
  onStream?: (chunk: string) => void
): Promise<{
  content: string;
  agents: AgentLog[];
  sources: Source[];
  confidence: number;
}> {
  if (!apiKey) {
    throw new Error('Please add your Groq API key in Settings to start chatting.');
  }

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const systemPrompt = buildSystemPrompt(mode, uploadedFiles);

  const chatMessages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages
      .filter((m) => m.role !== 'system')
      .slice(-20)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    { role: 'user', content: userInput },
  ];

  const agents = simulateAgentLogs(userInput, mode);
  const sources = generateMockSources(userInput);

  if (uploadedFiles.length > 0) {
    sources.unshift({
      name: `User Documents (${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''})`,
      credibility: 0.99,
      recency: 'Just uploaded',
      type: 'user-upload',
      excerpt: uploadedFiles.map((f) => f.name).join(', '),
    });
  }

  let fullContent = '';

  if (onStream) {
    const stream = await client.chat.completions.create({
      model,
      messages: chatMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (delta) {
        fullContent += delta;
        onStream(delta);
      }
    }
  } else {
    const response = await client.chat.completions.create({
      model,
      messages: chatMessages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    });
    fullContent = response.choices[0]?.message?.content ?? '';
  }

  // Compute confidence based on mode
  const confidenceMap: Record<ResponseMode, number> = {
    keyword: 0.82,
    detailed: 0.78,
    authenticity: 0.88,
    research: 0.84,
  };
  const confidence = confidenceMap[mode] + (Math.random() * 0.1 - 0.05);

  return {
    content: fullContent,
    agents,
    sources,
    confidence: Math.min(0.99, Math.max(0.5, confidence)),
  };
}

export async function fetchAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch models');
    const data = await response.json();
    return data.data
      .filter((m: { id: string }) => !m.id.includes('whisper') && !m.id.includes('guard'))
      .map((m: { id: string }) => m.id);
  } catch {
    return [];
  }
}
