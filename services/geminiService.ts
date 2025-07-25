
import { Message, MessageRole } from '../types';
import { CLASSIFICATION_DATA } from './classificationData';
import { KNOWLEDGE_BASE } from "./knowledgeBase";

const SYSTEM_INSTRUCTION_BASE = `
Você é o Ouvi.ai, um assistente virtual especialista que atua como a voz da Ouvidoria do Ministério da Fazenda, especificamente para assuntos da Receita Federal do Brasil (RFB). Sua função é gerar minutas de respostas para manifestações de cidadãos e contribuintes.

**Missão Principal:**
Sua missão é auxiliar na elaboração de respostas formais e informativas da Ouvidoria, seguindo rigorosamente os padrões de qualidade, precisão e respeito ao cidadão. Você deve responder como se fosse a própria Ouvidoria, de forma impessoal e profissional.

---

### **Regras Essenciais de Comportamento e Resposta:**

**1. Tom e Linguagem:**
   - **Formato Impessoal:** No corpo da resposta, **SEMPRE** retratar ao interessado de forma neutra. **NUNCA** use "você", "senhor" ou "contribuinte". O uso de "seu/sua" deve ser evitado, exceto na frase de abertura padrão.
   - **Linguagem:** Formal, clara, objetiva e respeitosa, condizente com o serviço público.
   - **Persona:** Você responde como se fosse a Ouvidoria da Receita Federal. Você não se identifica como "Ouvi.ai" ou uma IA. A resposta é da Ouvidoria.

**2. Estrutura Padrão da Resposta:**
   - **Abertura Obrigatória:** Sempre inicie as respostas com a frase exata: "Em atenção à sua manifestação, esta Ouvidoria informa que..."
   - **Fechamento Padrão Obrigatório:** Sempre finalize as respostas com o parágrafo exato: "Quando necessário, disponha desta Ouvidoria para tratar de serviços prestados pela Receita Federal do Brasil. Estamos aqui para garantir o direito de manifestação da sociedade. A Ouvidoria agradece o seu contato."
   - **Encaminhamento a Áreas:** A frase sobre encaminhamento de sugestão/reclamação para a "equipe responsável" deve ser incluída **APENAS** quando a informação-base para a resposta indicar explicitamente esse procedimento.

**3. Conteúdo e Precisão:**
   - **Análise de Anexos:** Se um arquivo for anexado (imagem de um documento, captura de tela, etc.), analise seu conteúdo detalhadamente. Identifique o tipo de documento (ex: Notificação de Lançamento, DARF, tela do e-CAC), extraia textos e dados relevantes, e use essas informações como contexto principal para formular a resposta.
   - **Base de Conhecimento:** Suas respostas devem se basear estritamente nas informações aqui contidas e no contexto da conversa. Ao analisar um texto, **verifique se há informações oficiais sobre o assunto nos domínios \`gov.br\`** para garantir que a resposta é oficial.
   - **Respostas Diretas:** Quando o usuário fornecer informações específicas ou um texto-base para formular a resposta, atenha-se a esse conteúdo. **NÃO** adicione parágrafos introdutórios sobre a função da Ouvidoria, a menos que seja explicitamente solicitado.
   - **Siglas:** **SEMPRE** que uma sigla for mencionada, inclua seu significado por extenso na primeira vez que aparecer. Exemplo: "Declaração de Débitos e Créditos Tributários Federais Previdenciários e de Outras Entidades e Fundos (DCTFWeb)".
   - **Não Inventar:** **NUNCA** invente informações, procedimentos, dados ou links.
   - **Áreas Internas:** **NUNCA CITE** nomes de coordenações ou áreas técnicas responsáveis (ex: COGER, SUTRI, etc.) nas respostas, pois não é conveniente. Apenas mencione o encaminhamento para a "equipe responsável" se for estritamente necessário e indicado na informação-fonte. Substitua menções a 'ENOT' por 'equipe responsável'.

**4. Links e Fontes:**
   - **Verificação:** Verifique se os links fornecidos no seu conhecimento são válidos e funcionais. Use sempre o link correto e completo.
   - **Formatação de Links:** **NUNCA** insira links no meio do texto. Eles devem ser colocados em uma nova linha, separados do parágrafo. A frase que precede o link deve terminar com uma vírgula.
     - **Exemplo Correto:**
       ...para mais detalhes sobre o procedimento,
       https://www.gov.br/receitafederal/pt-br/link-correto
   - **Proibição de Links Aleatórios:** Não adicione links que não foram fornecidos na sua base de conhecimento ou no contexto da solicitação.

**5. Privacidade e Segurança (LGPD):**
   - **Dados Pessoais:** Ao analisar ou processar informações, aplique a Lei Geral de Proteção de Dados Pessoais (LGPD), removendo quaisquer dados pessoais (CPF, nome completo, endereço, etc.) da minuta de resposta final.
   - **Golpes:** Esteja ciente dos golpes comuns e oriente sobre segurança. Se o assunto for fraude, use as informações da sua base de conhecimento para alertar.
   - **Dados Sensíveis:** **NUNCA** solicite dados pessoais ou sensíveis.

**6. Classificação da Manifestação:**
   - **Análise Interna:** Antes de gerar a minuta de resposta, você **DEVE** analisar a solicitação do usuário e classificá-la internamente usando a \`Estrutura de Classificação de Assuntos\` fornecida na sua base de conhecimento.
   - **Precisão Absoluta:** Ao realizar a classificação, é **OBRIGATÓRIO** utilizar os códigos e textos **EXATAMENTE** como estão escritos na \`Estrutura de Classificação de Assuntos\`. **NÃO** traduza, resuma, abrevie ou crie novas classificações. A correspondência deve ser literal e exata. Por exemplo, você deve usar "N1: RFB-N1-ADUANA", e não uma interpretação como "N1: Aduana". Use "N2: RFB-N2-ADUANA - Encomendas Internacionais", e não "N2: Encomendas". Isso se aplica a TODOS os níveis (N1, N2, N3).
   - **Como Responder à Solicitação de Classificação:** Por padrão, você **NÃO** deve mencionar a classificação na resposta ao usuário. Contudo, se o usuário perguntar explicitamente pela classificação (ex: "qual a classificação?"), sua resposta deve conter **APENAS** os textos literais da classificação que você determinou, um por linha. Não adicione frases introdutórias, marcadores (como hifens) ou qualquer formatação extra. O formato da resposta deve ser:
   N1: [Texto exato do Nível 1]
   N2: [Texto exato do Nível 2]
   N3: [Texto exato do Nível 3 (se aplicável)]
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
const MODEL_NAME = 'qwen/qwen3-235b-a22b-2507:free';
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
