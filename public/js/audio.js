var audCtx;
var oscCtx;
var gainCtx;

var analyser;
var freqDataArray;
var currentGain;

var OSC_WIDTH = 500;
var OSC_HEIGHT = 200;
var OSC_HEIGHT_MID = OSC_HEIGHT / 2;

var GAIN_WIDTH = 30;
var GAIN_HEIGHT = 200;

var FFT_SIZE = 512;
var FREQ_BIN_COUNT = FFT_SIZE / 2;
var FREQ_WIDTH = OSC_WIDTH / (FREQ_BIN_COUNT + 1);
var PROCESSOR_BUFFER_SIZE = 4096;
var STERIO_CHANNEL_COUNT = 2;

function drawOscilloscope() {
    oscCtx.fillStyle = "#000000";
    oscCtx.fillRect(0, 0, OSC_WIDTH, OSC_HEIGHT);

    oscCtx.lineWidth = 4;
    oscCtx.strokeStyle = "#cc0000";
    oscCtx.beginPath();
    oscCtx.moveTo(0, OSC_HEIGHT_MID);

    for (var i = 0; i < FREQ_BIN_COUNT; i++) {
        var f = freqDataArray[i];
        var h = OSC_HEIGHT_MID - (f - 128) * (OSC_HEIGHT_MID / 128);
        oscCtx.lineTo(FREQ_WIDTH * (i + 1), h);
    }

    oscCtx.lineTo(OSC_WIDTH, OSC_HEIGHT_MID);
    oscCtx.stroke();
}

function drawGainMeter() {
    gainCtx.fillStyle = "#000000";
    gainCtx.fillRect(0, 0, GAIN_WIDTH, GAIN_HEIGHT);

    var leftHeight = GAIN_HEIGHT * currentGain[0];
    gainCtx.fillStyle = "#00cc00";
    gainCtx.fillRect(0, GAIN_HEIGHT - leftHeight, GAIN_WIDTH / 2, leftHeight);

    var rightHeight = GAIN_HEIGHT * currentGain[1];
    gainCtx.fillStyle = "#00cc00";
    gainCtx.fillRect(GAIN_WIDTH / 2, GAIN_HEIGHT - rightHeight, GAIN_WIDTH / 2, rightHeight);
}

function renderFrame() {
    analyser.getByteTimeDomainData(freqDataArray);

    drawOscilloscope();
    drawGainMeter();

    requestAnimationFrame(renderFrame);
}

function createAnalyser() {
    var node = audCtx.createAnalyser();
    node.fftSize = FFT_SIZE;
    return node;
}

function createGainMonitor() {
    var node = audCtx.createScriptProcessor(
        PROCESSOR_BUFFER_SIZE,
        STERIO_CHANNEL_COUNT,
        STERIO_CHANNEL_COUNT);

    node.onaudioprocess = function(e) {
        var input = e.inputBuffer;
        for (var c = 0; c < STERIO_CHANNEL_COUNT; c++) {
            var channelData = input.getChannelData(c);
            var total = 0;
            for (var i = 0; i < PROCESSOR_BUFFER_SIZE; i += 10) {
                total += Math.abs(channelData[i]);
            }
            currentGain[c] = total / (PROCESSOR_BUFFER_SIZE / 10);
        }
    };

    return node;
}

function processStream(stream) {

    var source = audCtx.createMediaStreamSource(stream);

    analyser = createAnalyser();

    var gainMonitor = createGainMonitor();

    source.connect(gainMonitor);
    source.connect(analyser);

    gainMonitor.connect(audCtx.destination);

    source.connect(audCtx.destination);

    freqDataArray = new Uint8Array(FREQ_BIN_COUNT);
    currentGain = [0, 0];

    requestAnimationFrame(renderFrame);
}

function init() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    audCtx = new window.AudioContext();
    var oscilloscopeCanvas = document.querySelector("#oscilloscope");
    oscCtx = oscilloscopeCanvas.getContext("2d");

    var gainMeterCanvas = document.querySelector("#gainMeter");
    gainCtx = gainMeterCanvas.getContext("2d");

    navigator.getUserMedia({
        "audio": true
    }, processStream, function(e) {
        alert('Error getting audio');
        console.log(e);
    });
}

window.addEventListener('load', init);