
import { Message, MessageRole } from '../types';
import { CLASSIFICATION_DATA } from './classificationData';
import { KNOWLEDGE_BASE } from "./knowledgeBase";

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
* Insira os links sempre em **nova linha**, precedidos por vírgula.

**Exemplo correto**:
...para mais informações sobre o procedimento,
[https://www.gov.br/receitafederal/pt-br/link-correto](https://www.gov.br/receitafederal/pt-br/link-correto)

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

// OpenRouter Configuration
const API_KEYS = [
  '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',
  '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',
  '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',
];
const MODEL_NAME = 'microsoft/mai-ds-r1:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
let requestCounter = 0;

class AiService {
  constructor() {}

  private getApiKey(): string {
    const keyIndex = Math.floor(requestCounter / 2) % API_KEYS.length;
    return API_KEYS[keyIndex];
  }

  async sendMessageStream(history: Message[]): Promise<AsyncGenerator<string, void, unknown>> {
    requestCounter++;

    const apiMessages = history
        .filter(msg => msg.role !== MessageRole.ERROR) // Filter out error messages
        .map(msg => {
            const role = msg.role === MessageRole.USER ? 'user' : 'assistant';
            
            const content: any[] = [];
            
            let combinedText = msg.parts.map(p => p.text || '').join('\n');
            
            if (msg.attachments) {
                msg.attachments.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        content.push({
                            type: 'image_url',
                            image_url: { url: file.content }
                        });
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
            'Authorization': `Bearer ${this.getApiKey()}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ouvi.ai.app', // Recommended by OpenRouter
            'X-Title': 'Ouvi.ai', // Recommended by OpenRouter
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages: messages,
            stream: true,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("Failed to get response reader.");
    }

    const stream = async function* (): AsyncGenerator<string> {
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last, possibly incomplete line

            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    const jsonStr = line.substring(6).trim();
                    if (jsonStr === '[DONE]') {
                        return;
                    }
                    try {
                        const chunk = JSON.parse(jsonStr);
                        const content = chunk.choices?.[0]?.delta?.content;
                        if (content) {
                            yield content;
                        }
                    } catch (e) {
                        console.error("Error parsing stream chunk:", e, "Raw chunk:", jsonStr);
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
