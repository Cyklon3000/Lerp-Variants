class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Add another vector to this vector
    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    // Multiply the vector by a scalar value
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    // Calculate the magnitude (length) of the vector
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Normalize the vector (make its length equal to 1)
    normalize() {
        let mag = this.magnitude();
        if (mag === 0) {
            return new Vector2(0, 0); // Return zero vector if magnitude is zero
        }
        return new Vector2(this.x / mag, this.y / mag);
    }
}

// Set up the initial vector position for the circle
const circle = document.getElementById('circle');
let current = new Vector2(window.innerWidth / 2, window.innerHeight / 2); // Start at the center
let target = new Vector2(window.innerWidth / 2, window.innerHeight / 2);

// Setup current mode
const currentFunctionSelection = document.getElementById('current-function');
currentFunctionSelection.addEventListener("change", updateFunction);

// Setup variable setting
const variableSliders = document.getElementsByClassName('slider');

for (const slider of variableSliders) {
    slider.addEventListener('input', updateVariable, false);
    // get parents parent and then id ignoring the appended -slider
    slider.variable = (slider.parentElement.parentElement.id).replace('-slider', '');
    slider.label = slider.parentElement.parentElement.children[0];
}

let positionFunction = positionSetter;

let deltaTime = 0;
let lastTimestamp = Date.now();

// Variable to be set by the user
let baseVelocity = 300;
let referenceDistance = 300;

function updateFunction() {
    switch (currentFunctionSelection.value) {
        case 'positionSetter':
            positionFunction = positionSetter;
            setSliderVisibility(['baseVelocity', 'referenceDistance'], false);
            break;
        case 'staticVelocity':
            positionFunction = staticVelocity;
            setSliderVisibility(['baseVelocity'], true);
            setSliderVisibility(['referenceDistance'], false);
            break;
        case 'distanceVelocity':
            positionFunction = distanceVelocity;
            setSliderVisibility(['baseVelocity', 'referenceDistance'], true);
            break;
        case 'proximityVelocity':
            positionFunction = proximityVelocity;
            setSliderVisibility(['baseVelocity', 'referenceDistance'], true);
            break;
    }
}

function updateVariable() {
    this.label.textContent = (this.label.textContent).split(' - ')[0] + ' - ' + this.value;
    switch (this.variable) {
        case 'baseVelocity':
            baseVelocity = this.value;
            break;
        case 'referenceDistance':
            referenceDistance = this.value;
            break;
    }
}

function setSliderVisibility(sliderNames, isVisible) {
    for (const sliderName of sliderNames) {
        const settingsContainer = document.getElementById(`${sliderName}-slider`)

        if (!isVisible) {
            settingsContainer.classList.add('is-hidden');
        } else {
            settingsContainer.classList.remove('is-hidden');
        }
    }
}

// Update the circle position based on the vector2 values
function updateCirclePlacement(pos) {
    circle.style.transform = `translate(${pos.x - 25}px, ${pos.y - 25}px)`; // Centering the circle
    current = new Vector2(pos.x, pos.y);
}

function positionSetter() {
    updateCirclePlacement(target);
}

function staticVelocity() {
    let directionRaw = target.add(current.multiply(-1));
    let velocity = baseVelocity * deltaTime;

    if (directionRaw.magnitude() < velocity) {
        updateCirclePlacement(target);
        return;
    }

    let directionNormalized = directionRaw.normalize(); 
    let newPosition = current.add(directionNormalized.multiply(velocity));

    updateCirclePlacement(newPosition);
}

function distanceVelocity() {
    // Increased distance leads to increased velocity
    const minVelocity = 5 * deltaTime;
    let directionRaw = target.add(current.multiply(-1));
    let velocity = baseVelocity * (directionRaw.magnitude() / referenceDistance) * deltaTime;
    velocity = Math.max(velocity, minVelocity);

    if (directionRaw.magnitude() < velocity) {
        updateCirclePlacement(target);
        return;
    }

    let directionNormalized = directionRaw.normalize();
    let newPosition = current.add(directionNormalized.multiply(velocity));

    updateCirclePlacement(newPosition);
}

function proximityVelocity() {
    // Decreased distance leads to increased velocity
    const minVelocity = 5 * deltaTime;
    let directionRaw = target.add(current.multiply(-1));
    let velocity = baseVelocity * (referenceDistance / directionRaw.magnitude()) * deltaTime;
    velocity = Math.max(velocity, minVelocity);

    if (directionRaw.magnitude() < velocity) {
        updateCirclePlacement(target);
        return;
    }

    let directionNormalized = directionRaw.normalize();
    let newPosition = current.add(directionNormalized.multiply(velocity));

    updateCirclePlacement(newPosition);
}

function updateCirclePosition() {
    deltaTime = (Date.now() - lastTimestamp) / 1000;
    lastTimestamp = Date.now();

    positionFunction();

    requestAnimationFrame(updateCirclePosition);
}

// Event listener for mouse movement
document.addEventListener('mousemove', function(event) {
    // Update the target as a Vector2 object with the mouse coordinates
    target = new Vector2(event.clientX, event.clientY);
});

// Initial position update
updateCirclePosition();
