// Aguarda o carregamento completo da página para iniciar
document.addEventListener('DOMContentLoaded', () => {
    
    // URL da sua API no Google Cloud Functions
    const API_URL = 'https://conversational-analytics-api-utls6vdlga-rj.a.run.app/';

    // Seleciona os elementos da interface
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

    // Função para adicionar uma mensagem à caixa de chat
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = text;
        chatBox.appendChild(messageElement);
        // Rola a caixa de chat para a última mensagem
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement; // Retorna o elemento para possível atualização (ex: "carregando...")
    }

    // Função principal para enviar a pergunta do usuário
    async function handleSendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        // Adiciona a mensagem do usuário à interface
        addMessage(userText, 'user');
        // Limpa o campo de input
        userInput.value = '';

        // Mostra uma mensagem de "carregando..."
        const loadingMessage = addMessage('Analisando...', 'bot');

        try {
            // Faz a chamada para a sua Cloud Function
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
            // Atualiza a mensagem de "carregando..." com a resposta real do bot
            loadingMessage.textContent = data.response;

        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            // Atualiza a mensagem de "carregando..." com uma mensagem de erro
            loadingMessage.textContent = 'Desculpe, ocorreu um erro ao tentar obter a resposta.';
        }
    }

    // Adiciona o evento de clique ao botão de enviar
    sendBtn.addEventListener('click', handleSendMessage);

    // Adiciona o evento de pressionar "Enter" no campo de input
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Adiciona uma mensagem de boas-vindas inicial
    addMessage('Olá! Como posso ajudar na análise da campanha Natura Tododia Energia hoje?', 'bot');
});
