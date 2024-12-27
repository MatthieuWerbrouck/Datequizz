document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('itemForm');
    const generateExerciseButton = document.getElementById('generateExercise');
    const validateExerciseButton = document.getElementById('validateExercise');
    const clearListButton = document.getElementById('clearList');
    const exportJsonButton = document.getElementById('exportJson');
    const importJsonButton = document.getElementById('importJson');
    const openOptionsButton = document.getElementById('openOptions');
    const fileInput = document.getElementById('fileInput');
    const exerciseOutput = document.getElementById('exerciseOutput');
    const validationResult = document.getElementById('validationResult');
    const openModalButton = document.getElementById('openModal');
    const difficultySelect = document.getElementById('difficulty');
    const modal = document.getElementById('myModal');
    const optionsModal = document.getElementById('optionsModal');
    const closeModalButton = document.getElementsByClassName('close')[0];
    const closeOptionsButton = document.getElementsByClassName('close-options')[0];
    const optionsForm = document.getElementById('optionsForm');

    // Charger les options depuis localStorage
    const savedDifficulty = localStorage.getItem('difficulty');
    if (savedDifficulty) {
        difficultySelect.value = savedDifficulty;
    }

    openModalButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    openOptionsButton.addEventListener('click', () => {
        optionsModal.style.display = 'block';
    });

    closeOptionsButton.addEventListener('click', () => {
        optionsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == optionsModal) {
            optionsModal.style.display = 'none';
        }
    });

    optionsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        localStorage.setItem('difficulty', difficultySelect.value);
        optionsModal.style.display = 'none';
        generateAndDisplayExercise(); // Générer un nouveau test après la modification des options
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const dateFormat = document.getElementById('dateFormat').value;
        const date = document.getElementById('date').value;
        const label = document.getElementById('label').value;
        const summary = document.getElementById('summary').value;

        if (!validateDate(date, dateFormat)) {
            alert('Format de date invalide. Utilisez YYYY pour Année ou MM/YYYY pour Mois-Année.');
            return;
        }

        addItem(date, label, summary);
        form.reset();
        modal.style.display = 'none';
        generateAndDisplayExercise();
    });

    generateExerciseButton.addEventListener('click', () => {
        generateAndDisplayExercise();
    });

    validateExerciseButton.addEventListener('click', () => {
        validateExercise();
    });

    clearListButton.addEventListener('click', () => {
        clearList();
    });

    exportJsonButton.addEventListener('click', () => {
        exportJson();
    });

    importJsonButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const items = JSON.parse(e.target.result);
                    if (Array.isArray(items)) {
                        writeItems(items);
                        generateAndDisplayExercise();
                    } else {
                        alert('Le fichier JSON doit contenir un tableau d\'éléments.');
                    }
                } catch (error) {
                    alert('Erreur lors de la lecture du fichier JSON.');
                }
            };
            reader.readAsText(file);
        }
    });

    function readItems() {
        const items = localStorage.getItem('items');
        return items ? JSON.parse(items) : [];
    }

    function writeItems(items) {
        localStorage.setItem('items', JSON.stringify(items));
    }

    function addItem(date, label, summary) {
        const items = readItems();
        items.push({ date, label, summary });
        writeItems(items);
    }

    function validateDate(date, format) {
        if (format === 'year') {
            return /^\d{4}$/.test(date); // Vérifie le format YYYY
        } else if (format === 'month-year') {
            return /^(0[1-9]|1[0-2])\/\d{4}$/.test(date); // Vérifie le format MM/YYYY
        }
        return false;
    }

    function generateExercise() {
        const items = readItems();
        return items;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function displayExercise(exercise) {
        exerciseOutput.innerHTML = '';

        if (exercise.length === 0) {
            exerciseOutput.textContent = 'Aucun exercice à afficher.';
            return;
        }

        const table = document.createElement('table');
        table.className = 'exercise-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Date', 'Libellé', 'Résumé'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        const dates = exercise.map(item => item.date);
        const labels = exercise.map(item => item.label);
        const summaries = exercise.map(item => item.summary);

        shuffleArray(dates);
        shuffleArray(labels);
        shuffleArray(summaries);

        const difficulty = difficultySelect.value;

        // Mélanger les éléments de l'exercice
        shuffleArray(exercise);

        exercise.forEach(item => {
            const row = document.createElement('tr');

            const dateCell = document.createElement('td');
            const labelCell = document.createElement('td');
            const summaryCell = document.createElement('td');

            const emptyIndices = difficulty === 'easy' ? [Math.floor(Math.random() * 3)] : [Math.floor(Math.random() * 3), (Math.floor(Math.random() * 2) + 1) % 3];

            if (emptyIndices.includes(0)) {
                dateCell.appendChild(createDropdown(dates, item.date));
            } else {
                dateCell.textContent = item.date;
            }

            if (emptyIndices.includes(1)) {
                labelCell.appendChild(createDropdown(labels, item.label));
            } else {
                labelCell.textContent = item.label;
            }

            if (emptyIndices.includes(2)) {
                summaryCell.appendChild(createDropdown(summaries, item.summary));
            } else {
                summaryCell.textContent = item.summary;
            }

            row.appendChild(dateCell);
            row.appendChild(labelCell);
            row.appendChild(summaryCell);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        exerciseOutput.appendChild(table);
    }

    function createDropdown(options, correctValue) {
        const select = document.createElement('select');
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
        select.dataset.correctValue = correctValue;
        return select;
    }

    function validateExercise() {
        resetValidationClasses();

        const rows = document.querySelectorAll('.exercise-table tbody tr');
        let correct = true;

        rows.forEach(row => {
            const cells = row.children;
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                if (cell.children.length > 0 && cell.children[0].tagName === 'SELECT') {
                    const select = cell.children[0];
                    if (select.value === select.dataset.correctValue) {
                        select.classList.add('correct');
                    } else {
                        select.classList.add('incorrect');
                        correct = false;
                    }
                }
            }
        });

        validationResult.textContent = correct ? 'Toutes les associations sont correctes !' : 'Il y a des erreurs dans les associations.';
    }

    function resetValidationClasses() {
        const selects = document.querySelectorAll('.exercise-table select');
        selects.forEach(select => {
            select.classList.remove('correct', 'incorrect');
        });
    }

    function clearList() {
        localStorage.removeItem('items');
        exerciseOutput.innerHTML = '';
        validationResult.textContent = '';
        modal.style.display = 'block';
    }

    function exportJson() {
        const items = readItems();
        const json = JSON.stringify(items, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'items.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function generateAndDisplayExercise() {
        const exercise = generateExercise();
        if (exercise.length === 0) {
            modal.style.display = 'block';
        } else {
            displayExercise(exercise);
        }
    }

    // Générer et afficher l'exercice automatiquement au chargement de la page
    generateAndDisplayExercise();
});