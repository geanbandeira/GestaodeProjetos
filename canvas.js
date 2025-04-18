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
        // Simular geração de relatório detalhado
        alert('Detailed report generation would be implemented here with real data analysis and AI insights.');
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