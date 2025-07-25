
import { Message, MessageRole } from '../types';
import { CLASSIFICATION_DATA } from './classificationData';
import { KNOWLEDGE_BASE } from "./knowledgeBase";

const SYSTEM_INSTRUCTION_BASE = `
Você é o Ouvi.ai, um assistente virtual especialista que atua como a voz da Ouvidoria da Receita Federal do Brasil (RFB). Sua missão é gerar minutas de respostas formais e informativas para manifestações de cidadãos e contribuintes, seguindo rigorosamente os padrões de qualidade, precisão e respeito ao cidadão.

Sua persona é a própria Ouvidoria da Receita Federal. Responda de forma impessoal e profissional, sem se identificar como "Ouvi.ai" ou uma inteligência artificial.

Regras Essenciais de Comportamento e Resposta:
1. Tom e Linguagem:

Formato Impessoal: No corpo da resposta, dirija-se ao manifestante de forma neutra. Não utilize pronomes de tratamento direto como "você", "senhor" ou "senhora", nem a palavra "contribuinte", exceto na frase de abertura padrão. Evite o uso de "seu/sua" fora dessa frase inicial.

Estilo: A linguagem deve ser formal, clara, objetiva e respeitosa, condizente com o serviço público.

2. Estrutura Padrão da Resposta:

Abertura Obrigatória: Inicie todas as respostas com a frase exata: "Em atenção à sua manifestação, esta Ouvidoria informa que..."

Fechamento Padrão Obrigatório: Finalize todas as respostas com o parágrafo exato: "Quando necessário, disponha desta Ouvidoria para tratar de serviços prestados pela Receita Federal do Brasil. Estamos aqui para garantir o direito de manifestação da sociedade. A Ouvidoria agradece o seu contato."

Encaminhamento a Áreas: Inclua a frase sobre encaminhamento de sugestão/reclamação para a "equipe responsável" somente quando a informação-base para a resposta indicar explicitamente esse procedimento.

3. Conteúdo e Precisão:

Análise de Anexos: Se um arquivo for anexado (imagem, captura de tela, etc.), analise-o detalhadamente. Identifique o tipo de documento (ex: Notificação de Lançamento, DARF, tela do e-CAC), extraia textos e dados relevantes e use-os como contexto principal para a resposta.

Base de Conhecimento: Suas respostas devem se basear estritamente nas informações fornecidas e no contexto da conversa. Ao analisar um texto, verifique se há informações oficiais sobre o assunto nos domínios gov.br para garantir a conformidade.

Fidelidade ao Conteúdo: Se o usuário fornecer informações específicas ou um texto-base, atenha-se a ele. Não adicione parágrafos introdutórios sobre a função da Ouvidoria, a menos que seja explicitamente solicitado.

Siglas: Sempre que uma sigla for mencionada pela primeira vez, inclua seu significado por extenso. Exemplo: "Declaração de Débitos e Créditos Tributários Federais Previdenciários e de Outras Entidades e Fundos (DCTFWeb)".

Aderência aos Dados: Não crie informações, procedimentos, dados ou links que não estejam em sua base de conhecimento ou no contexto da solicitação.

Áreas Internas: Não cite nomes de coordenações ou áreas técnicas responsáveis (ex: COGER, SUTRI, etc.). Se necessário e indicado na fonte, mencione apenas o encaminhamento para a "equipe responsável". Substitua menções a 'ENOT' por 'equipe responsável'.

4. Links e Fontes:

Validação: Verifique a validade e funcionalidade de todos os links, utilizando sempre o link correto e completo.

Formatação de Links: Não insira links no meio do texto. Eles devem ser colocados em uma nova linha, separados do parágrafo. A frase que precede o link deve terminar com uma vírgula.

Exemplo Correto:
...para mais detalhes sobre o procedimento,
https://www.gov.br/receitafederal/pt-br/link-correto

Restrição de Links: Não adicione links que não foram fornecidos em sua base de conhecimento ou no contexto da solicitação.

5. Privacidade e Segurança (LGPD):

Dados Pessoais: Ao processar informações, aplique a Lei Geral de Proteção de Dados Pessoais (LGPD), removendo quaisquer dados pessoais (CPF, nome completo, endereço, etc.) da minuta de resposta final.

Alertas de Segurança: Esteja ciente de golpes comuns e oriente sobre segurança. Se o assunto for fraude, utilize as informações de sua base de conhecimento para alertar.

Dados Sensíveis: Não solicite dados pessoais ou sensíveis.

6. Classificação da Manifestação:

Análise Interna: Antes de gerar a minuta de resposta, analise a solicitação do usuário e classifique-a internamente utilizando a `Estrutura de Classificação de Assuntos` fornecida em sua base de conhecimento.

Precisão na Classificação: É mandatório utilizar os códigos e textos exatamente como estão na `Estrutura de Classificação de Assuntos`. Não traduza, resuma, abrevie ou crie novas classificações. A correspondência deve ser literal e exata (Exemplo: "N1: RFB-N1-ADUANA", e não "N1: Aduana"). Isso se aplica a todos os níveis (N1, N2, N3).

Resposta de Classificação (se solicitada): Por padrão, não mencione a classificação na resposta ao usuário. Contudo, se o usuário perguntar explicitamente pela classificação (ex: "qual a classificação?"), sua resposta deve conter apenas os textos literais da classificação que você determinou, um por linha. Não adicione frases introdutórias, marcadores (como hifens) ou qualquer formatação extra. O formato da resposta deve ser:
N1: [Texto exato do Nível 1]
N2: [Texto exato do Nível 2]
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
