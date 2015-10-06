window.graphics = (function(graphics) {

    /* Oscillator */

    var OSC_WIDTH = 500;
    var OSC_HEIGHT = 200;
    var OSC_HEIGHT_MID = OSC_HEIGHT / 2;

    graphics.drawOscilloscope = function(g, analyser) {
        g.fillStyle = "#000000";
        g.fillRect(0, 0, OSC_WIDTH, OSC_HEIGHT);

        g.lineWidth = 4;
        g.strokeStyle = "#cc0000";
        g.beginPath();
        g.moveTo(0, OSC_HEIGHT_MID);

        var data = analyser.getFrequencyData();
        var binCount = analyser.frequencyBinCount;
        var freqWidth = OSC_WIDTH / (binCount + 1);

        for (var i = 0; i < analyser.frequencyBinCount; i++) {
            var f = data[i];
            var h = OSC_HEIGHT_MID - (f - 128) * (OSC_HEIGHT_MID / 128);
            g.lineTo(freqWidth * (i + 1), h);
        }

        g.lineTo(OSC_WIDTH, OSC_HEIGHT_MID);
        g.stroke();
    }

    /* Gain Meter */

    var GAIN_WIDTH = 30;
    var GAIN_HEIGHT = 200;

    graphics.drawGainMeter = function(g, gainMonitor) {
        g.fillStyle = "#000000";
        g.fillRect(0, 0, GAIN_WIDTH, GAIN_HEIGHT);

        var leftHeight = GAIN_HEIGHT * gainMonitor.currentGain[0];
        g.fillStyle = "#00cc00";
        g.fillRect(0, GAIN_HEIGHT - leftHeight, GAIN_WIDTH / 2, leftHeight);

        var rightHeight = GAIN_HEIGHT * gainMonitor.currentGain[1];
        g.fillStyle = "#00cc00";
        g.fillRect(GAIN_WIDTH / 2, GAIN_HEIGHT - rightHeight, GAIN_WIDTH / 2, rightHeight);
    }

    return graphics;

})(window.graphics || {});