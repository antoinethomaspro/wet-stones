import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import GUI from 'lil-gui'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'


/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */

const gltfLoader = new GLTFLoader()

gltfLoader.load(
    '/models/Rock/Rocks.glb',
    (gltf) => {
        // console.log(gltf)


        gltf.scene.traverse((node) => {
            if (node.isMesh) {
                console.log('Mesh:', node);
                console.log('Material:', node.material);
            }
        });

        // Now add the loaded scene to your main scene
        const rootnode = gltf.scene.children[0]; // This is the rootnode
        const rock_3 = rootnode.children[0]; // This is the actual mesh

        // Modify properties of rock_3 as needed
        // rock_3.material.color.set(0xff0000); // Example: change color to red
        rock_3.material.wireframe = false; // Example: render as wireframe
        rock_3.material.color = new THREE.Color(0x000000); // Example: change color to green
        rock_3.material.roughness = 0.2; // Example: change roughness
        rock_3.material.metalness = 0.8;
        rock_3.material.cler
        
        // Scale the rootnode
        rootnode.scale.set(10, 10, 10);

        // Add the rootnode (with its children) to the scene
        scene.add(rootnode);
    },
    () => {
        console.log("progress")
    },
    () => {
        console.log('An error happened')
    }
)

gltfLoader.load(
    '/models/Tree/tree.glb',
    (gltf) => {
        console.log(gltf)
        const tree = gltf.scene.children[0]
        tree.scale.set(0.05, 0.05, 0.05)
        tree.position.set(1, 0, 1)
        scene.add(tree)
    },
    () => {
        console.log("progress")
    },
    () => {
        console.log('An error happened: tree')
    }
)




/**
 * Floor
 */

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        wireframe: false,
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)

floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.4)
scene.add(directionalLight)
scene.add(ambientLight)

/**
 * Axis Helper
 */
const axesHelper = new THREE.AxesHelper(1)
scene.add(axesHelper)


/**
 * Test mesh
 */
// Geometry
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 3
const positionArray = new Float32Array(firefliesCount * 3)
const originalPositions = [] // To store the original positions of the fireflies

for (let i = 0; i < firefliesCount; i++) {
    const x = ((Math.random() - 0.5) * 2) - 2
    const y = (Math.random() * 1.5) + 1.0
    const z = ((Math.random() - 0.5) * 2) - 2

    positionArray[i * 3 + 0] = x
    positionArray[i * 3 + 1] = y
    positionArray[i * 3 + 2] = z

    originalPositions.push(new THREE.Vector3(x, y, z))
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))

//material
const firefliesMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uTime: { value: 0 },
        uSize: { value: 100 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})

gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(100).step(1).name('fireflies size')

// Mesh
// const mesh = new THREE.Mesh(geometry, material)

const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)


// Create and add PointLights
const pointLights = [];
for (let i = 0; i < firefliesCount; i++) {
    const pointLight = new THREE.PointLight(0xffffff, 1, 10); // (color, intensity, distance)
    pointLights.push(pointLight);
    scene.add(pointLight);
}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update fireflies
    fireflies.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update materials
    firefliesMaterial.uniforms.uTime.value = elapsedTime


     // Update PointLight positions
     for (let i = 0; i < firefliesCount; i++) {
        const originalPosition = originalPositions[i];
        const updatedY = originalPosition.y + Math.sin(elapsedTime);
        pointLights[i].position.set(originalPosition.x, updatedY, originalPosition.z);
    }



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()