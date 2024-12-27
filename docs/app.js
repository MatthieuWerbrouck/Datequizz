document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('itemForm');
    const generateExerciseButton = document.getElementById('generateExercise');
    const validateExerciseButton = document.getElementById('validateExercise');
    const clearListButton = document.getElementById('clearList');
    const exportJsonButton = document.getElementById('exportJson');
    const importJsonButton = document.getElementById('importJson');
    const fileInput = document.getElementById('fileInput');
    const exerciseOutput = document.getElementById('exerciseOutput');
    const validationResult = document.getElementById('validationResult');
    const openModalButton = document.getElementById('openModal');
    const modal = document.getElementById('myModal');
    const closeModalButton = document.getElementsByClassName('close')[0];

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

        const datesContainer = document.createElement('div');
        datesContainer.id = 'datesContainer';
        const labelsContainer = document.createElement('div');
        labelsContainer.id = 'labelsContainer';
        const summariesContainer = document.createElement('div');
        summariesContainer.id = 'summariesContainer';

        // Ajouter les titres des colonnes
        const dateTitle = document.createElement('h3');
        dateTitle.textContent = 'Dates';
        datesContainer.appendChild(dateTitle);

        const labelTitle = document.createElement('h3');
        labelTitle.textContent = 'Libellés';
        labelsContainer.appendChild(labelTitle);

        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = 'Résumés';
        summariesContainer.appendChild(summaryTitle);

        // Mélanger les éléments de chaque colonne
        const dates = exercise.map(item => item.date);
        const labels = exercise.map(item => item.label);
        const summaries = exercise.map(item => item.summary);

        shuffleArray(dates);
        shuffleArray(labels);
        shuffleArray(summaries);

        dates.forEach(date => {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'exercise-item';
            dateDiv.textContent = date;
            datesContainer.appendChild(dateDiv);
        });

        labels.forEach(label => {
            const labelDiv = document.createElement('div');
            labelDiv.className = 'exercise-item';
            labelDiv.textContent = label;
            labelsContainer.appendChild(labelDiv);
        });

        summaries.forEach(summary => {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'exercise-item';
            summaryDiv.textContent = summary;
            summariesContainer.appendChild(summaryDiv);
        });

        exerciseOutput.appendChild(datesContainer);
        exerciseOutput.appendChild(labelsContainer);
        exerciseOutput.appendChild(summariesContainer);

        new Sortable(datesContainer, {
            group: 'shared',
            animation: 150
        });

        new Sortable(labelsContainer, {
            group: 'shared',
            animation: 150
        });

        new Sortable(summariesContainer, {
            group: 'shared',
            animation: 150
        });
    }

    function validateExercise() {
        resetValidationClasses();

        const datesContainer = document.getElementById('datesContainer');
        const labelsContainer = document.getElementById('labelsContainer');
        const summariesContainer = document.getElementById('summariesContainer');
        const dateItems = datesContainer.getElementsByClassName('exercise-item');
        const labelItems = labelsContainer.getElementsByClassName('exercise-item');
        const summaryItems = summariesContainer.getElementsByClassName('exercise-item');

        let correct = true;
        for (let i = 0; i < dateItems.length; i++) {
            const date = dateItems[i].textContent;
            const label = labelItems[i].textContent;
            const summary = summaryItems[i].textContent;
            const items = readItems();
            const item = items.find(item => item.date === date && item.label === label && item.summary === summary);
            if (item) {
                dateItems[i].classList.add('correct');
                labelItems[i].classList.add('correct');
                summaryItems[i].classList.add('correct');
                console.log(`Correct: ${date} - ${label} - ${summary}`);
            } else {
                dateItems[i].classList.add('incorrect');
                labelItems[i].classList.add('incorrect');
                summaryItems[i].classList.add('incorrect');
                console.log(`Incorrect: ${date} - ${label} - ${summary}`);
                correct = false;
            }
        }

        validationResult.textContent = correct ? 'Toutes les associations sont correctes !' : 'Il y a des erreurs dans les associations.';
    }

    function resetValidationClasses() {
        const dateItems = document.querySelectorAll('#datesContainer .exercise-item');
        const labelItems = document.querySelectorAll('#labelsContainer .exercise-item');
        const summaryItems = document.querySelectorAll('#summariesContainer .exercise-item');

        dateItems.forEach(item => {
            item.classList.remove('correct', 'incorrect');
        });

        labelItems.forEach(item => {
            item.classList.remove('correct', 'incorrect');
        });

        summaryItems.forEach(item => {
            item.classList.remove('correct', 'incorrect');
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