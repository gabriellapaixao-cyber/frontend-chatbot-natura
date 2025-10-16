// Aguarda o carregamento completo da página para iniciar
document.addEventListener('DOMContentLoaded', () => {
    
    // URL da sua API no Google Cloud Functions
    const API_URL = 'https://conversational-analytics-api-utls6vdlga-rj.a.run.app/';

    // Seleciona os elementos da interface
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

    // <<< FUNÇÃO APRIMORADA: Converte Markdown completo para HTML >>>
    function parseMarkdown(text) {
        // Converte **negrito** para <strong>negrito</strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Converte listas com marcadores (-) para <ul> e <li>
        // Primeiro, envolve os itens da lista em <li>
        text = text.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
        // Depois, envolve os blocos de <li> em <ul>
        text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        // Corrige o problema de criar múltiplos <ul> para uma única lista
        text = text.replace(/<\/ul>\s*<ul>/g, '');

        // Converte quebras de linha em <br> para manter os parágrafos
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    // Função para adicionar uma mensagem à caixa de chat
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        // Usa innerHTML para renderizar a formatação
        if (sender === 'user') {
            messageElement.textContent = text;
        } else {
            messageElement.innerHTML = parseMarkdown(text);
        }
        
        chatBox.appendChild(messageElement);
        // Rola a caixa de chat para a última mensagem
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement;
    }

    // Função principal para enviar a pergunta do utilizador
    async function handleSendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        addMessage(userText, 'user');
        userInput.value = '';

        const loadingMessage = addMessage('Analisando...', 'bot');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: userText }),
            });

            if (!response.ok) {
                throw new Error('A resposta da API não foi bem-sucedida.');
            }

            const data = await response.json();
            // Atualiza a mensagem de "carregando" usando innerHTML e o parser
            loadingMessage.innerHTML = parseMarkdown(data.response);

        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            loadingMessage.textContent = 'Desculpe, ocorreu um erro ao tentar obter a resposta.';
        }
    }

    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

    addMessage('Olá! Como posso ajudar na análise da campanha Natura Tododia Energia hoje?', 'bot');
});

