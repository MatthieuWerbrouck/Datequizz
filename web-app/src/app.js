document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('itemForm');
    const generateExerciseButton = document.getElementById('generateExercise');
    const validateExerciseButton = document.getElementById('validateExercise');
    const clearListButton = document.getElementById('clearList');
    const exerciseOutput = document.getElementById('exerciseOutput');
    const validationResult = document.getElementById('validationResult');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const date = document.getElementById('date').value;
        const label = document.getElementById('label').value;
        const summary = document.getElementById('summary').value;

        addItem(date, label, summary);
        form.reset();
    });

    generateExerciseButton.addEventListener('click', () => {
        const exercise = generateExercise();
        displayExercise(exercise);
    });

    validateExerciseButton.addEventListener('click', () => {
        validateExercise();
    });

    clearListButton.addEventListener('click', () => {
        clearList();
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

    function generateExercise() {
        const items = readItems();
        if (items.length === 0) {
            return [];
        }
        const exerciseItems = items.sort(() => 0.5 - Math.random()).slice(0, 5);
        return exerciseItems;
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

        exercise.forEach(item => {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'exercise-item';
            dateDiv.textContent = item.date;
            datesContainer.appendChild(dateDiv);

            const labelDiv = document.createElement('div');
            labelDiv.className = 'exercise-item';
            labelDiv.textContent = item.label;
            labelsContainer.appendChild(labelDiv);
        });

        exerciseOutput.appendChild(datesContainer);
        exerciseOutput.appendChild(labelsContainer);

        new Sortable(datesContainer, {
            group: 'shared',
            animation: 150
        });

        new Sortable(labelsContainer, {
            group: 'shared',
            animation: 150
        });
    }
    
    function validateExercise() {
        resetValidationClasses();
    
        const datesContainer = document.getElementById('datesContainer');
        const labelsContainer = document.getElementById('labelsContainer');
        const dateItems = datesContainer.getElementsByClassName('exercise-item');
        const labelItems = labelsContainer.getElementsByClassName('exercise-item');
    
        let correct = true;
        for (let i = 0; i < dateItems.length; i++) {
            const date = dateItems[i].textContent;
            const label = labelItems[i].textContent;
            const items = readItems();
            const item = items.find(item => item.date === date && item.label === label);
            if (item) {
                dateItems[i].classList.add('correct');
                labelItems[i].classList.add('correct');
                console.log(`Correct: ${date} - ${label}`);
            } else {
                dateItems[i].classList.add('incorrect');
                labelItems[i].classList.add('incorrect');
                console.log(`Incorrect: ${date} - ${label}`);
                correct = false;
            }
        }
    
        validationResult.textContent = correct ? 'Toutes les associations sont correctes !' : 'Il y a des erreurs dans les associations.';
    }

    function resetValidationClasses() {
        const dateItems = document.querySelectorAll('#datesContainer .exercise-item');
        const labelItems = document.querySelectorAll('#labelsContainer .exercise-item');
    
        dateItems.forEach(item => {
            item.classList.remove('correct', 'incorrect');
        });
    
        labelItems.forEach(item => {
            item.classList.remove('correct', 'incorrect');
        });
    }

    function clearList() {
        localStorage.removeItem('items');
        exerciseOutput.innerHTML = '';
        validationResult.textContent = '';
    }
});