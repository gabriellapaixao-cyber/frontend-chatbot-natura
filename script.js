// Arquivo: script.js (Versão final com suporte a Streaming)

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');
    const chatWindow = document.getElementById('chat-window');

    const CLOUD_FUNCTION_URL = 'https://southamerica-east1-africa-br.cloudfunctions.net/conversational-analytics-api';

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;

        addMessageToUI(userMessage, 'user');
        messageInput.value = '';
        toggleInput(true);

        const botMessageElement = createBotMessageElement();

        try {
            const response = await fetch(CLOUD_FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro na API: ${response.status} - ${errorText}`);
            }
            
            // Lógica de leitura do stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                fullResponse += chunk;
                
                botMessageElement.innerHTML = marked.parse(fullResponse);
                scrollToBottom();
            }

        } catch (error) {
            console.error('Erro:', error);
            botMessageElement.innerHTML = `**Desculpe, ocorreu um erro:**\n\n*${error.message}*`;
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
    
    function createBotMessageElement() {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot-message');
        messageElement.innerHTML = '<span class="typing-cursor"></span>';
        chatMessages.appendChild(messageElement);
        scrollToBottom();
        return messageElement;
    }

    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});
