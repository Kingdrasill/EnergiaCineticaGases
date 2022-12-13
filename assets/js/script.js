"use strict";

// Variavais do html
let btStart = document.getElementById('start'); // Botao start
let counter = document.getElementById('count'); // Div contador das bolas
let canvas = document.getElementById('canvas'); // Div canvas onde fica o 3D
let graficoCanvas = document.getElementById('mycanvas'); // Div do gráfico

let width = canvas.offsetWidth - 10; // Width do cnvas
let height = canvas.offsetHeight - 10; // Height do canvas

// Varaibles for setting render inicial
var count = 500; // Número de bolas iniciais
var radius = 0.025; // Raio das bolas
var range = 2;  // Tamanho da caixa
let maxpos = range - radius; // Posição máxima possível de uma bola

let balls = []; // Vetor que guarda as bolas e suas massas
let positionsInitials = []; // Vetor das posições iniciais das bolas
let velocitiesInitials = []; // Vetor das velocidades iniciais das bolas

let dataByTime = [];

let livrecaminho = 0;
let t = 0; // Tempo passado
let dt = 1/ 6000; // Instante de tempo

/* -------------------- Váriaveis --------------------*/
let gasConst = 8.314; // Constante do gás
let gasTemp = 298.15; // Temperatura do gás
let gasMassaMol = 32 * (10 ** -3); // Massa molar do gás
let gasVolume = (2*range) ** 3; // Volume do gás
let execTime = 1; // Tempo de execução

let gasVelocidade; // Velocidade quadrática média de uma molécula do gás
let gasTempo; // Tempo livre média das moléculas
let gasFreeWay; //Livre caminho médio de uma molécula do gás
/* ---------------------------------------------------*/

let run = false; // Mover ou não

// Variaveis usadas na hora de mover as bolas
var plus = new THREE.Vector3(); // Posição do centro mais o raio
var minus = new THREE.Vector3(); // Posição do centro menos o raio
var separation = new THREE.Vector3(); // Sepração de duas bolas
var p1 = new THREE.Vector3(); // Posição bola 1
var p2 = new THREE.Vector3(); // Posilçao bola 2
var v1 = new THREE.Vector3(); // Velocidade bola 1
var v2 = new THREE.Vector3(); // Velocidade bola 2
var m1 = 0; // Massa bola 1 
var m2 = 0; // Massa bola 2

// Setting html from javascript
counter.innerHTML = count; // Imprimindo contador de bolas
document.form_main.start.onclick = () => start(); // Dando start onclick() uma função
document.form_main.reset.onclick = () => reset(); // Dando reset onclick() uma função

// Cria uma cena para renderizar
var scene = new THREE.Scene();

// Cria os eixos cartesianos
const axesHelper = new THREE.AxesHelper( range );
scene.add( axesHelper );

// Cria o que vai renderizar a tela
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0x000000, 1);
canvas.appendChild(renderer.domElement);

// Cria a camera da cena
var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
camera.up.set(0, 0, 1);
camera.position.set(2 * range, 1.5 * range, 1.5 * range);
window.addEventListener('resize', function () {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Cria os controles de orbita
var controls = new THREE.OrbitControls(camera, renderer.domElement);

// Cria a caixa onde as bolas estão dentro
var box = new THREE.Geometry();
box.vertices.push(new THREE.Vector3(-range, -range, -range));
box.vertices.push(new THREE.Vector3(range, range, range));

// Cria a malha da caixa
var boxMesh = new THREE.Line(box);
var caixa = new THREE.BoxHelper(boxMesh, 'white');
scene.add(caixa);

// Cria um fonte de luz na camera
var light = new THREE.DirectionalLight(0xffffff, .8);
light.position.set(-range, range, 0);
camera.add(light);

// Cria uma luz ambiente
var ambient = new THREE.AmbientLight(0x555555);
scene.add(camera);
scene.add(ambient);

/* ------------------------------------------------------------------------------------------------------------------ */

// Pegando os valores das variáveis
const Modal = {
    open(){
        //Abrir modal e adicionar classe 'active' ao modal
        document
            .querySelector('.modal-overlay')
            .classList.add('active')
    },
    close(){
        //Fechar modal e remover classe 'active' do modal
        document
            .querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

//Salva as variáveis
let saveButton = document.querySelector("#saveButton")
saveButton.addEventListener("click", (event) => {
    event.preventDefault()

    let varForm = document.querySelector("#varForm")

    gasConst = Number(varForm.R.value)
    gasTemp = Number(varForm.T.value)
    gasMassaMol = Number(varForm.M.value)
    gasVolume = Number(varForm.V.value)
    execTime = Number(varForm.tempo.value)

    if (gasVolume < 64){
        alert("O volume do gás não pode ser menor que 64m³.")
        gasVolume = 64
        alert("Volume do gás igualado a 64m³.")
    }

    range = (gasVolume ** (1/3)) / 2;
    scene.remove(caixa);

    box = new THREE.Geometry();
    box.vertices.push(new THREE.Vector3(-range, -range, -range));
    box.vertices.push(new THREE.Vector3(range, range, range));
    boxMesh = new THREE.Line(box);
    caixa = new THREE.BoxHelper(boxMesh, 'white');
    scene.add(caixa);

    let input = document.getElementById('R');
    input.value = gasConst;
    input = document.getElementById('T');
    input.value = gasTemp;
    input = document.getElementById('M');
    input.value = gasMassaMol;
    input = document.getElementById('V');
    input.value = gasVolume;
    input = document.getElementById('tempo');
    input.value = execTime;

    gasVelocidade = Math.sqrt((3 * gasConst * gasTemp) / (gasMassaMol));
    var mass = gasMassaMol / (6.02 * (10 ** 23));

    velocitiesInitials.splice(0, velocitiesInitials.length);
    for(var i=0; i<count; i++) {
        var phi = (Math.PI / 180) * (Math.random() * 360);
        var theta = (Math.PI / 180) * (Math.random() * 360);
        balls[i][0].v =  new THREE.Vector3().setFromSphericalCoords(gasVelocidade, phi, theta);
        velocitiesInitials.push(balls[i][0].v.clone());
        balls[i][1] = mass;
    }
})

function setInitialValues() {
    let input = document.getElementById('R');
    input.value = gasConst;
    input = document.getElementById('T');
    input.value = gasTemp;
    input = document.getElementById('M');
    input.value = gasMassaMol;
    input = document.getElementById('V');
    input.value = gasVolume;
    input = document.getElementById('tempo');
    input.value = execTime;

    gasVelocidade = Math.sqrt((3 * gasConst * gasTemp) / (gasMassaMol));
    var mass = gasMassaMol / (6.02 * (10 ** 23));

    // Cria as bolas iniciais
    for (var i = 0; i < count; i++) {

        // Cria uma esfera
        var geometry = new THREE.SphereGeometry(radius, 20, 20);

        // Cria o material da esfera
        var material = new THREE.MeshPhongMaterial();
        if(i > 0)
            material.color = new THREE.Color().setHSL(0.67, 1, .5);
        else
            material.color = new THREE.Color().setHSL(0, 1, .5);

        // Cria a bola
        var ball = new THREE.Mesh(geometry, material);

        // Consede uma posição aleatória para bola
        ball.position.set( parseFloat((maxpos * (2 * Math.random() - 1)).toFixed(3)),
            parseFloat((maxpos * (2 * Math.random() - 1)).toFixed(3)),
            parseFloat((maxpos * (2 * Math.random() - 1)).toFixed(3)) );
        positionsInitials.push(ball.position.clone());

        // Consede uma velocidade aleatória para bola
        var phi = (Math.PI / 180) * (Math.random() * 360);
        var theta = (Math.PI / 180) * (Math.random() * 360);
        ball.v =  new THREE.Vector3().setFromSphericalCoords(gasVelocidade, phi, theta);
        velocitiesInitials.push(ball.v.clone());

        // Consede um nome para bola 
        ball.name = 'ball' + i;
        
        var ball2 = [ball, mass];
        
        balls.push(ball2);
        scene.add(ball);
    }
}

/* ------------------------------------------------------------------------------------------------------------------ */

// Mover e resolver colisões das bolas
function moveBalls(dt) {    
    for (var i = 0; i < count; i++) {
        // Pega uma bola
        var b1 = balls[i][0];

        // Verifica se a bola está dentro de uma parede
        plus.copy(b1.position).addScalar(radius);
        minus.copy(b1.position).subScalar(radius);
        if (plus.x > range || minus.x < -range) b1.v.x = -b1.v.x;
        if (plus.y > range || minus.y < -range) b1.v.y = -b1.v.y;
        if (plus.z > range || minus.z < -range) b1.v.z = -b1.v.z;

        for (var j = i + 1; j < count; j++) {
            // Pega outra bola
            var b2 = balls[j][0];

            // Verifica se as bolas estão colindindo
            separation.copy(b1.position).sub(b2.position);
            if (separation.length() < 2 * radius) {

                p1 = b1.position.clone();
                m1 = balls[i][1];
                v1 = b1.v.clone();

                p2 = b2.position.clone();
                m2 = balls[j][1];
                v2 = b2.v.clone();

                // Novas velocidades
                var newv1 = v1.clone().sub(p1.clone().sub(p2).multiplyScalar((2 * m2) / (m1 + m2) * ((v1.clone().sub(v2).dot(p1.clone().sub(p2))) / Math.pow((p1.clone().sub(p2).length()), 2))));
                var newv2 = v2.clone().sub(p2.clone().sub(p1).multiplyScalar((2 * m1) / (m1 + m2) * ((v2.clone().sub(v1).dot(p2.clone().sub(p1))) / Math.pow((p2.clone().sub(p1).length()), 2))));

                b1.v = newv1;
                b2.v = newv2;

                if(b1.name == "ball0") {
                    var colision = [livrecaminho, b1.v.clone().length(), t]
                    dataByTime.push(colision);
                    livrecaminho = 0;
                }
            }

        }
        
        if(b1.name == "ball0") {
            livrecaminho += b1.v.clone().multiplyScalar(dt).length();
        }
        b1.position.add(b1.v.clone().multiplyScalar(dt));
    }
}

let atualiza = 0
// Começa renderizar
function render() {
    // Setando fps para 60
    setTimeout( function() {requestAnimationFrame( render );}, 1000 / 60 );
    renderer.render(scene, camera);

    if (run && t < execTime) {
        t += dt
        updateClock(t);
        moveBalls(dt);
    } else if (t >= execTime) {
        reset();
        createChart();
    }
}

render();

// Método para atualizar o timer
function updateClock( t ) {
    let minute = document.getElementById('minute');
    let second = document.getElementById('second');
    let millisecond = document.getElementById('millisecond');

    minute.innerHTML = Math.floor(t/60) >= 10 ? Math.floor((t/60)) : `0${Math.floor((t/60))}`;
    second.innerHTML = Math.floor(t%60) >= 10 ? Math.floor(t%60) : `0${Math.floor(t%60)}`;
    millisecond.innerHTML = Math.floor((t*1000)%1000)-1 >= 100 ? Math.floor((t*1000)%1000)-1 : `0${Math.floor((t*1000)%1000)-1}`;
}

// Método para começar e pausar o tempo
function start() {
    run = false;

    if (btStart.innerHTML == 'START') {
        btStart.innerHTML = 'STOP';
        btStart.setAttribute('style', 'background-color: red');
        run = true;
        
        gasVelocidade = Math.sqrt((3*gasConst*gasTemp)/gasMassaMol);
        gasTempo = gasVolume/(4 * Math.PI * Math.sqrt(2) * (radius ** 2) * gasVelocidade * count);
        gasFreeWay = gasVolume/(4 * Math.PI * Math.sqrt(2) * (radius ** 2) * count);

        livrecaminho = 0;
        dataByTime.splice(0, dataByTime.length);

        var initial = [null , balls[0][0].v.clone().length(), 0];
        dataByTime.push(initial);

        scene.remove( axesHelper );
    } else if (btStart.innerHTML == 'STOP') {
        btStart.innerHTML = 'START';
        btStart.setAttribute('style', 'background-color: green');
        scene.add( axesHelper );
    }
}

// Método para resetar a simulação
function reset() {
    run = false;

    if (btStart.innerHTML == 'STOP') {
        btStart.innerHTML = 'START';
        btStart.setAttribute('style', 'background-color: green');
        scene.add( axesHelper );
    }
    t=0;
    document.getElementById('minute').innerText = '00';
    document.getElementById('second').innerText = '00';
    document.getElementById('millisecond').innerText = '000';
    restore();
}

// Chamado na hora que o botão reset é apertado para retornar os dos iniciais das bolas
function restore() {
    for(let i=0; i<count; i++) {
        var b1 = balls[i][0];

        b1.position.copy(positionsInitials[i].clone());
        b1.v.copy(velocitiesInitials[i].clone());
    }
}

// Criação de gráficos
let myChart =  new Chart();

function createChart() {
    resetChart();
    graficoCanvas.setAttribute('style', 'height: 550px');

    let colisions = [];
    let velocities = [];
    let times = [];

    for(var i=0; i<dataByTime.length; i++) {
        colisions.push(dataByTime[i][0]);
        velocities.push(dataByTime[i][1]);
        times.push(dataByTime[i][2]);
    }

    let mydata = [];
    let col = {
        label: `Distância sem colidir`,
        data: colisions,
        fill: false,
        borderColor: "red"
    }
    let vel = {
        label: `Velocidade`,
        data: velocities,
        fill: false,
        borderColor: "green"
    }
    mydata.push(col)
    mydata.push(vel);

    let data = {
        labels: times,
        datasets: mydata,
    };

    let config = {
        type: 'line',
        data: data,
        options: {
            animation: {
                duration: 0.5,
            },
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Tempo (s)',
                        font: {
                            size: 16,
                            weight: 'bold',
                        },
                        padding: {top: 10, left: 0, right: 0, bottom: 0}
                    }
                }
            },
            plugins: {
                legend: {
                    positon: 'top',
                },
                title: {
                    display: true,
                    text: 'Molécula vermelha durante o tempo',
                    color: '#444',
                    font: {
                        size: 24,
                        weight: 'bold',
                    },
                    padding: {top: 0, left: 0, right: 0, bottom: 10}
                }
            }
        },
    };

    document.querySelector('.list').classList.add('active')
    document.querySelector('.divider').classList.add('active')

    myChart = new Chart(document.getElementById('myChart'),config);

    let text = document.getElementById('vrmq');
    text.innerHTML = "Velocidade quadratíca média das moléculas do gás: <span class=\"items\">" + gasVelocidade.toFixed(5) + " m/s</span>";
    
    text = document.getElementById('tmed');
    text.innerHTML = "Tempo livre médio das moléculas do gás: <span class=\"items\">" + gasTempo.toFixed(5) + " s</span>";
    
    text = document.getElementById('livrecaminho');
    text.innerHTML = "Caminho livre médio das moléculas do gás: <span class=\"items\">" + gasFreeWay.toFixed(5) + " m</span>";
    
    text = document.getElementById('datatmed');
    var media = 0;
    for(var i=1; i<times.length; i++) {
        media += (times[i] - times[i-1]);
    }
    media = media / (times.length-1);
    text.innerHTML = "Tempo livre médio de uma molécula do gás: <span class=\"items\">" + media.toFixed(5) + " s</span>";
    
    text = document.getElementById('datalivrecaminho');
    media = 0;
    for(var i=1; i<colisions.length; i++) {
        media += colisions[i];
    }
    media = media / (colisions.length-1);
    text.innerHTML = "Caminho livre médio de uma molécula do gás: <span class=\"items\">" + media.toFixed(5) + " m</span>";
}

function resetChart() {
    myChart.destroy();
    graficoCanvas.setAttribute('style', 'height: 0');
    let text = document.getElementById('vrmq');
    text.innerHTML = "";
    text = document.getElementById('tmed');
    text.innerHTML = "";
    text = document.getElementById('livrecaminho');
    text.innerHTML = "";
    text = document.getElementById('datatmed');
    text.innerHTML = "";
    text = document.getElementById('datalivrecaminho');
    text.innerHTML = "";
}