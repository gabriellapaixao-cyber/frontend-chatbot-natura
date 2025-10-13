document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');

    // ===============================================================================
    // COLE A URL DA SUA CLOUD FUNCTION AQUI
    const CLOUD_FUNCTION_URL = 'https://southamerica-east1-africa-br.cloudfunctions.net/chatbot-supervisor-midia-bq';
    // ===============================================================================

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;

        addMessageToUI(userMessage, 'user');
        messageInput.value = '';
        toggleInput(true); // Desabilita o input

        // Adiciona um loader para indicar que o bot está "pensando"
        const loader = addLoaderToUI();

        try {
            const response = await fetch(CLOUD_FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ocorreu um erro na API.');
            }

            const data = await response.json();
            // Remove o loader e adiciona a resposta final do bot
            updateBotMessage(loader, data.response);

        } catch (error) {
            console.error('Erro:', error);
            updateBotMessage(loader, `**Desculpe, ocorreu um erro:**\n\n*${error.message}*`);
        } finally {
            toggleInput(false); // Reabilita o input
        }
    });

    function toggleInput(disabled) {
        messageInput.disabled = disabled;
        sendButton.disabled = disabled;
    }

    function addMessageToUI(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        // Usamos a biblioteca 'marked' para renderizar o texto como Markdown
        messageElement.innerHTML = marked.parse(text);
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    function addLoaderToUI() {
        const loaderElement = document.createElement('div');
        loaderElement.classList.add('message', 'bot-message', 'loader');
        loaderElement.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(loaderElement);
        scrollToBottom();
        return loaderElement;
    }

    function updateBotMessage(elementToUpdate, newText) {
        elementToUpdate.classList.remove('loader');
        // Renderiza o texto final como Markdown
        elementToUpdate.innerHTML = marked.parse(newText);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});