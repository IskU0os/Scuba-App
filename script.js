// Simplified No-Decompression Limits (NDL) Table based on PADI RDP
// Depth in feet -> Max bottom time in minutes
const ndlTable = {
    35: { ndl: 205, pressureGroups: {10: 'A', 20: 'B', 30: 'B', 40: 'C', 50: 'C', 60: 'D', 70: 'D', 80: 'E', 90: 'E', 100: 'F', 110: 'F', 120: 'G', 130: 'G', 140: 'H', 150: 'H', 160: 'I', 170: 'I', 180: 'J', 190: 'J', 200: 'K', 205: 'L'} },
    40: { ndl: 140, pressureGroups: {10: 'A', 20: 'B', 25: 'C', 30: 'C', 40: 'D', 50: 'E', 60: 'F', 70: 'G', 80: 'H', 90: 'I', 100: 'J', 110: 'K', 120: 'L', 130: 'L', 140: 'L'} },
    50: { ndl: 80, pressureGroups: {10: 'B', 20: 'C', 25: 'D', 30: 'D', 40: 'E', 50: 'F', 60: 'G', 70: 'H', 80: 'I'} },
    60: { ndl: 55, pressureGroups: {10: 'B', 15: 'C', 20: 'D', 25: 'D', 30: 'E', 40: 'F', 50: 'G', 55: 'H'} },
    70: { ndl: 40, pressureGroups: {10: 'C', 15: 'D', 20: 'E', 25: 'E', 30: 'F', 40: 'G'} },
    80: { ndl: 30, pressureGroups: {10: 'D', 15: 'E', 20: 'F', 25: 'F', 30: 'G'} },
    90: { ndl: 25, pressureGroups: {10: 'E', 15: 'F', 20: 'G', 25: 'H'} },
    100: { ndl: 20, pressureGroups: {10: 'F', 15: 'G', 20: 'H'} },
    110: { ndl: 16, pressureGroups: {10: 'G', 15: 'H', 16: 'I'} },
    120: { ndl: 13, pressureGroups: {10: 'H', 13: 'I'} },
    130: { ndl: 10, pressureGroups: {10: 'I'} }
};

// Surface Interval Credit Table (simplified)
// Shows how pressure groups reduce over time at surface
const surfaceIntervalTable = {
    'A': { intervals: {0: 'A'} },
    'B': { intervals: {0: 'B', 60: 'A'} },
    'C': { intervals: {0: 'C', 60: 'B', 120: 'A'} },
    'D': { intervals: {0: 'D', 60: 'C', 120: 'B', 180: 'A'} },
    'E': { intervals: {0: 'E', 60: 'D', 120: 'C', 180: 'B', 240: 'A'} },
    'F': { intervals: {0: 'F', 60: 'E', 120: 'D', 180: 'C', 240: 'B', 300: 'A'} },
    'G': { intervals: {0: 'G', 60: 'F', 120: 'E', 180: 'D', 240: 'C', 300: 'B', 360: 'A'} },
    'H': { intervals: {0: 'H', 60: 'G', 120: 'F', 180: 'E', 240: 'D', 300: 'C', 360: 'B', 420: 'A'} },
    'I': { intervals: {0: 'I', 60: 'H', 120: 'G', 180: 'F', 240: 'E', 300: 'D', 360: 'C', 420: 'B', 480: 'A'} },
    'J': { intervals: {0: 'J', 60: 'I', 120: 'H', 180: 'G', 240: 'F', 300: 'E', 360: 'D', 420: 'C', 480: 'B', 540: 'A'} },
    'K': { intervals: {0: 'K', 60: 'J', 120: 'I', 180: 'H', 240: 'G', 300: 'F', 360: 'E', 420: 'D', 480: 'C', 540: 'B', 600: 'A'} },
    'L': { intervals: {0: 'L', 60: 'K', 120: 'J', 180: 'I', 240: 'H', 300: 'G', 360: 'F', 420: 'E', 480: 'D', 540: 'C', 600: 'B', 660: 'A'} }
};

function findNearestDepth(targetDepth) {
    // Always round up to next depth in table for safety
    const depths = Object.keys(ndlTable).map(Number).sort((a, b) => a - b);
    for (let depth of depths) {
        if (targetDepth <= depth) {
            return depth;
        }
    }
    return depths[depths.length - 1];
}

function getPressureGroup(depth, time) {
    const depthData = ndlTable[depth];
    if (!depthData) return null;

    const times = Object.keys(depthData.pressureGroups).map(Number).sort((a, b) => a - b);

    for (let t of times) {
        if (time <= t) {
            return depthData.pressureGroups[t];
        }
    }

    return depthData.pressureGroups[times[times.length - 1]];
}

function calculateDive() {
    const depth = parseInt(document.getElementById('depth').value);
    const time = parseInt(document.getElementById('time').value);

    if (!depth || !time) {
        alert('Please enter both depth and time values.');
        return;
    }

    const resultsDiv = document.getElementById('results');
    const ndlInfo = document.getElementById('ndl-info');
    const pressureGroupDiv = document.getElementById('pressure-group');
    const safetyWarnings = document.getElementById('safety-warnings');
    const recommendations = document.getElementById('recommendations');

    // Find nearest depth in table
    const tableDepth = findNearestDepth(depth);
    const depthData = ndlTable[tableDepth];

    // Check if depth is safe
    let warnings = [];
    let recs = [];

    if (depth > 130) {
        warnings.push('<p class="status-danger">⛔ UNSAFE: Depth exceeds 130 feet recreational limit!</p>');
    } else if (depth > 100) {
        warnings.push('<p class="status-caution">⚠️ CAUTION: Advanced depth - ensure proper certification</p>');
    } else if (depth > 60) {
        warnings.push('<p class="status-caution">⚠️ CAUTION: Intermediate depth level</p>');
    } else {
        warnings.push('<p class="status-safe">✓ Depth within beginner-friendly range</p>');
    }

    // Check NDL
    const ndl = depthData.ndl;
    const timeRemaining = ndl - time;

    if (time > ndl) {
        warnings.push(`<p class="status-danger">⛔ UNSAFE: Bottom time (${time} min) exceeds No-Decompression Limit (${ndl} min)!</p>`);
        ndlInfo.innerHTML = `<p><strong>No-Decompression Limit at ${tableDepth} feet:</strong> ${ndl} minutes</p>
                            <p class="status-danger">Your planned time EXCEEDS the NDL by ${time - ndl} minutes!</p>`;
    } else if (timeRemaining <= 5) {
        warnings.push('<p class="status-caution">⚠️ CAUTION: Very close to NDL - minimal safety margin</p>');
        ndlInfo.innerHTML = `<p><strong>No-Decompression Limit at ${tableDepth} feet:</strong> ${ndl} minutes</p>
                            <p class="status-caution">Time remaining: ${timeRemaining} minutes (very close to limit)</p>`;
    } else {
        ndlInfo.innerHTML = `<p><strong>No-Decompression Limit at ${tableDepth} feet:</strong> ${ndl} minutes</p>
                            <p class="status-safe">Time remaining: ${timeRemaining} minutes</p>`;
    }

    // Calculate pressure group
    const pressureGroup = getPressureGroup(tableDepth, time);
    if (pressureGroup) {
        pressureGroupDiv.innerHTML = `<p><strong>Ending Pressure Group:</strong> ${pressureGroup}</p>`;
    } else {
        pressureGroupDiv.innerHTML = '<p class="status-danger">Unable to calculate pressure group - dive may be unsafe</p>';
    }

    // Safety recommendations
    recs.push('<p><strong>Recommendations:</strong></p><ul>');
    recs.push('<li>Perform a safety stop: 3-5 minutes at 15 feet</li>');
    recs.push('<li>Ascend no faster than 30 feet per minute</li>');
    recs.push('<li>Always dive with a buddy</li>');

    if (depth >= 60) {
        recs.push('<li>Consider bringing a dive computer for real-time monitoring</li>');
    }

    if (pressureGroup && pressureGroup.charCodeAt(0) >= 'F'.charCodeAt(0)) {
        recs.push('<li>Plan a longer surface interval before next dive (60+ minutes)</li>');
    }

    recs.push('</ul>');

    safetyWarnings.innerHTML = warnings.join('');
    recommendations.innerHTML = recs.join('');

    resultsDiv.classList.remove('hidden');
}

function calculateSurfaceInterval() {
    const pressureGroup = document.getElementById('pressure-group-input').value;
    const surfaceTime = parseInt(document.getElementById('surface-interval').value);

    const resultsDiv = document.getElementById('surface-results');
    const newPressureGroupDiv = document.getElementById('new-pressure-group');
    const surfaceRecsDiv = document.getElementById('surface-recommendations');

    if (!surfaceTime) {
        alert('Please enter surface interval time.');
        return;
    }

    const intervals = surfaceIntervalTable[pressureGroup].intervals;
    const times = Object.keys(intervals).map(Number).sort((a, b) => b - a);

    let newGroup = pressureGroup;
    for (let t of times) {
        if (surfaceTime >= t) {
            newGroup = intervals[t];
            break;
        }
    }

    newPressureGroupDiv.innerHTML = `<p><strong>Starting Pressure Group:</strong> ${pressureGroup}</p>
                                     <p><strong>Surface Interval:</strong> ${surfaceTime} minutes</p>
                                     <p><strong>New Pressure Group:</strong> ${newGroup}</p>`;

    let recs = '<p><strong>Recommendations:</strong></p><ul>';

    if (newGroup === pressureGroup) {
        recs += '<li class="status-caution">Your pressure group has not improved yet. Consider a longer surface interval.</li>';
    } else {
        recs += `<li class="status-safe">Your nitrogen loading has decreased from group ${pressureGroup} to group ${newGroup}</li>`;
    }

    if (newGroup !== 'A') {
        recs += '<li>You have residual nitrogen - plan your repetitive dive conservatively</li>';
        recs += '<li>Consider using a dive computer for accurate tracking</li>';
    } else {
        recs += '<li class="status-safe">You have minimal residual nitrogen (Group A)</li>';
    }

    recs += '<li>Stay hydrated during surface interval</li>';
    recs += '<li>Avoid strenuous activity during surface interval</li>';
    recs += '</ul>';

    surfaceRecsDiv.innerHTML = recs;
    resultsDiv.classList.remove('hidden');
}

// Add enter key support
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('depth').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateDive();
    });

    document.getElementById('time').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateDive();
    });

    document.getElementById('surface-interval').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateSurfaceInterval();
    });
});
