console.log('Script is running');
console.log('Script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const form = document.getElementById('userForm');
    const quoteButton = document.getElementById('simpsonQuote');
    const quoteDisplay = document.getElementById('quoteDisplay');
    console.log('Form element:', form);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();// Prevenir el envío por defecto del formulario
            console.log('Form submitted');
            const name = document.getElementById('name').value.trim();
            const age = document.getElementById('age').value;
            console.log('Name:', name, 'Age:', age);
            alert('Form submitted: ' + name + ', ' + age);

            // Validar que los campos sean requeridos
            if (!name || !age) {
                console.log('Campos incompletos');
                console.log('Por favor, completa todos los campos.');
                return;
            }

            // Validar que la edad esté entre 1 y 100 años
            if (age < 1 || age > 100) {
                console.log('Edad fuera de rango');
                console.log('La edad debe estar entre 1 y 100 años.');
                return;
            }

            // Si todas las validaciones se cumplen, mostrar los datos en la consola
            console.log('Validaciones pasadas, mostrando datos');
            console.log(`Tu nombre completo es ${name}, y tu edad es ${age} años`);

            // Guardar el nombre en el Local Storage
            localStorage.setItem('nombre', name);

            // Verificar que se haya guardado correctamente
            const storedName = localStorage.getItem('nombre');
            if (storedName === name) {
                console.log(`Nombre "${storedName}" guardado correctamente en Local Storage.`);
            } else {
                console.log('Error al guardar el nombre en Local Storage.');
            }

            // Extra: Recuperar el nombre del Local Storage y mostrarlo en la consola
            console.log(`👽 Nombre recuperado del Local Storage: ${localStorage.getItem('nombre')}`);
        });
    } else {
        console.error('Form element not found');
    }

    // Obtener frase de Los Simpson
    if (quoteButton) {
        quoteButton.addEventListener('click', () => {
            console.log('Quote button clicked');
            fetch('https://thesimpsonsquoteapi.glitch.me/quotes')
                .then(response => response.json())
                .then(data => {
                    console.log('API response:', data[0]);
                    quoteDisplay.innerHTML = `
                        <p>"${data[0].quote}"</p>
                        <p>- ${data[0].character}</p>
                        <img src="${data[0].image}" alt="${data[0].character}">
                    `;
                })
                .catch(error => console.error('Error fetching quote:', error));
        });
    } else {
        console.error('Quote button not found');
    }
});