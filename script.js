// Simplified PADI Recreational Dive Table (NDL in minutes)
const NDL_TABLE = {
    10: { ndl: 219, group: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], times: [10, 20, 26, 30, 34, 37, 41, 45, 50, 54, 59, 64, 70, 75, 219] },
    12: { ndl: 147, group: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], times: [9, 17, 23, 26, 29, 32, 35, 38, 42, 45, 49, 53, 57, 62, 147] },
    14: { ndl: 98, group: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], times: [8, 15, 21, 24, 27, 29, 32, 35, 38, 41, 44, 47, 51, 55, 98] },
    16: { ndl: 72, group: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], times: [7, 13, 18, 21, 24, 26, 29, 31, 34, 37, 40, 43, 46, 50, 72] },
    18: { ndl: 56, group: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], times: [6, 12, 16, 19, 21, 24, 26, 29, 31, 34, 37, 40, 43, 47, 56] },
    20: { ndl: 45, group: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], times: [6, 11, 15, 18, 20, 22, 24, 27, 29, 32, 35, 38, 41, 44, 45] },
    22: { ndl: 37, group: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'], times: [5, 10, 14, 16, 19, 21, 23, 25, 27, 30, 33, 36, 37, 37] },
    25: { ndl: 29, group: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'], times: [5, 9, 12, 15, 17, 19, 21, 23, 25, 27, 29, 29, 29] },
    30: { ndl: 20, group: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], times: [4, 8, 11, 13, 15, 17, 19, 20, 20, 20] },
    35: { ndl: 14, group: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], times: [4, 7, 10, 12, 13, 14, 14, 14] },
    40: { ndl: 9, group: ['A', 'B', 'C', 'D', 'E'], times: [3, 6, 8, 9, 9] }
};

// Surface Interval Credit Table (simplified - minutes to drop one pressure group)
const SI_TABLE = {
    'Z': 0, 'O': 10, 'N': 20, 'M': 30, 'L': 40, 'K': 50,
    'J': 60, 'I': 70, 'H': 90, 'G': 110, 'F': 130, 'E': 160,
    'D': 190, 'C': 230, 'B': 280, 'A': 360
};

// Convert feet to meters
function feetToMeters(feet) {
    return feet * 0.3048;
}

// Convert meters to feet
function metersToFeet(meters) {
    return meters * 3.28084;
}

// Get the nearest depth in the table
function getNearestTableDepth(depthInMeters) {
    const depths = Object.keys(NDL_TABLE).map(Number);
    // Round up to the next depth level for safety
    for (let depth of depths) {
        if (depthInMeters <= depth) {
            return depth;
        }
    }
    return depths[depths.length - 1];
}

// Get NDL for a given depth
function getNDL(depthInMeters) {
    const tableDepth = getNearestTableDepth(depthInMeters);
    return NDL_TABLE[tableDepth].ndl;
}

// Get pressure group for depth and time
function getPressureGroup(depthInMeters, timeInMinutes) {
    const tableDepth = getNearestTableDepth(depthInMeters);
    const table = NDL_TABLE[tableDepth];

    for (let i = 0; i < table.times.length; i++) {
        if (timeInMinutes <= table.times[i]) {
            return table.group[i];
        }
    }
    return table.group[table.group.length - 1];
}

// Calculate air consumption
function calculateAirConsumption(depthInMeters, timeInMinutes, tankSize, sacRate) {
    // Air consumption = (depth/10 + 1) * SAC rate * time
    const atmospheres = (depthInMeters / 10) + 1;
    const consumption = atmospheres * sacRate * timeInMinutes;
    const bars = consumption / tankSize;

    return {
        liters: Math.round(consumption),
        bars: Math.round(bars),
        tankCapacity: tankSize
    };
}

// Calculate new pressure group after surface interval
function calculateNewPressureGroup(currentGroup, surfaceIntervalMinutes) {
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'Z'];
    let currentIndex = groups.indexOf(currentGroup.toUpperCase());

    if (currentIndex === -1) {
        return null;
    }

    let remainingTime = surfaceIntervalMinutes;

    while (remainingTime > 0 && currentIndex > 0) {
        const currentGroupLetter = groups[currentIndex];
        const timeNeeded = SI_TABLE[currentGroupLetter] || 0;

        if (remainingTime >= timeNeeded) {
            remainingTime -= timeNeeded;
            currentIndex--;
        } else {
            break;
        }
    }

    return groups[currentIndex];
}

// Main calculation function
function calculateDivePlan() {
    // Get input values
    let depth = parseFloat(document.getElementById('depth').value);
    const depthUnit = document.getElementById('depthUnit').value;
    const time = parseFloat(document.getElementById('time').value);
    const tankSize = parseFloat(document.getElementById('tankSize').value);
    const sacRate = parseFloat(document.getElementById('sacRate').value);

    // Convert to meters if needed
    if (depthUnit === 'feet') {
        depth = feetToMeters(depth);
    }

    // Get calculations
    const ndl = getNDL(depth);
    const pressureGroup = getPressureGroup(depth, time);
    const airConsumption = calculateAirConsumption(depth, time, tankSize, sacRate);

    // Determine safety status
    let safetyStatus = '';
    let statusClass = '';

    if (time > ndl) {
        safetyStatus = 'EXCEEDS NDL - UNSAFE!';
        statusClass = 'status-danger';
    } else if (time > ndl * 0.8) {
        safetyStatus = 'Near NDL Limit - Use Caution';
        statusClass = 'status-caution';
    } else {
        safetyStatus = 'Within Safe Limits';
        statusClass = 'status-safe';
    }

    // Safety stop recommendation
    let safetyStop = '';
    if (depth >= 18) {
        safetyStop = '3-5 minutes at 5m (15ft) - REQUIRED';
    } else if (depth >= 12) {
        safetyStop = '3 minutes at 5m (15ft) - RECOMMENDED';
    } else {
        safetyStop = 'Optional (recommended for all dives)';
    }

    // Recommended surface interval
    const siRecommendation = pressureGroup >= 'G' ? 'At least 60 minutes' : 'At least 30 minutes';

    // Display results
    document.getElementById('results').style.display = 'block';
    document.getElementById('ndl').textContent = `${ndl} minutes`;
    document.getElementById('safetyStatus').textContent = safetyStatus;
    document.getElementById('safetyStatus').className = `value ${statusClass}`;
    document.getElementById('safetyStop').textContent = safetyStop;
    document.getElementById('airConsumption').textContent = `${airConsumption.liters}L (${airConsumption.bars} bar)`;
    document.getElementById('pressureGroup').textContent = pressureGroup;
    document.getElementById('surfaceInterval').textContent = siRecommendation;

    // Display warnings
    displayWarnings(depth, time, ndl, airConsumption, depthUnit);

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display warnings
function displayWarnings(depth, time, ndl, airConsumption, depthUnit) {
    const warningsDiv = document.getElementById('warnings');
    warningsDiv.innerHTML = '';

    const warnings = [];

    // Depth warnings
    if (depth > 40) {
        warnings.push({
            type: 'danger',
            message: 'Depth exceeds recreational diving limit (40m/130ft)! This dive requires technical diving training.'
        });
    } else if (depth > 30) {
        warnings.push({
            type: 'caution',
            message: 'Deep dive (>30m). Ensure proper certification and consider using enriched air (nitrox).'
        });
    }

    // Time warnings
    if (time > ndl) {
        warnings.push({
            type: 'danger',
            message: 'Planned time exceeds No-Decompression Limit! Reduce bottom time or depth.'
        });
    } else if (time > ndl * 0.8) {
        warnings.push({
            type: 'caution',
            message: 'Approaching NDL. Consider reducing bottom time for safety margin.'
        });
    }

    // Air consumption warnings
    if (airConsumption.bars > 180) {
        warnings.push({
            type: 'danger',
            message: 'Insufficient air for this dive! Use a larger tank or reduce depth/time.'
        });
    } else if (airConsumption.bars > 150) {
        warnings.push({
            type: 'caution',
            message: 'High air consumption. Ensure you have adequate reserve (min 50 bar).'
        });
    }

    // Display warnings
    if (warnings.length > 0) {
        warnings.forEach(warning => {
            const warningElement = document.createElement('div');
            warningElement.className = `warning-item warning-${warning.type}`;
            warningElement.textContent = warning.message;
            warningsDiv.appendChild(warningElement);
        });
    } else {
        const infoElement = document.createElement('div');
        infoElement.className = 'warning-item warning-info';
        infoElement.textContent = 'No warnings. Dive parameters look good! Remember to always dive with a buddy and follow safe diving practices.';
        warningsDiv.appendChild(infoElement);
    }
}

// Calculate surface interval
function calculateSurfaceInterval() {
    const currentGroup = document.getElementById('currentGroup').value.toUpperCase();
    const surfaceTime = parseFloat(document.getElementById('surfaceTime').value);

    if (!currentGroup || currentGroup.length !== 1) {
        alert('Please enter a valid pressure group (A-O)');
        return;
    }

    const newGroup = calculateNewPressureGroup(currentGroup, surfaceTime);

    if (newGroup === null) {
        alert('Invalid pressure group. Please enter a letter from A to O.');
        return;
    }

    document.getElementById('newGroupResult').style.display = 'flex';
    document.getElementById('newGroup').textContent = newGroup;

    if (newGroup === 'A' || newGroup === 'Z') {
        document.getElementById('newGroup').textContent += ' (Fully desaturated)';
    }
}

// Event listeners
document.getElementById('calculateBtn').addEventListener('click', calculateDivePlan);
document.getElementById('calculateSIBtn').addEventListener('click', calculateSurfaceInterval);

// Allow Enter key to trigger calculation
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (input.id === 'currentGroup' || input.id === 'surfaceTime') {
                calculateSurfaceInterval();
            } else {
                calculateDivePlan();
            }
        }
    });
});

// Initial calculation on page load
window.addEventListener('load', calculateDivePlan);
