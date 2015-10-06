(function(audioGraph, graphics) {

    var ctx = {};
    var nodes = {};

    function init() {
        fixVendorPrefixes();

        ctx.audio = new window.AudioContext();

        var oscCanvas = document.querySelector("#oscilloscope");
        ctx.oscCanvas = oscCanvas.getContext("2d");

        var gainCanvas = document.querySelector("#gainMeter");
        ctx.gainCanvas = gainCanvas.getContext("2d");

        navigator.getUserMedia({
            audio: true
        }, setupMicrophoneStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
    }

    function setupMicrophoneStream(stream) {

        nodes.mic = ctx.audio.createMediaStreamSource(stream);
        nodes.speakers = ctx.audio.destination;

        nodes.analyser = audioGraph.createAnalyser(ctx.audio);
        nodes.gainMonitor = audioGraph.createGainMonitor(ctx.audio);
        nodes.recorder = audioGraph.createRecorder(ctx.audio);

        nodes.mic.connect(nodes.analyser);
        nodes.mic.connect(nodes.gainMonitor);
        nodes.mic.connect(nodes.recorder);

        // Uncomment to monitor mic input
        // (will create feedback with no headphones)

        //nodes.mic.connect(nodes.speakers);

        setupButtonListeners();

        requestAnimationFrame(renderFrame);
    }

    function setupButtonListeners() {

        var recordButton = document.querySelector("#record");
        var loopButton = document.querySelector("#loop");

        recordButton.onclick = function() {
            recordButton.disabled = true;
            loopButton.disabled = false;

            nodes.recorder.start();
        };

        loopButton.onclick = function() {
            loopButton.disabled = true;

            nodes.recorder.stop();

            nodes.recordedLoop = ctx.audio.createBufferSource();
            nodes.recordedLoop.buffer = nodes.recorder.createBufferFromRecording();
            nodes.recordedLoop.loop = true;

            nodes.recordedLoop.connect(ctx.audio.destination);
            nodes.recordedLoop.connect(nodes.analyser);
            nodes.recordedLoop.connect(nodes.gainMonitor);

            nodes.recordedLoop.start();
        };
    }

    function renderFrame() {
        requestAnimationFrame(renderFrame);

        graphics.drawOscilloscope(ctx.oscCanvas, nodes.analyser);
        graphics.drawGainMeter(ctx.gainCanvas, nodes.gainMonitor);
    }

    function fixVendorPrefixes() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    }

    window.addEventListener('load', init);

})(window.audioGraph || {}, window.graphics || {});