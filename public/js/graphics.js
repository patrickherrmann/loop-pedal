window.graphics = (function(graphics) {

    /* Oscilloscope */

    graphics.OSC_WIDTH = 500;
    graphics.OSC_HEIGHT = 200;
    var OSC_HEIGHT_MID = graphics.OSC_HEIGHT / 2;

    graphics.drawOscilloscope = function(g, analyser) {
        g.fillStyle = "#000000";
        g.fillRect(0, 0, graphics.OSC_WIDTH, graphics.OSC_HEIGHT);

        g.lineWidth = 4;
        g.strokeStyle = "#cc0000";
        g.beginPath();
        g.moveTo(0, OSC_HEIGHT_MID);

        var data = analyser.getFrequencyData();
        var binCount = analyser.frequencyBinCount;
        var freqWidth = graphics.OSC_WIDTH / (binCount + 1);

        for (var i = 0; i < analyser.frequencyBinCount; i++) {
            var f = data[i];
            var h = OSC_HEIGHT_MID - (f - 128) * (OSC_HEIGHT_MID / 128);
            g.lineTo(freqWidth * (i + 1), h);
        }

        g.lineTo(graphics.OSC_WIDTH, OSC_HEIGHT_MID);
        g.stroke();
    }

    /* Gain Meter */

    graphics.GAIN_METER_WIDTH = 30;
    graphics.GAIN_METER_HEIGHT = 200;

    graphics.drawGainMeter = function(g, gainMonitor) {
        g.fillStyle = "#000000";
        g.fillRect(0, 0, graphics.GAIN_METER_WIDTH, graphics.GAIN_METER_HEIGHT);

        var leftHeight = graphics.GAIN_METER_HEIGHT * gainMonitor.currentGain[0];
        g.fillStyle = "#00cc00";
        g.fillRect(0, graphics.GAIN_METER_HEIGHT - leftHeight, graphics.GAIN_METER_WIDTH / 2, leftHeight);

        var rightHeight = graphics.GAIN_METER_HEIGHT * gainMonitor.currentGain[1];
        g.fillStyle = "#00cc00";
        g.fillRect(graphics.GAIN_METER_WIDTH / 2, graphics.GAIN_METER_HEIGHT - rightHeight, graphics.GAIN_METER_WIDTH / 2, rightHeight);
    }

    return graphics;

})(window.graphics || {});