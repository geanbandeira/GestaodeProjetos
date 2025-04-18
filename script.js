document.addEventListener('DOMContentLoaded', function() {
    // Elementos da UI
    const sections = document.querySelectorAll('.section');
    const optionalSections = document.querySelectorAll('.tech-optional');
    const toggleOptionalBtn = document.getElementById('toggle-optional');
    const saveBtn = document.getElementById('save-project');
    const exportBtn = document.getElementById('export-pdf');
    const shareBtn = document.getElementById('share-project');
    const techModeBtn = document.getElementById('tech-mode');
    const shareModal = document.getElementById('share-modal');
    const closeModal = document.querySelector('.tech-close-modal');
    const shareLinkInput = document.getElementById('share-link');
    const copyLinkBtn = document.getElementById('copy-link');
    const textareas = document.querySelectorAll('.tech-input');
    
    // Estado da aplicação
    let optionalVisible = false;
    
    // Inicialização
    initApp();
    
    function initApp() {
        // Carregar dados salvos
        loadSavedData();
        
        // Configurar contadores de caracteres
        setupCharacterCounters();
        
        // Event Listeners
        setupEventListeners();
    }
    
    function loadSavedData() {
        const savedData = localStorage.getItem('vision-project-data');
        if (savedData) {
            const data = JSON.parse(savedData);
            sections.forEach(section => {
                const textarea = section.querySelector('textarea');
                if (data[section.id] && textarea) {
                    textarea.value = data[section.id];
                    updateCharacterCounter(textarea);
                }
            });
        }
        
        // Verificar se há dados na URL (compartilhamento)
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('data');
        
        if (sharedData) {
            try {
                const data = JSON.parse(atob(sharedData));
                sections.forEach(section => {
                    const textarea = section.querySelector('textarea');
                    if (data[section.id] && textarea) {
                        textarea.value = data[section.id];
                        updateCharacterCounter(textarea);
                    }
                });
            } catch (e) {
                console.error('Erro ao carregar dados compartilhados:', e);
            }
        }
    }
    
    function setupCharacterCounters() {
        textareas.forEach(textarea => {
            textarea.addEventListener('input', function() {
                updateCharacterCounter(this);
            });
            // Inicializar contador
            updateCharacterCounter(textarea);
        });
    }
    
    function updateCharacterCounter(textarea) {
        const characterCount = textarea.value.length;
        const maxLength = 500;
        const counter = textarea.nextElementSibling;
        
        if (counter && counter.classList.contains('tech-counter')) {
            counter.textContent = `${characterCount}/${maxLength}`;
            
            if (characterCount > maxLength * 0.9) {
                counter.style.color = 'var(--tech-accent)';
                textarea.style.borderColor = 'var(--tech-accent)';
            } else {
                counter.style.color = 'var(--tech-primary)';
                textarea.style.borderColor = 'var(--tech-border)';
            }
        }
    }
    
    function setupEventListeners() {
        // Botão de alternar seções opcionais
        toggleOptionalBtn.addEventListener('click', toggleOptionalSections);
        
        // Botão de salvar
        saveBtn.addEventListener('click', saveProject);
        
        // Botão de exportar PDF
        exportBtn.addEventListener('click', exportToPDF);
        
        // Botão de compartilhar
        shareBtn.addEventListener('click', openShareModal);
        
        // Fechar modal
        closeModal.addEventListener('click', closeShareModal);
        
        // Copiar link
        copyLinkBtn.addEventListener('click', copyShareLink);
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', function(event) {
            if (event.target === shareModal) {
                closeShareModal();
            }
        });
        
        techModeBtn.addEventListener('click', function() {
            if (document.body.classList.contains('tech-mode')) {
                document.body.classList.remove('tech-mode');
                document.body.classList.add('clean-mode');
                techModeBtn.innerHTML = '<i class="fas fa-moon"></i> DARK MODE';
            } else {
                document.body.classList.remove('clean-mode');
                document.body.classList.add('tech-mode');
                techModeBtn.innerHTML = '<i class="fas fa-sun"></i> TECH MODE';
            }
            
            // Forçar redesenho para garantir a transição
            document.body.style.display = 'none';
            document.body.offsetHeight; // Trigger reflow
            document.body.style.display = 'block';
        });
    }
    
    function toggleOptionalSections() {
        optionalVisible = !optionalVisible;
        
        optionalSections.forEach(section => {
            if (optionalVisible) {
                section.classList.add('show');
            } else {
                section.classList.remove('show');
            }
        });
        
        // Animação do botão
        if (optionalVisible) {
            toggleOptionalBtn.innerHTML = '<i class="fas fa-times"></i>';
            toggleOptionalBtn.style.transform = 'rotate(45deg)';
        } else {
            toggleOptionalBtn.innerHTML = '<i class="fas fa-plus"></i>';
            toggleOptionalBtn.style.transform = 'rotate(0)';
        }
    }
    
    function saveProject() {
        const data = {};
        
        sections.forEach(section => {
            const textarea = section.querySelector('textarea');
            if (textarea) {
                data[section.id] = textarea.value;
            }
        });
        
        localStorage.setItem('vision-project-data', JSON.stringify(data));
        
        // Feedback visual
        saveBtn.innerHTML = '<i class="fas fa-check"></i> SAVED!';
        saveBtn.style.background = 'var(--tech-accent)';
        
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> SAVE';
            saveBtn.style.background = 'linear-gradient(135deg, var(--tech-primary), var(--tech-secondary))';
        }, 2000);
    }
    
    function exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações do documento
        doc.setDocumentProperties({
            title: 'Vision - Gestão de Projeto',
            subject: 'Plano de Projeto',
            author: 'Vision Platform',
            keywords: 'gestão, projeto, planejamento',
            creator: 'Vision Tech'
        });
        
        // Título do documento
        doc.setFontSize(20);
        doc.setTextColor(0, 240, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('VISION - GESTÃO DE PROJETO', 105, 20, { align: 'center' });
        
        // Adicionar data
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.setFont('helvetica', 'normal');
        doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });
        
        let yPosition = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        
        // Adicionar conteúdo
        sections.forEach(section => {
            if (section.querySelector('textarea').value) {
                const title = section.querySelector('h2').textContent;
                const content = section.querySelector('textarea').value;
                
                // Adicionar seção ao PDF
                doc.setFontSize(14);
                doc.setTextColor(0, 240, 255);
                doc.setFont('helvetica', 'bold');
                doc.text(title, margin, yPosition);
                yPosition += 8;
                
                doc.setFontSize(11);
                doc.setTextColor(0);
                doc.setFont('helvetica', 'normal');
                const splitText = doc.splitTextToSize(content, pageWidth - 2 * margin);
                doc.text(splitText, margin, yPosition);
                
                yPosition += splitText.length * 7 + 15;
                
                // Verificar se precisa de nova página
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
            }
        });
        
        // Adicionar rodapé
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('Gerado com Vision Platform - www.visiontech.com', 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        
        // Salvar o PDF
        doc.save('vision-gestao-projeto.pdf');
    }
    
    function openShareModal() {
        // Gerar link compartilhável
        const data = {};
        sections.forEach(section => {
            const textarea = section.querySelector('textarea');
            if (textarea && textarea.value) {
                data[section.id] = textarea.value;
            }
        });
        
        const encodedData = btoa(JSON.stringify(data));
        const shareLink = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
        
        shareLinkInput.value = shareLink;
        shareModal.style.display = 'block';
    }
    
    function closeShareModal() {
        shareModal.style.display = 'none';
    }
    
    function copyShareLink() {
        shareLinkInput.select();
        document.execCommand('copy');
        
        // Feedback visual
        copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyLinkBtn.style.background = 'var(--tech-accent)';
        
        setTimeout(() => {
            copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyLinkBtn.style.background = 'rgba(0, 102, 255, 0.2)';
        }, 2000);
    }
    
    // Criar partículas dinâmicas
    createParticles();
    
    function createParticles() {
        const particlesContainer = document.querySelector('.tech-particles');
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'tech-particle';
            
            // Posição aleatória
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Tamanho aleatório
            const size = Math.random() * 3 + 1;
            
            // Duração da animação aleatória
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            
            // Cor aleatória (entre azul e ciano)
            const hue = 180 + Math.random() * 60;
            const color = `hsla(${hue}, 100%, 50%, ${Math.random() * 0.5 + 0.1})`;
            
            particle.style.cssText = `
                position: absolute;
                top: ${posY}%;
                left: ${posX}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                animation: float ${duration}s linear ${delay}s infinite;
                filter: blur(1px);
            `;
            
            particlesContainer.appendChild(particle);
        }
        
        // Adicionar animação de flutuação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0% {
                    transform: translate(0, 0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registrado com sucesso: ', registration.scope);
        }).catch(err => {
            console.log('Falha no registro do ServiceWorker: ', err);
        });
    });
}

// Detectar mobile e ajustar comportamentos
function detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Ajustar viewport para mobile
function adjustViewport() {
    if (detectMobile()) {
        const viewport = document.querySelector('meta[name="viewport"]');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
}

// Inicializar ajustes mobile
document.addEventListener('DOMContentLoaded', function() {
    adjustViewport();
    
    // Ajustes específicos para mobile
    if (detectMobile()) {
        // Suavizar animações para melhor performance
        document.body.style.setProperty('--transition', 'all 0.2s ease');
        
        // Remover efeitos pesados em mobile
        const particles = document.querySelector('.tech-particles');
        if (particles) particles.style.display = 'none';
        
        // Ajustar tooltips para mobile
        const tooltips = document.querySelectorAll('[data-tooltip]');
        tooltips.forEach(tooltip => {
            tooltip.setAttribute('title', tooltip.getAttribute('data-tooltip'));
        });
    }
});