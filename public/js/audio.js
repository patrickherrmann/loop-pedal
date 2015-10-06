var audCtx;
var oscCtx;
var gainCtx;

var analyser;
var recorder;
var gainMonitor;

var OSC_WIDTH = 500;
var OSC_HEIGHT = 200;
var OSC_HEIGHT_MID = OSC_HEIGHT / 2;

var GAIN_WIDTH = 30;
var GAIN_HEIGHT = 200;

var SAMPLE_RATE = 44100;
var FFT_SIZE = 512;
var FREQ_BIN_COUNT = FFT_SIZE / 2;
var FREQ_WIDTH = OSC_WIDTH / (FREQ_BIN_COUNT + 1);
var PROCESSOR_BUFFER_SIZE = 4096;
var STERIO_CHANNEL_COUNT = 2;

/* GRAPHICS */

function drawOscilloscope() {
    oscCtx.fillStyle = "#000000";
    oscCtx.fillRect(0, 0, OSC_WIDTH, OSC_HEIGHT);

    oscCtx.lineWidth = 4;
    oscCtx.strokeStyle = "#cc0000";
    oscCtx.beginPath();
    oscCtx.moveTo(0, OSC_HEIGHT_MID);

    var data = analyser.freqDataArray;

    for (var i = 0; i < FREQ_BIN_COUNT; i++) {
        var f = data[i];
        var h = OSC_HEIGHT_MID - (f - 128) * (OSC_HEIGHT_MID / 128);
        oscCtx.lineTo(FREQ_WIDTH * (i + 1), h);
    }

    oscCtx.lineTo(OSC_WIDTH, OSC_HEIGHT_MID);
    oscCtx.stroke();
}

function drawGainMeter() {
    gainCtx.fillStyle = "#000000";
    gainCtx.fillRect(0, 0, GAIN_WIDTH, GAIN_HEIGHT);

    var leftHeight = GAIN_HEIGHT * gainMonitor.currentGain[0];
    gainCtx.fillStyle = "#00cc00";
    gainCtx.fillRect(0, GAIN_HEIGHT - leftHeight, GAIN_WIDTH / 2, leftHeight);

    var rightHeight = GAIN_HEIGHT * gainMonitor.currentGain[1];
    gainCtx.fillStyle = "#00cc00";
    gainCtx.fillRect(GAIN_WIDTH / 2, GAIN_HEIGHT - rightHeight, GAIN_WIDTH / 2, rightHeight);
}

function renderFrame() {
    analyser.getByteTimeDomainData(analyser.freqDataArray);

    drawOscilloscope();
    drawGainMeter();

    requestAnimationFrame(renderFrame);
}

/* AUDIO GRAPH */

function createAnalyser() {
    var node = audCtx.createAnalyser();

    node.fftSize = FFT_SIZE;
    node.freqDataArray = new Uint8Array(FREQ_BIN_COUNT);

    return node;
}

function createRecorder() {
    var node = audCtx.createScriptProcessor(
        PROCESSOR_BUFFER_SIZE,
        STERIO_CHANNEL_COUNT,
        STERIO_CHANNEL_COUNT);

    node.recording = false;
    node.recLen = 0;
    node.chunks = [
        [],
        []
    ];

    node.onaudioprocess = function(e) {

        if (!node.recording) return;

        var input = e.inputBuffer;

        for (var c = 0; c < STERIO_CHANNEL_COUNT; c++) {
            var chunk = input.getChannelData(c);
            node.chunks[c].push(new Float32Array(chunk));
        }

        node.recLen += input.length;
    };

    node.fuseChunks = function(chunks, channel) {
        var offset = 0;
        for (var i = 0; i < chunks.length; i++) {
            channel.set(chunks[i], offset);
            offset += chunks[i].length;
        }
    };

    node.createBufferFromRecording = function() {
        var buffer = audCtx.createBuffer(
            STERIO_CHANNEL_COUNT,
            node.recLen,
            SAMPLE_RATE);

        for (var c = 0; c < STERIO_CHANNEL_COUNT; c++) {
            var channel = buffer.getChannelData(c);
            node.fuseChunks(node.chunks[c], channel);
        }
        return buffer;
    };

    return node;
}

function createGainMonitor() {
    var node = audCtx.createScriptProcessor(
        PROCESSOR_BUFFER_SIZE,
        STERIO_CHANNEL_COUNT,
        STERIO_CHANNEL_COUNT);

    node.currentGain = [0, 0];

    node.onaudioprocess = function(e) {
        var input = e.inputBuffer;
        for (var c = 0; c < STERIO_CHANNEL_COUNT; c++) {
            var channelData = input.getChannelData(c);
            var total = 0;
            for (var i = 0; i < PROCESSOR_BUFFER_SIZE; i += 10) {
                total += Math.abs(channelData[i]);
            }
            node.currentGain[c] = total / (PROCESSOR_BUFFER_SIZE / 10);
        }
    };

    return node;
}

function setupButtonListeners() {

    var recordButton = document.querySelector("#record");
    var loopButton = document.querySelector("#loop");

    recordButton.onclick = function() {
        recordButton.disabled = true;
        loopButton.disabled = false;

        recorder.recording = true;
    };

    loopButton.onclick = function() {
        loopButton.disabled = true;

        recorder.recording = false;

        var source = audCtx.createBufferSource();
        source.buffer = recorder.createBufferFromRecording();
        source.loop = true;

        source.connect(audCtx.destination);
        source.connect(analyser);
        source.connect(gainMonitor);

        source.start();
    };
}

function processStream(stream) {

    var source = audCtx.createMediaStreamSource(stream);
    var dest = audCtx.destination;

    analyser = createAnalyser();
    gainMonitor = createGainMonitor();
    recorder = createRecorder();


    source.connect(analyser);
    source.connect(gainMonitor);
    source.connect(recorder);

    // These connections don't do anything
    // but are necessary due to a chrome bug
    gainMonitor.connect(dest);
    recorder.connect(dest);

    //source.connect(dest); // Monitoring

    setupButtonListeners();

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