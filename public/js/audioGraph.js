window.audioGraph = (function(audioGraph) {

    var SAMPLE_RATE = 44100;
    var FFT_SIZE = 512;
    var PROCESSOR_BUFFER_SIZE = 4096;
    var STERIO_CHANNEL_COUNT = 2;

    audioGraph.createAnalyser = function(ac) {

        var node = ac.createAnalyser();

        node.fftSize = FFT_SIZE;
        node.freqDataArray = new Uint8Array(node.frequencyBinCount);

        node.getFrequencyData = function() {
            node.getByteTimeDomainData(node.freqDataArray);
            return node.freqDataArray;
        };

        return node;
    }

    audioGraph.createRecorder = function(ac) {

        var node = ac.createScriptProcessor(
            PROCESSOR_BUFFER_SIZE,
            STERIO_CHANNEL_COUNT,
            STERIO_CHANNEL_COUNT);

        node.onaudioprocess = function(e) {

            if (!node.recording) return;

            var input = e.inputBuffer;

            for (var c = 0; c < STERIO_CHANNEL_COUNT; c++) {
                var chunk = input.getChannelData(c);
                node.chunks[c].push(new Float32Array(chunk));
            }

            node.recLen += input.length;
        };

        node.createBufferFromRecording = function() {

            var buffer = ac.createBuffer(
                STERIO_CHANNEL_COUNT,
                node.recLen,
                SAMPLE_RATE);

            for (var c = 0; c < STERIO_CHANNEL_COUNT; c++) {
                var channel = buffer.getChannelData(c);
                fuseChunks(node.chunks[c], channel);
            }
            return buffer;
        };

        node.clear = function() {
            node.recording = false;
            node.recLen = 0;
            node.chunks = [
                [],
                []
            ];
        }

        node.start = function() {
            node.recording = true;
        }

        node.stop = function() {
            node.recording = false;
        }

        function fuseChunks(chunks, channel) {
            var offset = 0;
            for (var i = 0; i < chunks.length; i++) {
                channel.set(chunks[i], offset);
                offset += chunks[i].length;
            }
        }

        // This is a workaround for a chrome bug
        node.connect(ac.destination);

        node.clear();

        return node;
    }

    audioGraph.createGainMonitor = function(ac) {

        var node = ac.createScriptProcessor(
            PROCESSOR_BUFFER_SIZE,
            STERIO_CHANNEL_COUNT,
            STERIO_CHANNEL_COUNT);

        node.currentChunk = [];
        node.chunkSize = 0;

        node.onaudioprocess = function(e) {
            var input = e.inputBuffer;
            node.chunkSize = input.length;
            for (var c = 0; c < STERIO_CHANNEL_COUNT; c++) {
                node.currentChunk[c] = input.getChannelData(c);
            }
        };

        node.getCurrentGain = function() {
            var gain = [];
            for (var c = 0; c < STERIO_CHANNEL_COUNT; c++) {
                var total = 0;
                var channelChunk = node.currentChunk[c];
                for (var i = 0; i < node.chunkSize; i += 10) {
                    total += Math.abs(channelChunk[i]);
                }
                gain[c] = total / (node.chunkSize / 10);
            }

            return gain;
        };

        // This is a workaround for a chrome bug
        node.connect(ac.destination);

        return node;
    }

    return audioGraph;

})(window.audioGraph || {});