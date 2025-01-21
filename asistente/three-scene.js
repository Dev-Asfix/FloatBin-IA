// three-scene.js
const sceneContainer = document.getElementById('scene-container');

// Crear la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202124);

// Crear la cámara
const camera = new THREE.PerspectiveCamera(75, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 1000);
camera.position.z = 5;

// Crear el renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
sceneContainer.appendChild(renderer.domElement);

// Crear geometría (Ejemplo: Cubo)
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x6200EA });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Iluminación futurista
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x404040); // Luz suave
scene.add(ambientLight);

// Control de zoom y rotación
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enableZoom = true;
controls.maxPolarAngle = Math.PI / 2; // Limita la rotación vertical

// Función de animación
function animate() {
    requestAnimationFrame(animate);

    // Animación del cubo
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Actualizar controles
    controls.update();

    // Renderizar la escena
    renderer.render(scene, camera);
}

// Ajustar el tamaño de la escena cuando se cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    const width = sceneContainer.clientWidth;
    const height = sceneContainer.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

animate();
