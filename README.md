# CPU Scheduling Simulator

A web-based interactive simulator for various CPU scheduling algorithms commonly studied in operating systems courses.

## Features

This simulator supports multiple CPU scheduling algorithms:

- **FCFS** (First Come First Serve) - Processes executed in arrival order
- **SJF** (Shortest Job First) - Processes with shortest burst time execute first
- **SRTF** (Shortest Remaining Time First) - Preemptive version of SJF
- **Priority Scheduling** - Processes scheduled based on priority levels
- **Priority (Preemptive)** - Preemptive priority with dynamic queue updates
- **Round Robin** - Time quantum-based circular scheduling
- **HRRN** (Highest Response Ratio Next) - Non-preemptive starvation-aware scheduling
- **MLQ** (Multilevel Queue) - Fixed queues; high-priority Round Robin, lower FCFS
- **MLFQ** (Multilevel Feedback Queue) - Three-level feedback with tunable base quantum
- **Rate Monotonic** - Fixed-priority real-time based on period
- **EDF** (Earliest Deadline First) - Preemptive real-time based on nearest deadline

### User Experience Enhancements

- **Dark/Light Theme Toggle**: Switch themes with the header toggle; preference is saved in localStorage.
- **Preset Test Cases**: Load ready-made process sets from the "Load Preset" dropdown for quick demos.
- **Step-by-Step Execution**: Enable step mode to navigate the Gantt chart execution with Previous/Next controls.
- **Mobile-Responsive UI**: Optimized layouts and tables for small screens, with horizontal scroll where needed.

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
4. Optionally choose a preset from the "Load Preset" dropdown to auto-fill processes
5. Enter or adjust process details (arrival time, burst time, priority if applicable)
6. Set time quantum when using Round Robin
7. Click "Calculate Schedule" to view:
   - Gantt chart visualization
   - Process execution timeline
   - Average turnaround time
   - Average waiting time
8. For learning: click "Enable Step Mode" to step through execution with the controls in the Results section

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
- Theme management (dark/light)
- Preset loader for test cases
- Step-by-step execution controls

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

## Deployment

This project is static and deployable on Vercel:

- Ensure `index.html` exists at the project root.
- `vercel.json` is included; Vercel will serve static files.
- Connect the GitHub repo to Vercel and enable automatic deployments.

Troubleshooting:
- If you see `404 NOT_FOUND`, confirm `index.html` exists and deployment points to the repo root.

## Browser Compatibility

- Chrome/Chromium (latest)
- Firefox (latest)
- Microsoft Edge (latest)
- Safari (latest)

## Local Storage

The application uses browser local storage for:
- User authentication state
- Session management
- Dark theme preference (`darkTheme`)

## Author

CPU Scheduling Simulator Project

## License

Open source - Feel free to modify and distribute
