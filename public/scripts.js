// Three.js - Visualización 3D del Tacho
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, 400);  // Ajustar tamaño del canvas
document.getElementById('tacho3d').appendChild(renderer.domElement);

// Crear el modelo del tacho en 3D
const geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const tacho = new THREE.Mesh(geometry, material);
scene.add(tacho);

// Configurar la posición de la cámara
camera.position.z = 30;

// Animar el modelo 3D
function animate() {
    requestAnimationFrame(animate);
    tacho.rotation.x += 0.01;
    tacho.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

// D3.js - Gráfico Dinámico del Nivel de Llenado
const data = [30, 40, 60, 80, 90, 100];  // Simulación de datos
const svg = d3.select("#chart").append("svg")
    .attr("width", 500)
    .attr("height", 500);

svg.selectAll("rect")
   .data(data)
   .enter()
   .append("rect")
   .attr("x", (d, i) => i * 30)
   .attr("y", d => 500 - d * 5)
   .attr("width", 20)
   .attr("height", d => d * 5)
   .attr("fill", "cyan");

// Simulación de actualización de datos
setInterval(() => {
    const newData = data.map(d => d + (Math.random() * 10 - 5));  // Datos dinámicos
    svg.selectAll("rect")
        .data(newData)
        .transition()
        .duration(1000)
        .attr("y", d => 500 - d * 5)
        .attr("height", d => d * 5);
}, 2000);
