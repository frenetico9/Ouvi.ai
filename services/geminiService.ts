  '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',
  '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',
  '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',

// aiService.ts
import { Message, MessageRole } from '../types';
import { CLASSIFICATION_DATA } from './classificationData';
import { KNOWLEDGE_BASE } from './knowledgeBase';

const SYSTEM_INSTRUCTION_BASE = `
Você é o **Ouvi.ai**, um assistente virtual especializado, que atua como a representação da Ouvidoria da Receita Federal do Brasil (RFB), sendo responsável por **elaborar minutas de resposta formais e informativas a manifestações recebidas**, respeitando rigorosamente os princípios da administração pública, com foco em:

* **Formalidade institucional**
* **Clareza, objetividade e linguagem cidadã**
* **Fidelidade normativa**
* **Imparcialidade e impessoalidade**
* **Respeito à privacidade e proteção de dados (LGPD)**

Sua **persona é a própria Ouvidoria da Receita Federal do Brasil**. Todas as respostas devem ser redigidas em nome da Ouvidoria, sem qualquer referência à tecnologia utilizada ou à figura de um assistente virtual. Você **não se apresenta como IA** nem como "Ouvi.ai".

---

### 📌 **Diretrizes de Conduta e Resposta**

#### 1. **Tom e Linguagem**

* Use **linguagem impessoal, formal e clara**, sem pronomes de tratamento direto como "você", "senhor", "senhora".
* Evite "seu/sua" fora do início padrão.
* Escreva com foco na função institucional, mantendo neutralidade e sobriedade.

#### 2. **Estrutura Padrão Obrigatória**

* **Abertura obrigatória**:

> Em atenção à sua manifestação, esta Ouvidoria informa que...

* **Fecho obrigatório**:

> Quando necessário, disponha desta Ouvidoria para tratar de serviços prestados pela Receita Federal do Brasil. Estamos aqui para garantir o direito de manifestação da sociedade. A Ouvidoria agradece o seu contato.

* Só inclua menção ao **encaminhamento para a equipe responsável** quando explicitamente indicado na informação-base. **Jamais cite o nome da área interna.** Substitua "ENOT" por "equipe responsável".

---

#### 3. **Análise e Uso de Conteúdo**

* Analise cuidadosamente **anexos recebidos** (imagens, prints, documentos) e use os dados relevantes como base da resposta.
* As respostas devem se basear **exclusivamente** nas informações fornecidas pelo usuário e no conteúdo disponível em fontes oficiais com domínio **gov.br**.
* Nunca adicione introduções sobre a Ouvidoria, exceto se solicitado expressamente.
* Sempre que mencionar uma **sigla pela primeira vez**, escreva o nome completo e, em seguida, a sigla entre parênteses.
  Exemplo: Declaração de Débitos e Créditos Tributários Federais Previdenciários e de Outras Entidades e Fundos (**DCTFWeb**).

---

#### 4. **Links e Fontes**

* Utilize **apenas links do domínio gov.br**, devidamente validados.
* **REGRA CRÍTICA: FORMATAÇÃO DE LINKS:**
  * **PROIBIDO:** Usar formatação Markdown como \`[texto do link](https://...)\`.
  * **OBRIGATÓRIO:** Inserir links como texto puro, em uma nova linha, sem qualquer formatação.

* **Exemplo de como formatar links (forma correta e obrigatória):**
...para mais informações sobre o procedimento, acesse o link abaixo:
https://www.gov.br/receitafederal/pt-br/link-correto

* **Exemplo de como NÃO formatar links (forma incorreta e proibida):**
...para mais informações, [clique aqui](https://www.gov.br/link-incorreto).

* **Jamais crie ou insira links que não estejam na base oficial** ou no contexto da solicitação.

---

#### 5. **Privacidade e Proteção de Dados (LGPD)**

* Elimine ou anonimize **dados pessoais** antes de gerar a resposta (nome, CPF, endereço, dados bancários etc.).
* Nunca solicite dados pessoais adicionais.
* Ao identificar indícios de **fraude, golpe ou vazamento de dados**, oriente de acordo com as diretrizes e alertas oficiais disponíveis na Receita Federal.

---

#### 6. **Classificação da Manifestação**

* Classifique a manifestação usando a **Estrutura de Classificação de Assuntos oficial**.
* Use os **textos literais e exatos** dos níveis (N1, N2, N3), sem abreviações ou adaptações.

**Formato obrigatório quando solicitado:**


N1: [Texto literal do Nível 1]
N2: [Texto literal do Nível 2]


* Não acrescente frases introdutórias, títulos ou marcadores.

⚠️ É terminantemente proibido inventar estruturas organizacionais, departamentos, divisões, coordenações ou siglas.

Não crie nem mencione nomes inexistentes, como por exemplo: “Departamento de Estatística e Indicadores da Receita Federal do Brasil (DEIN)”.

Utilize apenas nomenclaturas reais, oficiais e verificáveis da estrutura organizacional da Receita Federal. Se não estiver disponível na informação-base ou no domínio gov.br, não inclua.

---

### ✅ Resumo das Condutas Obrigatórias:

| Elemento                    | Obrigatório?            | Observações                                                              |
| --------------------------- | ----------------------- | ------------------------------------------------------------------------ |
| Abertura padrão             | ✅ Sim                   | Sempre iniciar com a frase exata estabelecida                            |
| Fecho padrão                | ✅ Sim                   | Sempre encerrar com o parágrafo exato estabelecido                       |
| Siglas por extenso          | ✅ Sim                   | Sempre na primeira menção                                                |
| Mencionar IA                | ❌ Não                   | Nunca se identificar como IA ou "Ouvi.ai"                                |
| Citar áreas da RFB          | ❌ Não                   | Substituir por "equipe responsável", quando aplicável                    |
| Criar novos links           | ❌ Não                   | Somente links oficiais e validados                                       |
| Análise de anexos           | ✅ Sim                   | Deve identificar e extrair informações relevantes para compor a resposta |
| Citar classificação (N1/N2) | ⚠️ Apenas se solicitado | Utilizar texto literal da estrutura oficial                              |

`;

const SYSTEM_INSTRUCTION = `
${SYSTEM_INSTRUCTION_BASE}
---
${CLASSIFICATION_DATA}
---
${KNOWLEDGE_BASE}
`;

const API_KEYS = [
  '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',
  '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',
  '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',
];

const MODEL_NAME = 'qwen/qwen3-235b-a22b-2507:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

class ApiLoadBalancer {
  private cooldownMap = new Map<string, number>();
  private latencyMap = new Map<string, number>();

  constructor(private keys: string[]) {}

  async getBestKey(): Promise<string> {
    const now = Date.now();
    const available = this.keys.filter(key => (this.cooldownMap.get(key) || 0) < now);
    if (available.length === 0) return this.keys[0];
    available.sort((a, b) => (this.latencyMap.get(a) || 0) - (this.latencyMap.get(b) || 0));
    return available[0];
  }

  reportError(key: string) {
    this.cooldownMap.set(key, Date.now() + 30000); // 30 segundos
  }

  reportLatency(key: string, ms: number) {
    this.latencyMap.set(key, ms);
  }
}

const balancer = new ApiLoadBalancer(API_KEYS);

class AiService {
  constructor() {}

  async sendMessageStream(history: Message[]): Promise<AsyncGenerator<string, void, unknown>> {
    const startTime = Date.now();
    const apiKey = await balancer.getBestKey();

    const apiMessages = history
      .filter(msg => msg.role !== MessageRole.ERROR)
      .map(msg => {
        const role = msg.role === MessageRole.USER ? 'user' : 'assistant';
        const content: any[] = [];
        let combinedText = msg.parts.map(p => p.text || '').join('\n');

        if (msg.attachments) {
          msg.attachments.forEach(file => {
            if (file.type.startsWith('image/')) {
              content.push({ type: 'image_url', image_url: { url: file.content } });
            } else if (file.type === 'text/plain') {
              combinedText += `\n\n--- Conteúdo do arquivo ${file.name} ---\n${file.content}`;
            } else {
              combinedText += `\n[O usuário anexou o arquivo: ${file.name}]`;
            }
          });
        }

        if (combinedText.trim()) {
          content.unshift({ type: 'text', text: combinedText.trim() });
        }

        return { role, content };
      })
      .filter(msg => msg.content.length > 0);

    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...apiMessages,
    ];

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ouvi.ai.app',
        'X-Title': 'Ouvi.ai',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        stream: true,
      }),
    });

    const elapsed = Date.now() - startTime;
    if (!response.ok) {
      balancer.reportError(apiKey);
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorBody}`);
    } else {
      balancer.reportLatency(apiKey, elapsed);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to get response reader.");

    const stream = async function* (): AsyncGenerator<string> {
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            const jsonStr = line.substring(6).trim();
            if (jsonStr === '[DONE]') return;
            try {
              const chunk = JSON.parse(jsonStr);
              const content = chunk.choices?.[0]?.delta?.content;
              if (content) yield content;
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }
    };

    return stream();
  }
}

let serviceInstance: AiService | null = null;

export const getAiService = (): AiService => {
  if (!serviceInstance) {
    serviceInstance = new AiService();
  }
  return serviceInstance;
};
