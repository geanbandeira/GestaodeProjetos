document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.section');
    const optionalSections = document.querySelectorAll('.optional');

    // Adicionar botão para mostrar seções opcionais
    const showOptionalButton = document.createElement('button');
    showOptionalButton.textContent = 'Mostrar Seções Opcionais';
    document.body.appendChild(showOptionalButton);

    showOptionalButton.addEventListener('click', function() {
        optionalSections.forEach(section => {
            section.classList.toggle('show-optional');
        });
        if (showOptionalButton.textContent === 'Mostrar Seções Opcionais') {
            showOptionalButton.textContent = 'Esconder Seções Opcionais';
        } else {
            showOptionalButton.textContent = 'Mostrar Seções Opcionais';
        }
    });

    // Função para salvar dados dos campos
    function saveData() {
        const data = {};
        sections.forEach(section => {
            const id = section.id;
            const textarea = section.querySelector('textarea');
            data[id] = textarea.value;
        });
        console.log(data);
        // Implementar lógica para salvar os dados em um banco de dados ou local storage
    }

    // Adicionar botão para salvar dados
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar Dados';
    document.body.appendChild(saveButton);

    saveButton.addEventListener('click', saveData);
});
