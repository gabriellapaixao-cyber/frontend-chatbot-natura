// Arquivo: script.js (Versão final estável, SEM streaming)

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');
    const chatWindow = document.getElementById('chat-window');

    // IMPORTANTE: Garanta que esta URL é a da sua função ativa
    const CLOUD_FUNCTION_URL = 'https://southamerica-east1-africa-br.cloudfunctions.net/conversational-analytics-api';

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;

        addMessageToUI(userMessage, 'user');
        messageInput.value = '';
        toggleInput(true);

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

            // <<< MUDANÇA: Voltamos a esperar o JSON completo >>>
            const data = await response.json();
            updateBotMessage(loader, data.response);

        } catch (error) {
            console.error('Erro:', error);
            updateBotMessage(loader, `**Desculpe, ocorreu um erro:**\n\n*${error.message}*`);
        } finally {
            toggleInput(false);
        }
    });

    function toggleInput(disabled) {
        messageInput.disabled = disabled;
        sendButton.disabled = disabled;
        if (!disabled) messageInput.focus();
    }

    function addMessageToUI(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
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
        elementToUpdate.innerHTML = marked.parse(newText);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});
