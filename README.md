# CPU Scheduling Simulator

A web-based interactive simulator for various CPU scheduling algorithms commonly studied in operating systems courses.

## Features

This simulator supports multiple CPU scheduling algorithms:

- **FCFS** (First Come First Serve) - Processes executed in arrival order
- **SJF** (Shortest Job First) - Processes with shortest burst time execute first
- **SRTF** (Shortest Remaining Time First) - Preemptive version of SJF
- **Priority Scheduling** - Processes scheduled based on priority levels
- **Round Robin** - Time quantum-based circular scheduling

## Project Structure

```
├── web.html          # Main application interface
├── index.html        # User authentication page
├── web.css           # Styling for main application
├── login.css         # Styling for login page
├── script.js         # Core application logic and scheduling algorithms
└── build.ps1         # Windows build helper script
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- No server required - runs completely on the client side

### Usage

1. Open `index.html` in your web browser
2. Complete the login process
3. Select a CPU scheduling algorithm from the available options
4. Enter process details (name, arrival time, burst time, priority if applicable)
5. Set time quantum for Round Robin if selected
6. Click "Simulate" to view:
   - Gantt chart visualization
   - Process execution timeline
   - Average turnaround time
   - Average waiting time

## Features

- **Interactive Algorithm Selection** - Easy switching between different scheduling algorithms
- **Real-time Visualization** - Gantt charts showing process execution order
- **Performance Metrics** - Calculate average turnaround and waiting times
- **User Authentication** - Login system with session management
- **Responsive Design** - Works on desktop and tablet devices

## Files Description

### web.html
Main application interface containing:
- Algorithm selection cards
- Process input form
- Results display with Gantt chart
- Performance metrics table

### script.js
Core functionality including:
- Scheduling algorithm implementations
- DOM manipulation and event handling
- Gantt chart generation
- Performance calculations
- User authentication handling

### index.html
User login interface for session management

### web.css & login.css
Styling for the application with responsive design

### build.ps1
PowerShell build helper for compiling any C++ backend components (if using CMake or g++)

## Build Instructions (Optional)

For Windows with PowerShell:

```powershell
.\build.ps1
```

This will:
- Use CMake if available (Release build)
- Fall back to g++ compilation if CMake is not present
- Output executable file for backend testing

## Browser Compatibility

- Chrome/Chromium (latest)
- Firefox (latest)
- Microsoft Edge (latest)
- Safari (latest)

## Local Storage

The application uses browser local storage for:
- User authentication state
- Session management

## Author

CPU Scheduling Simulator Project

## License

Open source - Feel free to modify and distribute
