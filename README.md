# Scuba-App

A simple web-based scuba dive planner for recreational divers. Plan your dives safely with no-decompression limit calculations, pressure group tracking, and surface interval planning.

## Features

- **Single Dive Calculator**: Calculate no-decompression limits (NDL) for planned dives
- **Pressure Group Tracking**: Automatically determine your ending pressure group
- **Surface Interval Calculator**: Calculate nitrogen off-gassing between dives
- **Safety Warnings**: Real-time safety checks and warnings for depth and time limits
- **Recommendations**: Personalized dive safety recommendations
- **Mobile Friendly**: Responsive design works on all devices

## How to Use

1. Open `index.html` in your web browser
2. Enter your planned dive depth (in meters) and bottom time (in minutes)
3. Click "Calculate Dive" to see your dive analysis
4. Use the Surface Interval Calculator to plan repetitive dives

## Safety Information

**⚠️ IMPORTANT**: This tool is for educational purposes only. Always:
- Use official dive tables and dive computers
- Consult with certified dive professionals
- Dive within your certification limits
- Never dive alone - always use the buddy system
- Follow all safety protocols and guidelines

## Recreational Dive Limits

- **Maximum Depth**: 40 meters
- **Recommended Beginner Depth**: 18 meters
- **Maximum Ascent Rate**: 9 meters/minute
- **Safety Stop**: 3-5 minutes at 5 meters on all dives
- **Minimum Surface Interval**: Follow pressure group guidelines

## Technical Details

The app uses simplified versions of PADI Recreational Dive Planner (RDP) tables including:
- No-Decompression Limit (NDL) tables for depths from 11-40 meters
- Pressure group designations (A through L)
- Surface interval credit tables for nitrogen off-gassing calculations
- Buhlmann ZHL-16C decompression algorithm with gradient factors for technical diving
- Metric measurements throughout (meters, bar, liters)

## Files

- `index.html` - Main application interface
- `style.css` - Styling and responsive design
- `script.js` - Dive calculation logic and safety checks

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers

## License

This project is for educational purposes only. Always consult official diving resources and certified professionals for actual dive planning.