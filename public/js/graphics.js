window.graphics = (function(graphics) {

    /* Oscilloscope */

    graphics.OSC_WIDTH = 1000;
    graphics.OSC_HEIGHT = 200;
    var OSC_HEIGHT_MID = graphics.OSC_HEIGHT / 2;

    graphics.drawOscilloscope = function(g, analyser) {
        g.fillStyle = "#000000";
        g.fillRect(0, 0, graphics.OSC_WIDTH, graphics.OSC_HEIGHT);

        g.lineWidth = 4;
        g.strokeStyle = "#cc0000";
        g.beginPath();
        g.moveTo(0, OSC_HEIGHT_MID);

        var samples = analyser.timeData;
        var sampleCount = analyser.fftSize;
        var sampleWidth = graphics.OSC_WIDTH / (sampleCount + 1);

        for (var i = 0; i < sampleCount; i++) {
            var v = samples[i];
            var h = OSC_HEIGHT_MID - (v - 128) * (OSC_HEIGHT_MID / 128);
            g.lineTo(sampleWidth * (i + 1), h);
        }

        g.lineTo(graphics.OSC_WIDTH, OSC_HEIGHT_MID);
        g.stroke();
    }

    /* Frequency Graph */

    graphics.FREQ_WIDTH = 1000;
    graphics.FREQ_HEIGHT = 200;

    graphics.drawFrequencyGraph = function(g, analyser) {
        g.fillStyle = "#000000";
        g.fillRect(0, 0, graphics.FREQ_WIDTH, graphics.FREQ_HEIGHT);

        g.fillStyle = "#0000cc";
        g.beginPath();
        g.moveTo(0, graphics.FREQ_HEIGHT);

        var freqData = analyser.freqData;
        var binCount = analyser.frequencyBinCount;
        var binWidth = graphics.FREQ_WIDTH / (binCount - 1);

        for (var i = 0; i < binCount; i++) {
            var f = freqData[i];
            var h = graphics.FREQ_HEIGHT - f * (graphics.FREQ_HEIGHT / 255);
            g.lineTo(binWidth * i, h);
        }

        g.lineTo(graphics.FREQ_WIDTH, graphics.FREQ_HEIGHT);
        g.closePath();
        g.fill();
    }

    /* Gain Meter */

    graphics.GAIN_METER_WIDTH = 30;
    graphics.GAIN_METER_HEIGHT = 200;

    graphics.drawGainMeter = function(g, analyser) {

        var gain = analyser.measureGain();

        g.fillStyle = "#000000";
        g.fillRect(0, 0, graphics.GAIN_METER_WIDTH, graphics.GAIN_METER_HEIGHT);

        var height = graphics.GAIN_METER_HEIGHT * gain;
        g.fillStyle = "#00cc00";
        g.fillRect(0, graphics.GAIN_METER_HEIGHT - height, graphics.GAIN_METER_WIDTH, height);
    }

    return graphics;

})(window.graphics || {});