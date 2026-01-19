// Simplified No-Decompression Limits (NDL) Table based on PADI RDP
// Depth in meters -> Max bottom time in minutes
const ndlTable = {
    11: { ndl: 205, pressureGroups: {10: 'A', 20: 'B', 30: 'B', 40: 'C', 50: 'C', 60: 'D', 70: 'D', 80: 'E', 90: 'E', 100: 'F', 110: 'F', 120: 'G', 130: 'G', 140: 'H', 150: 'H', 160: 'I', 170: 'I', 180: 'J', 190: 'J', 200: 'K', 205: 'L'} },
    12: { ndl: 140, pressureGroups: {10: 'A', 20: 'B', 25: 'C', 30: 'C', 40: 'D', 50: 'E', 60: 'F', 70: 'G', 80: 'H', 90: 'I', 100: 'J', 110: 'K', 120: 'L', 130: 'L', 140: 'L'} },
    15: { ndl: 80, pressureGroups: {10: 'B', 20: 'C', 25: 'D', 30: 'D', 40: 'E', 50: 'F', 60: 'G', 70: 'H', 80: 'I'} },
    18: { ndl: 55, pressureGroups: {10: 'B', 15: 'C', 20: 'D', 25: 'D', 30: 'E', 40: 'F', 50: 'G', 55: 'H'} },
    21: { ndl: 40, pressureGroups: {10: 'C', 15: 'D', 20: 'E', 25: 'E', 30: 'F', 40: 'G'} },
    24: { ndl: 30, pressureGroups: {10: 'D', 15: 'E', 20: 'F', 25: 'F', 30: 'G'} },
    27: { ndl: 25, pressureGroups: {10: 'E', 15: 'F', 20: 'G', 25: 'H'} },
    30: { ndl: 20, pressureGroups: {10: 'F', 15: 'G', 20: 'H'} },
    34: { ndl: 16, pressureGroups: {10: 'G', 15: 'H', 16: 'I'} },
    37: { ndl: 13, pressureGroups: {10: 'H', 13: 'I'} },
    40: { ndl: 10, pressureGroups: {10: 'I'} }
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

    if (depth > 40) {
        warnings.push('<p class="status-danger">⛔ UNSAFE: Depth exceeds 40 meters recreational limit!</p>');
    } else if (depth > 30) {
        warnings.push('<p class="status-caution">⚠️ CAUTION: Advanced depth - ensure proper certification</p>');
    } else if (depth > 18) {
        warnings.push('<p class="status-caution">⚠️ CAUTION: Intermediate depth level</p>');
    } else {
        warnings.push('<p class="status-safe">✓ Depth within beginner-friendly range</p>');
    }

    // Check NDL
    const ndl = depthData.ndl;
    const timeRemaining = ndl - time;

    if (time > ndl) {
        warnings.push(`<p class="status-danger">⛔ UNSAFE: Bottom time (${time} min) exceeds No-Decompression Limit (${ndl} min)!</p>`);
        ndlInfo.innerHTML = `<p><strong>No-Decompression Limit at ${tableDepth} meters:</strong> ${ndl} minutes</p>
                            <p class="status-danger">Your planned time EXCEEDS the NDL by ${time - ndl} minutes!</p>`;
    } else if (timeRemaining <= 5) {
        warnings.push('<p class="status-caution">⚠️ CAUTION: Very close to NDL - minimal safety margin</p>');
        ndlInfo.innerHTML = `<p><strong>No-Decompression Limit at ${tableDepth} meters:</strong> ${ndl} minutes</p>
                            <p class="status-caution">Time remaining: ${timeRemaining} minutes (very close to limit)</p>`;
    } else {
        ndlInfo.innerHTML = `<p><strong>No-Decompression Limit at ${tableDepth} meters:</strong> ${ndl} minutes</p>
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
    recs.push('<li>Perform a safety stop: 3-5 minutes at 5 meters</li>');
    recs.push('<li>Ascend no faster than 9 meters per minute</li>');
    recs.push('<li>Always dive with a buddy</li>');

    if (depth >= 18) {
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

// ============================================
// TECHNICAL DIVING - GUE DECOPLANNER
// ============================================

// Buhlmann ZHL-16C Tissue Compartments (half-times in minutes for N2)
const buhlmannCompartments = [
    { halfTime: 5.0, aN2: 1.1696, bN2: 0.5578 },
    { halfTime: 8.0, aN2: 1.0000, bN2: 0.6514 },
    { halfTime: 12.5, aN2: 0.8618, bN2: 0.7222 },
    { halfTime: 18.5, aN2: 0.7562, bN2: 0.7825 },
    { halfTime: 27.0, aN2: 0.6667, bN2: 0.8126 },
    { halfTime: 38.3, aN2: 0.5933, bN2: 0.8434 },
    { halfTime: 54.3, aN2: 0.5282, bN2: 0.8693 },
    { halfTime: 77.0, aN2: 0.4701, bN2: 0.8910 },
    { halfTime: 109.0, aN2: 0.4187, bN2: 0.9092 },
    { halfTime: 146.0, aN2: 0.3798, bN2: 0.9222 },
    { halfTime: 187.0, aN2: 0.3497, bN2: 0.9319 },
    { halfTime: 239.0, aN2: 0.3223, bN2: 0.9403 },
    { halfTime: 305.0, aN2: 0.2971, bN2: 0.9477 },
    { halfTime: 390.0, aN2: 0.2737, bN2: 0.9544 },
    { halfTime: 498.0, aN2: 0.2523, bN2: 0.9602 },
    { halfTime: 635.0, aN2: 0.2327, bN2: 0.9653 }
];

// Gas mix definitions (MOD in meters)
const gasMixes = {
    'air': { o2: 21, he: 0, mod: 40 },
    'ean32': { o2: 32, he: 0, mod: 34 },
    'ean36': { o2: 36, he: 0, mod: 29 },
    'ean50': { o2: 50, he: 0, mod: 21 },
    'oxygen': { o2: 100, he: 0, mod: 6 },
    '21/35': { o2: 21, he: 35, mod: 58 },
    '18/45': { o2: 18, he: 45, mod: 73 },
    '15/55': { o2: 15, he: 55, mod: 85 },
    '12/65': { o2: 12, he: 65, mod: 98 },
    '10/70': { o2: 10, he: 70, mod: 100 }
};

// Calculate partial pressure of N2 in breathing gas
function getN2Fraction(gas) {
    const gasData = gasMixes[gas];
    return (100 - gasData.o2 - gasData.he) / 100;
}

// Calculate ambient pressure at depth (in bar)
function depthToATA(depthMeters) {
    return 1 + (depthMeters / 10);
}

// Calculate inspired N2 pressure
function getInspiredN2Pressure(depthMeters, gas) {
    const ambientPressure = depthToATA(depthMeters);
    const n2Fraction = getN2Fraction(gas);
    return ambientPressure * n2Fraction;
}

// Calculate tissue loading using Schreiner equation
function calculateTissueLoading(initialLoading, inspiredPressure, halfTime, timeMinutes) {
    const k = Math.log(2) / halfTime;
    return inspiredPressure + (initialLoading - inspiredPressure) * Math.exp(-k * timeMinutes);
}

// Calculate M-value for a compartment with gradient factors
function calculateMValue(compartment, depth, gfLow, gfHigh, firstStopDepth, surfaceDepth = 0) {
    const ambientPressure = depthToATA(depth);
    const mValueSlope = compartment.aN2;
    const mValueIntercept = compartment.bN2;

    // Calculate base M-value
    const mValue = (ambientPressure / mValueIntercept) - mValueSlope;

    // Apply gradient factor interpolation
    let gf;
    if (firstStopDepth === 0) {
        gf = gfHigh / 100;
    } else {
        const depthFraction = (depth - surfaceDepth) / (firstStopDepth - surfaceDepth);
        gf = (gfLow + depthFraction * (gfHigh - gfLow)) / 100;
    }

    return mValue * gf;
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Activate selected button
    event.target.classList.add('active');
}

// Main technical dive calculation
function calculateTechnicalDive() {
    // Get inputs
    const maxDepth = parseInt(document.getElementById('tech-depth').value);
    const bottomTime = parseInt(document.getElementById('tech-bottom-time').value);
    const bottomGas = document.getElementById('bottom-gas').value;
    const decoGas = document.getElementById('deco-gas').value;
    const gfLow = parseInt(document.getElementById('gf-low').value);
    const gfHigh = parseInt(document.getElementById('gf-high').value);
    const ascentRate = parseInt(document.getElementById('ascent-rate').value);

    if (!maxDepth || !bottomTime) {
        alert('Please enter depth and bottom time.');
        return;
    }

    // Initialize tissue compartments
    let tissues = buhlmannCompartments.map(() => 0.79); // Start at sea level N2 pressure

    // Phase 1: Bottom time at depth
    const inspiredN2 = getInspiredN2Pressure(maxDepth, bottomGas);
    tissues = tissues.map((tissue, i) =>
        calculateTissueLoading(tissue, inspiredN2, buhlmannCompartments[i].halfTime, bottomTime)
    );

    // Phase 2: Calculate ascent profile with deco stops
    let currentDepth = maxDepth;
    let runtime = bottomTime;
    const profile = [];
    const decoStops = [];

    // Add bottom phase to profile
    profile.push({ depth: maxDepth, time: bottomTime, runtime: runtime, gas: bottomGas, phase: 'Bottom' });

    // Calculate first deco stop
    let firstStopDepth = 0;
    for (let depth = Math.ceil(currentDepth / 3) * 3; depth >= 0; depth -= 3) {
        const canAscend = tissues.every((tissue, i) => {
            const ceiling = calculateMValue(buhlmannCompartments[i], depth, gfLow, gfHigh, firstStopDepth);
            return tissue <= ceiling;
        });

        if (!canAscend) {
            firstStopDepth = depth + 3;
            break;
        }
    }

    // Ascend to first stop or surface
    let targetDepth = firstStopDepth > 0 ? firstStopDepth : 0;

    // Determine gas switches
    let currentGas = bottomGas;
    const gasSchedule = [{ depth: maxDepth, gas: bottomGas }];

    // Switch to EAN50 at 21m if available
    if ((decoGas === 'ean50' || decoGas === 'both') && currentDepth > 21) {
        gasSchedule.push({ depth: 21, gas: 'ean50' });
    }

    // Switch to O2 at 6m if available
    if ((decoGas === 'oxygen' || decoGas === 'both') && currentDepth > 6) {
        gasSchedule.push({ depth: 6, gas: 'oxygen' });
    }

    // Ascent with deco stops
    while (currentDepth > 0) {
        // Check for gas switch
        for (let gs of gasSchedule) {
            if (currentDepth > gs.depth && currentDepth - 3 <= gs.depth) {
                currentGas = gs.gas;
                profile.push({ depth: gs.depth, time: 0, runtime: runtime, gas: currentGas, phase: 'Gas Switch' });
            }
        }

        // Ascend 3 meters
        let nextDepth = Math.max(0, currentDepth - 3);
        const ascentTime = 3 / ascentRate;

        // Update tissues during ascent
        const avgDepth = (currentDepth + nextDepth) / 2;
        const avgInspiredN2 = getInspiredN2Pressure(avgDepth, currentGas);
        tissues = tissues.map((tissue, i) =>
            calculateTissueLoading(tissue, avgInspiredN2, buhlmannCompartments[i].halfTime, ascentTime)
        );

        runtime += ascentTime;
        currentDepth = nextDepth;

        if (currentDepth === 0) break;

        // Check if we need a deco stop
        let needsStop = false;
        let ceilingDepth = 0;

        tissues.forEach((tissue, i) => {
            const ceiling = calculateMValue(buhlmannCompartments[i], currentDepth - 3, gfLow, gfHigh, firstStopDepth);
            if (tissue > ceiling) {
                needsStop = true;
                const requiredDepth = Math.ceil(currentDepth / 3) * 3;
                if (requiredDepth > ceilingDepth) ceilingDepth = requiredDepth;
            }
        });

        if (needsStop || (currentDepth === 6 || currentDepth === 3)) {
            // Deco stop required
            let stopTime = 0;
            let canLeave = false;

            while (!canLeave && stopTime < 60) {
                stopTime++;
                const stopInspiredN2 = getInspiredN2Pressure(currentDepth, currentGas);
                tissues = tissues.map((tissue, i) =>
                    calculateTissueLoading(tissue, stopInspiredN2, buhlmannCompartments[i].halfTime, 1)
                );

                // Check if we can ascend
                canLeave = tissues.every((tissue, i) => {
                    const nextCeiling = calculateMValue(buhlmannCompartments[i], currentDepth - 3, gfLow, gfHigh, firstStopDepth);
                    return tissue <= nextCeiling;
                });
            }

            runtime += stopTime;
            decoStops.push({ depth: currentDepth, time: stopTime });
            profile.push({ depth: currentDepth, time: stopTime, runtime: Math.round(runtime), gas: currentGas, phase: 'Deco Stop' });
        }
    }

    // Display results
    displayTechnicalResults(profile, decoStops, runtime, maxDepth, bottomTime, bottomGas, decoGas, gfLow, gfHigh);
}

function displayTechnicalResults(profile, decoStops, totalRuntime, maxDepth, bottomTime, bottomGas, decoGas, gfLow, gfHigh) {
    const resultsDiv = document.getElementById('tech-results');
    const profileDiv = document.getElementById('tech-profile');
    const runtimeDiv = document.getElementById('runtime-table');
    const gasDiv = document.getElementById('gas-requirements');
    const warningsDiv = document.getElementById('tech-warnings');

    // Profile summary
    const totalDeco = decoStops.reduce((sum, stop) => sum + stop.time, 0);
    profileDiv.innerHTML = `
        <p><strong>Max Depth:</strong> ${maxDepth} meters</p>
        <p><strong>Bottom Time:</strong> ${bottomTime} minutes</p>
        <p><strong>Total Deco Time:</strong> ${Math.round(totalDeco)} minutes</p>
        <p><strong>Total Runtime:</strong> ${Math.round(totalRuntime)} minutes</p>
        <p><strong>Gradient Factors:</strong> ${gfLow}/${gfHigh}</p>
    `;

    // Runtime table
    let tableHTML = '<h4>Runtime Table</h4><table style="width:100%; border-collapse: collapse; margin-top: 10px;">';
    tableHTML += '<tr style="background: #0891b2; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">Depth (m)</th><th style="padding: 8px; border: 1px solid #ddd;">Time (min)</th><th style="padding: 8px; border: 1px solid #ddd;">Runtime</th><th style="padding: 8px; border: 1px solid #ddd;">Gas</th></tr>';

    profile.forEach(segment => {
        const rowColor = segment.phase === 'Deco Stop' ? '#ecfeff' : 'white';
        tableHTML += `<tr style="background: ${rowColor}">
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${segment.depth}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${Math.round(segment.time)}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${Math.round(segment.runtime)}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${segment.gas}</td>
        </tr>`;
    });
    tableHTML += '</table>';
    runtimeDiv.innerHTML = tableHTML;

    // Gas requirements (simplified)
    const bottomGasData = gasMixes[bottomGas];
    const sacRate = 20; // liters per minute at surface
    const avgDepth = maxDepth / 2;
    const avgBar = depthToATA(avgDepth);
    const bottomGasRequired = Math.round(bottomTime * avgBar * sacRate * 1.5); // 1.5x safety factor

    gasDiv.innerHTML = `
        <h4>Gas Requirements (Estimated)</h4>
        <p><strong>Bottom Gas (${bottomGas}):</strong> ~${bottomGasRequired} liters</p>
        <p><em>Note: Always plan gas based on SAC rate and apply rule of thirds</em></p>
    `;

    // Warnings
    let warnings = [];
    if (maxDepth > gasMixes[bottomGas].mod) {
        warnings.push(`<p class="status-danger">⛔ WARNING: Depth exceeds MOD for ${bottomGas} (${gasMixes[bottomGas].mod}m)</p>`);
    }
    if (totalDeco > 60) {
        warnings.push('<p class="status-caution">⚠️ Extended deco dive - ensure proper team and equipment</p>');
    }
    if (decoGas === 'none' && totalDeco > 10) {
        warnings.push('<p class="status-caution">⚠️ Consider using deco gas to reduce deco time</p>');
    }

    warnings.push('<p class="status-safe">✓ Always dive with redundant gas supply and proper team</p>');

    warningsDiv.innerHTML = warnings.join('');
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
