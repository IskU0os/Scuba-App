# Scuba Dive Planner

A simple web application for planning recreational scuba dives. This tool helps divers calculate no-decompression limits (NDL), air consumption, pressure groups, and safety stops based on dive parameters.

## Features

- **Dive Planning Calculator**
  - No-Decompression Limit (NDL) calculations based on PADI recreational dive tables
  - Depth input in meters or feet
  - Bottom time planning
  - Air consumption estimation based on tank size and SAC rate
  - Pressure group assignment
  - Safety stop recommendations

- **Surface Interval Calculator**
  - Calculate new pressure group after surface intervals
  - Helps plan repetitive dives safely

- **Safety Warnings**
  - Real-time warnings for unsafe dive parameters
  - Depth limit alerts
  - Air consumption warnings
  - NDL proximity alerts

- **Educational Information**
  - Key safety guidelines
  - Recreational diving limits
  - Important reminders for safe diving

## How to Use

1. Open `index.html` in a web browser
2. Enter your planned dive parameters:
   - Depth (in meters or feet)
   - Bottom time (in minutes)
   - Tank size (in liters)
   - Surface Air Consumption rate (SAC)
3. Click "Calculate Dive Plan" to see results
4. Review the NDL, safety status, and warnings
5. Use the Surface Interval Calculator for planning repetitive dives

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- No external dependencies
- Responsive design for mobile and desktop
- Based on simplified PADI recreational dive tables
- Maximum depth: 40m (130ft) - recreational limit

## Safety Disclaimer

**This tool is for educational purposes only.** Always use official dive tables, dive computers, and plan dives according to your certification level. Never dive beyond your training and experience. Always dive with a buddy and follow safe diving practices.

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and layout
- `script.js` - Dive calculations and logic

## Getting Started

Simply open `index.html` in any modern web browser. No installation or server required.