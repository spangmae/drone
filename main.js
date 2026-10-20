import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const manager = new THREE.LoadingManager();

let camera, scene, renderer, loader;
let rotor1, rotor2, rotor3, rotor4;
let index = 0;
let isPlay = false;

const container = document.createElement( 'div' );
document.body.appendChild( container );
const loading = document.getElementById( 'loading' );
loading.style.display = 'flex';

camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 20000 );
camera.position.set( -2, 2, 0 );
scene = new THREE.Scene();
scene.background = new THREE.Color( 0xc5ced6 );

// Cool sky and warm ground bounce, kept dim so albedo is not washed out.
const hemiLight = new THREE.HemisphereLight( 0xd6e6ff, 0x8a7358, 0.45 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

// Slightly warm key light, like daylight.
const dirLight = new THREE.DirectionalLight( 0xfff5e8, Math.PI );
dirLight.position.set( 6, 14, 8 );
dirLight.castShadow = true;
dirLight.shadow.mapSize.set( 2048, 2048 );
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 40;
dirLight.shadow.camera.top = 6;
dirLight.shadow.camera.bottom = -6;
dirLight.shadow.camera.left = -6;
dirLight.shadow.camera.right = 6;
dirLight.shadow.bias = -0.0004;
dirLight.shadow.normalBias = 0.02;
scene.add( dirLight );

// Cool fill from the opposite side so shadowed faces keep their color.
const fillLight = new THREE.DirectionalLight( 0xc5d4ea, 0.55 );
fillLight.position.set( -8, 6, -6 );
scene.add( fillLight );

const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 20, 20 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add( mesh );

const grid = new THREE.GridHelper( 20, 20, 0x00000, 0x00000 );
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add( grid );

const changePlay = (event) => {
    if (event.target.id === 'play') {
        index = 0;
        isPlay = true;
    } else {
        isPlay = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".button");
    buttons.forEach(button => {
        button.addEventListener("click", changePlay);
    })
});

loader = new GLTFLoader( manager );
loadAsset();

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const pmremGenerator = new THREE.PMREMGenerator( renderer );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;
scene.environmentIntensity = 0.8;
pmremGenerator.dispose();

renderer.setAnimationLoop( animate );
container.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0, 0 );
controls.update();
window.addEventListener( 'resize', onWindowResize );

function loadAsset() {
    loader.load( '/models/drone.glb', function ( gltf ) {
        const model = gltf.scene;
        console.log(model);
        model.scale.set(1, 1, 1)
        model.position.set(0, 0.2, 0);
        rotor1 = model.children[0].children[1].children[0].children[4].children[0].children[1].children[0].children[0].children[0];
        rotor2 = model.children[0].children[1].children[0].children[4].children[0].children[1].children[1].children[0].children[0];
        rotor3 = model.children[0].children[1].children[0].children[8].children[0].children[1].children[0].children[0].children[0];
        rotor4 =model.children[0].children[1].children[0].children[8].children[0].children[1].children[1].children[0].children[0];
        // ETH = 0x7bff0ea1Ad81fC2043f44Ee3Dba571f5107fF8F5
        // Sol = Avn9Rx3PXZLwmCBFJj9AyDjMWutxL7hUrrZ9KyoD7BAQ
        scene.add( model );
        loading.style.display = 'none';
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

let rotor1_x = 37 / 2;
let rotor1_y = 49.15 / 2;
let rotor2_x = 36.5 / 2;
let rotor2_y = 49.1 / 2;
let x1, x2, x3, x4;
let y1, y2, y3, y4;

function animate() {
    console.log("isplay = ", isPlay);
    if (rotor1 && isPlay) {
        const angle = index * 1.7;
        rotor1.rotation.z = angle;
        x1 = calc_pos(rotor1_x, rotor1_y, angle).x2;
        y1 = calc_pos(rotor1_x, rotor1_y, angle).y2;
        rotor1.position.set(-x1, y1, 0);

        rotor2.rotation.z = angle;
        x2 = calc_pos(-rotor2_x, rotor2_y, angle).x2;
        y2 = calc_pos(-rotor2_x, rotor2_y, angle).y2;
        rotor2.position.set(-x2, y2, 0);
        
        rotor3.rotation.z = angle;
        x3 = calc_pos(rotor1_x, -rotor1_y, angle).x2;
        y3 = calc_pos(rotor1_x, -rotor1_y, angle).y2;
        rotor3.position.set(-x3, y3, 0);
        
        rotor4.rotation.z = angle;
        x4 = calc_pos(-rotor2_x, -rotor2_y, angle).x2;
        y4 = calc_pos(-rotor2_x, -rotor2_y, angle).y2;
        rotor4.position.set(-x4, y4, 0);

        index ++;
    }
    renderer.render( scene, camera );
}

function calc_pos(x1, y1, alpha) {
    const r = Math.sqrt(x1 * x1 + y1 * y1);
    const sita = Math.atan2(y1, x1);
    const beta = sita - alpha;
    const x2 = x1 - r * Math.cos(beta);
    const y2 = y1 - r * Math.sin(beta);
    return {x2, y2};
}