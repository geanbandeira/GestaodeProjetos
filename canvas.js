document.addEventListener('DOMContentLoaded', function() {
    // Elementos da UI
    const canvasSections = document.querySelectorAll('.canvas-section');
    const toggleViewBtn = document.getElementById('toggle-view');
    const analyzeBtn = document.getElementById('analyze-data');
    const saveBtn = document.getElementById('save-canvas');
    const exportBtn = document.getElementById('export-canvas');
    const aiAssistantBtn = document.getElementById('ai-assistant');
    const analysisModal = document.getElementById('analysis-modal');
    const closeModal = document.querySelector('.tech-close-modal');
    const generateReportBtn = document.getElementById('generate-report');
    const techModeBtn = document.getElementById('tech-mode');
    
    // Estado da aplicação
    let is3DView = false;
    let canvasData = {};
    
    // Inicialização
    initCanvas();
    
    function initCanvas() {
        // Carregar dados salvos
        loadSavedCanvas();
        
        // Configurar Three.js para visualização 3D
        init3DView();
        
        // Event Listeners
        setupEventListeners();
    }
    
    function loadSavedCanvas() {
        const savedData = localStorage.getItem('vision-canvas-data');
        if (savedData) {
            canvasData = JSON.parse(savedData);
            canvasSections.forEach(section => {
                const content = section.querySelector('.canvas-content');
                if (canvasData[section.classList[1]] && content) {
                    content.innerHTML = canvasData[section.classList[1]];
                }
            });
        }
    }
    
    function init3DView() {
        const container = document.getElementById('canvas3d');
        if (!container) return;
        
        // Configuração básica da cena Three.js
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
        
        // Controles de órbita
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        
        // Iluminação
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Criar cubos representando cada seção do canvas
        const colors = {
            'customer-segment': 0xFF6B6B,
            'value-proposition': 0x4ECDC4,
            'channels': 0x45B7D1,
            'customer-relationships': 0xFFA07A,
            'revenue-streams': 0x98D8C8,
            'key-resources': 0xF06292,
            'key-activities': 0x7986CB,
            'key-partnerships': 0x9575CD,
            'cost-structure': 0xA1887F
        };
        
        const cubes = {};
        let index = 0;
        const radius = 5;
        
        canvasSections.forEach(section => {
            const sectionClass = section.classList[1];
            const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
            const material = new THREE.MeshPhongMaterial({ 
                color: colors[sectionClass],
                transparent: true,
                opacity: 0.9,
                emissive: colors[sectionClass],
                emissiveIntensity: 0.2
            });
            
            const cube = new THREE.Mesh(geometry, material);
            
            // Posicionar em um círculo
            const angle = (index / canvasSections.length) * Math.PI * 2;
            cube.position.x = Math.cos(angle) * radius;
            cube.position.z = Math.sin(angle) * radius;
            cube.position.y = Math.random() * 2 - 1;
            
            cube.userData.section = sectionClass;
            scene.add(cube);
            cubes[sectionClass] = cube;
            
            index++;
        });
        
        // Posicionar a câmera
        camera.position.y = 5;
        camera.position.z = 10;
        camera.lookAt(0, 0, 0);
        
        // Animação
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotacionar cubos levemente
            Object.values(cubes).forEach(cube => {
                cube.rotation.x += 0.005;
                cube.rotation.y += 0.01;
            });
            
            controls.update();
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Redimensionar
        window.addEventListener('resize', function() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }
    
    function setupEventListeners() {
        // Alternar entre visualizações 2D e 3D
        toggleViewBtn.addEventListener('click', function() {
            is3DView = !is3DView;
            document.body.classList.toggle('canvas-3d-active', is3DView);
            this.innerHTML = is3DView ? 
                '<i class="fas fa-table"></i> TOGGLE 2D VIEW' : 
                '<i class="fas fa-cube"></i> TOGGLE 3D VIEW';
        });
        
        // Salvar canvas
        saveBtn.addEventListener('click', saveCanvas);
        
        // Exportar canvas
        exportBtn.addEventListener('click', exportCanvas);
        
        // Analisar dados
        analyzeBtn.addEventListener('click', openAnalysisModal);
        
        // Fechar modal
        closeModal.addEventListener('click', closeAnalysisModal);
        
        // Gerar relatório
        generateReportBtn.addEventListener('click', generateReport);
        
        // Assistente de IA
        aiAssistantBtn.addEventListener('click', provideAISuggestions);
        
        // Modo Tech
        techModeBtn.addEventListener('click', toggleTechMode);
        
        // Salvar conteúdo quando editado
        canvasSections.forEach(section => {
            const content = section.querySelector('.canvas-content');
            if (content) {
                content.addEventListener('blur', function() {
                    canvasData[section.classList[1]] = this.innerHTML;
                });
            }
        });
    }
    
    function saveCanvas() {
        // Coletar dados de todas as seções
        canvasSections.forEach(section => {
            const content = section.querySelector('.canvas-content');
            if (content) {
                canvasData[section.classList[1]] = content.innerHTML;
            }
        });
        
        // Salvar no localStorage
        localStorage.setItem('vision-canvas-data', JSON.stringify(canvasData));
        
        // Feedback visual
        saveBtn.innerHTML = '<i class="fas fa-check"></i> SAVED!';
        saveBtn.style.background = 'var(--tech-accent)';
        
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> SAVE';
            saveBtn.style.background = 'linear-gradient(135deg, var(--tech-primary), var(--tech-secondary))';
        }, 2000);
    }
    
    function exportCanvas() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações do documento
        doc.setDocumentProperties({
            title: 'Vision - Business Canvas',
            subject: 'Business Model Canvas',
            author: 'Vision Platform',
            keywords: 'business, model, canvas, strategy',
            creator: 'Vision Tech'
        });
        
        // Título do documento
        doc.setFontSize(20);
        doc.setTextColor(0, 240, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('VISION BUSINESS CANVAS', 105, 20, { align: 'center' });
        
        // Adicionar data
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });
        
        let yPosition = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        
        // Adicionar conteúdo
        canvasSections.forEach(section => {
            const title = section.querySelector('h2').textContent;
            const content = section.querySelector('.canvas-content').innerText;
            
            if (content.trim()) {
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
        doc.text('Generated with Vision Platform - www.dontpage.online', 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        
        // Salvar o PDF
        doc.save('vision-business-canvas.pdf');
    }
    
    function openAnalysisModal() {
        // Simular análise (em uma aplicação real, isso seria feito com IA)
        analyzeCanvas();
        analysisModal.style.display = 'block';
    }
    
    function closeAnalysisModal() {
        analysisModal.style.display = 'none';
    }
    
    function analyzeCanvas() {
        // Simular análise de dados
        const metrics = document.querySelectorAll('.metric');
        
        metrics.forEach(metric => {
            const randomValue = Math.floor(Math.random() * 30) + 50; // Valor entre 50-80%
            const fill = metric.querySelector('.metric-fill');
            const value = metric.querySelector('.metric-value');
            
            fill.style.width = `${randomValue}%`;
            value.textContent = `${randomValue}%`;
        });
    }
    
    function generateReport() {
        // Coletar dados de todas as seções
        const reportData = {};
        canvasSections.forEach(section => {
            const sectionClass = section.classList[1];
            const title = section.querySelector('h2').textContent;
            const content = section.querySelector('.canvas-content').innerText.trim();
            
            if (content) {
                reportData[sectionClass] = {
                    title: title,
                    content: content
                };
            }
        });
    
        // Verificar se há dados para gerar o relatório
        if (Object.keys(reportData).length === 0) {
            alert('Por favor, preencha pelo menos uma seção do canvas antes de gerar o relatório.');
            return;
        }
    
        // Criar o PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações do documento
        doc.setDocumentProperties({
            title: 'Relatório Detalhado - Vision Canvas',
            subject: 'Análise Completa do Modelo de Negócios',
            author: 'Vision Platform',
            keywords: 'business, model, canvas, strategy, analysis',
            creator: 'Vision Tech'
        });
    
        // Cabeçalho do relatório
        doc.setFontSize(20);
        doc.setTextColor(0, 120, 215);
        doc.setFont('helvetica', 'bold');
        doc.text('RELATÓRIO DETALHADO', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text('Análise Completa do Modelo de Negócios', 105, 28, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 35, { align: 'center' });
        
        // Adicionar métricas de análise
        doc.setFontSize(12);
        doc.setTextColor(0, 120, 215);
        doc.setFont('helvetica', 'bold');
        doc.text('MÉTRICAS-CHAVE', 15, 45);
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        
        const metrics = document.querySelectorAll('.metric');
        let metricsY = 55;
        
        metrics.forEach(metric => {
            const label = metric.querySelector('.metric-label').textContent;
            const value = metric.querySelector('.metric-value').textContent;
            
            doc.text(`${label}: ${value}`, 20, metricsY);
            metricsY += 7;
        });
        
        // Adicionar sugestões de IA
        doc.setFontSize(12);
        doc.setTextColor(0, 120, 215);
        doc.setFont('helvetica', 'bold');
        doc.text('SUGESTÕES DE IA', 15, metricsY + 10);
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        
        const suggestions = document.querySelectorAll('.analysis-suggestions li');
        let suggestionsY = metricsY + 20;
        
        suggestions.forEach(suggestion => {
            const text = suggestion.textContent.trim();
            const splitText = doc.splitTextToSize(text, 180);
            doc.text(splitText, 20, suggestionsY);
            suggestionsY += splitText.length * 7;
        });
        
        // Adicionar conteúdo detalhado de cada seção
        let contentY = suggestionsY + 15;
        let page = 1;
        
        Object.entries(reportData).forEach(([sectionClass, data]) => {
            if (contentY > 270) {
                doc.addPage();
                contentY = 20;
                page++;
            }
            
            doc.setFontSize(14);
            doc.setTextColor(0, 120, 215);
            doc.setFont('helvetica', 'bold');
            doc.text(data.title.toUpperCase(), 15, contentY);
            contentY += 10;
            
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'normal');
            
            const splitContent = doc.splitTextToSize(data.content, 180);
            doc.text(splitContent, 15, contentY);
            contentY += splitContent.length * 6 + 10;
            
            // Adicionar análise específica para cada seção
            doc.setFontSize(10);
            doc.setTextColor(80);
            doc.setFont('helvetica', 'italic');
            
            const sectionAnalysis = generateSectionAnalysis(sectionClass, data.content);
            const splitAnalysis = doc.splitTextToSize(sectionAnalysis, 180);
            doc.text(splitAnalysis, 15, contentY);
            contentY += splitAnalysis.length * 5 + 15;
        });
        
        // Adicionar análise geral
        if (contentY > 250) {
            doc.addPage();
            contentY = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(0, 120, 215);
        doc.setFont('helvetica', 'bold');
        doc.text('ANÁLISE GERAL', 15, contentY);
        contentY += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        
        const overallAnalysis = generateOverallAnalysis(reportData);
        const splitOverall = doc.splitTextToSize(overallAnalysis, 180);
        doc.text(splitOverall, 15, contentY);
        contentY += splitOverall.length * 5 + 10;
        
        // Rodapé
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Página ${page}`, 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        doc.text('Gerado com Vision Platform - www.dontpage.online', 105, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
        
        // Salvar o PDF
        doc.save(`relatorio-detalhado-${new Date().toISOString().slice(0,10)}.pdf`);
    }
    
    // Função auxiliar para gerar análise específica de cada seção
    function generateSectionAnalysis(sectionClass, content) {
        const analysisMap = {
            'customer-segment': `Análise: O conteúdo descreve ${content.split(' ').length} palavras sobre segmentos de clientes. ` +
                               `Recomendamos validar esses segmentos com pesquisas de mercado e dados reais.`,
            
            'value-proposition': `Análise: Sua proposta de valor contém ${content.split(' ').length} palavras. ` +
                                `Verifique se está clara e diferenciada o suficiente para atrair seus segmentos de clientes.`,
            
            'channels': `Análise: Você descreveu ${content.split(',').length} canais diferentes. ` +
                       `Considere a eficiência de cada um e como eles se integram à jornada do cliente.`,
            
            'customer-relationships': `Análise: Seu modelo de relacionamento tem ${content.split(' ').length} palavras. ` +
                                    `Avalie se cobre todos os pontos de contato importantes com os clientes.`,
            
            'revenue-streams': `Análise: Você mencionou ${content.split(',').length} fontes de receita. ` +
                              `Considere a sustentabilidade e escalabilidade de cada uma.`,
            
            'key-resources': `Análise: Identificou ${content.split(',').length} recursos principais. ` +
                            `Avalie se são suficientes e como podem ser otimizados.`,
            
            'key-activities': `Análise: Descreveu ${content.split(',').length} atividades-chave. ` +
                             `Priorize aquelas que são essenciais para entregar sua proposta de valor.`,
            
            'key-partnerships': `Análise: Mencionou ${content.split(',').length} parcerias. ` +
                              `Considere como elas podem ajudar a reduzir custos e riscos.`,
            
            'cost-structure': `Análise: Sua estrutura de custos contém ${content.split(' ').length} palavras. ` +
                             `Destaque os custos mais significativos e oportunidades de otimização.`
        };
        
        return analysisMap[sectionClass] || 'Análise detalhada desta seção baseada no conteúdo fornecido.';
    }
    
    // Função auxiliar para gerar análise geral
    function generateOverallAnalysis(reportData) {
        const totalWords = Object.values(reportData).reduce((sum, section) => {
            return sum + section.content.split(' ').length;
        }, 0);
        
        const completenessScore = Math.min(100, Math.floor(totalWords / 5));
        
        return `Análise Geral: Seu canvas contém aproximadamente ${totalWords} palavras distribuídas por ${Object.keys(reportData).length} seções. ` +
               `Isso indica um nível de completude de cerca de ${completenessScore}%. ` +
               `Recomendamos revisar as seções menos detalhadas e garantir que todas as áreas críticas do modelo de negócios estão adequadamente cobertas. ` +
               `Pontos fortes incluem ${getRandomStrengths()}. Áreas para melhoria incluem ${getRandomImprovements()}.`;
    }
    
    // Funções auxiliares para exemplos
    function getRandomStrengths() {
        const strengths = [
            "clareza na proposta de valor",
            "diversificação de fontes de receita",
            "identificação precisa dos segmentos de clientes",
            "estrutura de custos bem definida",
            "abordagem inovadora para parcerias"
        ];
        return strengths[Math.floor(Math.random() * strengths.length)];
    }
    
    function getRandomImprovements() {
        const improvements = [
            "maior detalhamento nos canais de distribuição",
            "exploração de novos modelos de receita",
            "aprofundamento nas relações com clientes",
            "otimização de recursos-chave",
            "maior foco nas atividades críticas"
        ];
        return improvements[Math.floor(Math.random() * improvements.length)];
    }
    
    function provideAISuggestions() {
        // Simular sugestões de IA para cada seção
        const suggestions = {
            'customer-segment': 'Considere segmentar por comportamento ou necessidades para uma abordagem mais direcionada.',
            'value-proposition': 'Destaque o que torna sua oferta única em comparação aos concorrentes.',
            'channels': 'Explore estratégias omnichannel para ampliar o alcance aos clientes.',
            'customer-relationships': 'Considere implementar um programa de fidelidade.',
            'revenue-streams': 'Diversifique com modelos baseados em assinatura ou uso.',
            'key-resources': 'Identifique quais recursos conferem vantagem competitiva.',
            'key-activities': 'Concentre-se nas atividades que entregam sua proposta de valor.',
            'key-partnerships': 'Parcerias estratégicas podem ajudar a reduzir custos e riscos.',
            'cost-structure': 'Analise custos fixos versus variáveis para um controle mais eficiente.'
        };
        
        canvasSections.forEach(section => {
            const sectionClass = section.classList[1];
            const suggestionBox = section.querySelector('.canvas-ai-suggestions');
            
            if (suggestionBox && suggestions[sectionClass]) {
                suggestionBox.textContent = suggestions[sectionClass];
                suggestionBox.style.display = 'block';
                
                setTimeout(() => {
                    suggestionBox.style.display = 'none';
                }, 5000);
            }
        });
    }
    
    function toggleTechMode() {
        if (document.body.classList.contains('tech-mode')) {
            document.body.classList.remove('tech-mode');
            document.body.classList.add('clean-mode');
            techModeBtn.innerHTML = '<i class="fas fa-moon"></i> DARK MODE';
        } else {
            document.body.classList.remove('clean-mode');
            document.body.classList.add('tech-mode');
            techModeBtn.innerHTML = '<i class="fas fa-sun"></i> TECH MODE';
        }
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