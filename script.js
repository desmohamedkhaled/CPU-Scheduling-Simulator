// DOM Elements
const appPage = document.getElementById('appPage');
const logoutBtn = document.getElementById('logoutBtn');
const algorithmCards = document.querySelectorAll('.algorithm-card');
const timeQuantumSection = document.getElementById('timeQuantumSection');
const priorityHeader = document.getElementById('priorityHeader');
const resultsPriorityHeader = document.getElementById('resultsPriorityHeader');
const deadlineHeader = document.getElementById('deadlineHeader');
const resultsDeadlineHeader = document.getElementById('resultsDeadlineHeader');
const processTableBody = document.getElementById('processTableBody');
const resultsSection = document.getElementById('resultsSection');
const ganttContainer = document.getElementById('ganttContainer');
const ganttTimeline = document.getElementById('ganttTimeline');
const resultsTableBody = document.getElementById('resultsTableBody');
const avgTurnaround = document.getElementById('avgTurnaround');
const avgWaiting = document.getElementById('avgWaiting');
const mlfqQuantumSection = document.getElementById('mlfqQuantumSection');
const mlfqBaseQuantumInput = document.getElementById('mlfqBaseQuantum');

// Algorithm grouping helpers
const priorityAlgorithms = ['Priority', 'PriorityPreemptive', 'MLQ'];
const deadlineAlgorithms = ['RateMonotonic', 'EDF'];
const quantumAlgorithms = ['RoundRobin', 'MLQ'];

// Current selected algorithm
let selectedAlgorithm = 'FCFS';

// Process management
let processCount = 2;

// Step-by-step execution
let stepMode = false;
let currentStep = 0;
let stepData = [];

// Theme management
let isDarkTheme = localStorage.getItem('darkTheme') === 'true';

// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // Initialize the app
    initApp();
});

// Initialize the application
function initApp() {
    // Apply saved theme
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        document.querySelector('.theme-icon').textContent = '☀️';
    }

    // Set FCFS as default selected algorithm
    document.querySelector('.algorithm-card[data-algorithm="FCFS"]').classList.add('selected');
    
    // Add event listeners
    logoutBtn.addEventListener('click', handleLogout);
    
    algorithmCards.forEach(card => {
        card.addEventListener('click', handleAlgorithmSelection);
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Preset selector
    document.getElementById('presetSelect').addEventListener('change', loadPreset);

    // Apply default visibility states
    handleAlgorithmSelection.call(document.querySelector('.algorithm-card[data-algorithm="FCFS"]'));
    
    // Add pulse animation to app container
    appPage.classList.add('pulse');
    setTimeout(() => {
        appPage.classList.remove('pulse');
    }, 500);
}

// Toggle theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme');
    
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = isDarkTheme ? '☀️' : '🌙';
    
    localStorage.setItem('darkTheme', isDarkTheme);
}

// Preset test cases
const presets = {
    basic: [
        { arrival: 0, burst: 5, priority: 2, deadline: 10 },
        { arrival: 1, burst: 3, priority: 1, deadline: 9 },
        { arrival: 2, burst: 8, priority: 3, deadline: 15 }
    ],
    heavy: [
        { arrival: 0, burst: 10, priority: 3, deadline: 22 },
        { arrival: 1, burst: 5, priority: 1, deadline: 14 },
        { arrival: 2, burst: 8, priority: 2, deadline: 20 },
        { arrival: 3, burst: 6, priority: 4, deadline: 18 },
        { arrival: 4, burst: 4, priority: 5, deadline: 16 }
    ],
    mixed: [
        { arrival: 0, burst: 7, priority: 2, deadline: 16 },
        { arrival: 2, burst: 4, priority: 1, deadline: 12 },
        { arrival: 4, burst: 1, priority: 3, deadline: 10 },
        { arrival: 5, burst: 4, priority: 4, deadline: 15 }
    ],
    priority: [
        { arrival: 0, burst: 8, priority: 3, deadline: 18 },
        { arrival: 1, burst: 2, priority: 1, deadline: 9 },
        { arrival: 2, burst: 4, priority: 2, deadline: 13 },
        { arrival: 3, burst: 1, priority: 1, deadline: 8 }
    ]
};

// Load preset
function loadPreset() {
    const presetName = this.value;
    if (!presetName || !presets[presetName]) return;
    
    const preset = presets[presetName];
    
    // Clear existing processes
    processTableBody.innerHTML = '';
    processCount = 0;
    
    // Add preset processes
    preset.forEach((process, index) => {
        processCount++;
        const deadlineValue = process.deadline ?? (process.arrival + process.burst + 5);
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>P${processCount}</td>
            <td><input type="number" class="arrival-time" min="0" value="${process.arrival}"></td>
            <td><input type="number" class="burst-time" min="1" value="${process.burst}"></td>
            <td class="priority-cell"><input type="number" class="priority" min="1" value="${process.priority}"></td>
            <td class="deadline-cell"><input type="number" class="deadline" min="1" value="${deadlineValue}"></td>
            <td><button class="delete-btn action-btn" onclick="deleteProcess(this)">Delete</button></td>
        `;
        processTableBody.appendChild(newRow);
    });

    // Update priority column visibility
    handleAlgorithmSelection.call(document.querySelector('.algorithm-card.selected'));
    
    // Reset preset selector
    this.value = '';
}

// Toggle step mode
function toggleStepMode() {
    stepMode = !stepMode;
    const stepBtn = document.getElementById('stepBtn');
    const stepBtnText = document.getElementById('stepBtnText');
    
    if (stepMode) {
        stepBtnText.textContent = 'Disable Step Mode';
        stepBtn.style.background = '#ff6b6b';
    } else {
        stepBtnText.textContent = 'Enable Step Mode';
        stepBtn.style.background = '#ffa500';
        document.getElementById('stepControls').style.display = 'none';
    }
}

// Step navigation
function nextStep() {
    if (currentStep < stepData.length - 1) {
        currentStep++;
        updateStepDisplay();
    }
}

function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    if (stepData.length === 0) return;
    
    const step = stepData[currentStep];
    
    // Update Gantt chart to show only up to current step
    ganttContainer.innerHTML = '';
    let totalWidth = 0;
    const scale = 30;
    
    for (let i = 0; i <= currentStep; i++) {
        const item = stepData[i];
        totalWidth += item.duration;
    }
    
    let currentTime = 0;
    for (let i = 0; i <= currentStep; i++) {
        const item = stepData[i];
        const width = (item.duration / totalWidth) * 100;
        const processDiv = document.createElement('div');
        processDiv.className = 'gantt-process';
        processDiv.style.width = width + '%';
        processDiv.style.backgroundColor = item.color;
        processDiv.textContent = item.process;
        ganttContainer.appendChild(processDiv);
        currentTime += item.duration;
    }
    
    // Update step info
    document.getElementById('stepInfo').textContent = `Step ${currentStep + 1} of ${stepData.length}`;
    
    // Update button states
    document.getElementById('prevStepBtn').disabled = currentStep === 0;
    document.getElementById('nextStepBtn').disabled = currentStep === stepData.length - 1;
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// Handle algorithm selection
function handleAlgorithmSelection() {
    // Remove selected class from all cards
    algorithmCards.forEach(c => c.classList.remove('selected'));
    
    // Add selected class to clicked card
    this.classList.add('selected');
    
    // Update selected algorithm
    selectedAlgorithm = this.getAttribute('data-algorithm');
    
    // Show/hide time quantum controls
    const showQuantum = quantumAlgorithms.includes(selectedAlgorithm);
    timeQuantumSection.style.display = showQuantum ? 'block' : 'none';
    mlfqQuantumSection.style.display = selectedAlgorithm === 'MLFQ' ? 'block' : 'none';
    
    // Show/hide priority inputs where needed
    const showPriority = priorityAlgorithms.includes(selectedAlgorithm);
    priorityHeader.style.display = showPriority ? 'table-cell' : 'none';
    resultsPriorityHeader.style.display = showPriority ? 'table-cell' : 'none';
    document.querySelectorAll('.priority-cell').forEach(cell => {
        cell.style.display = showPriority ? 'table-cell' : 'none';
    });
    
    // Show/hide deadline / period inputs for real-time algorithms
    const showDeadline = deadlineAlgorithms.includes(selectedAlgorithm);
    deadlineHeader.style.display = showDeadline ? 'table-cell' : 'none';
    resultsDeadlineHeader.style.display = showDeadline ? 'table-cell' : 'none';
    document.querySelectorAll('.deadline-cell').forEach(cell => {
        cell.style.display = showDeadline ? 'table-cell' : 'none';
    });
    
    // Reset results
    resultsSection.style.display = 'none';
}

// Process management functions
function addProcess() {
    processCount++;
    const defaultDeadline = 10;
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>P${processCount}</td>
        <td><input type="number" class="arrival-time" min="0" value="0"></td>
        <td><input type="number" class="burst-time" min="1" value="1"></td>
        <td class="priority-cell"><input type="number" class="priority" min="1" value="1"></td>
        <td class="deadline-cell"><input type="number" class="deadline" min="1" value="${defaultDeadline}"></td>
        <td><button class="delete-btn action-btn" onclick="deleteProcess(this)">Delete</button></td>
    `;
    processTableBody.appendChild(newRow);
    
    // Hide priority column if not needed
    if (!priorityAlgorithms.includes(selectedAlgorithm)) {
        newRow.querySelector('.priority-cell').style.display = 'none';
    }
    
    // Hide deadline column if not needed
    if (!deadlineAlgorithms.includes(selectedAlgorithm)) {
        newRow.querySelector('.deadline-cell').style.display = 'none';
    }
    
    // Add animation
    newRow.style.animation = 'fadeIn 0.5s ease-out';
}

function deleteProcess(button) {
    if (processTableBody.children.length > 1) {
        const row = button.parentNode.parentNode;
        
        // Add fade out animation
        row.style.animation = 'fadeIn 0.5s ease-out reverse';
        
        setTimeout(() => {
            row.parentNode.removeChild(row);
            processCount--;
            
            // Update process IDs
            const rows = processTableBody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                row.cells[0].textContent = `P${index + 1}`;
            });
        }, 500);
    } else {
        alert('You need at least one process');
    }
}

// Scheduling calculation
function calculateSchedule() {
    // Get process data
    const processes = [];
    const rows = processTableBody.querySelectorAll('tr');
    
    rows.forEach((row, index) => {
        const arrivalTime = parseInt(row.querySelector('.arrival-time').value);
        const burstTime = parseInt(row.querySelector('.burst-time').value);
        const priorityInput = row.querySelector('.priority');
        const rawPriority = priorityInput ? parseInt(priorityInput.value) : null;
        const priority = isNaN(rawPriority) ? null : rawPriority;
        const deadlineInput = row.querySelector('.deadline');
        const rawDeadline = deadlineInput ? parseInt(deadlineInput.value) : null;
        const normalizedDeadline = isNaN(rawDeadline) ? arrivalTime + burstTime : rawDeadline;
        
        processes.push({
            id: `P${index + 1}`,
            arrivalTime: arrivalTime,
            burstTime: burstTime,
            priority: priority,
            deadline: normalizedDeadline,
            period: normalizedDeadline,
            absoluteDeadline: arrivalTime + normalizedDeadline,
            remainingTime: burstTime,
            completionTime: 0,
            turnaroundTime: 0,
            waitingTime: 0
        });
    });
    
    // Calculate schedule based on selected algorithm
    let schedule;
    switch(selectedAlgorithm) {
        case 'FCFS':
            schedule = calculateFCFS(processes);
            break;
        case 'SJF':
            schedule = calculateSJF(processes);
            break;
        case 'SRTF':
            schedule = calculateSRTF(processes);
            break;
        case 'Priority':
            schedule = calculatePriority(processes);
            break;
        case 'PriorityPreemptive':
            schedule = calculatePriorityPreemptive(processes);
            break;
        case 'RoundRobin':
            const timeQuantum = parseInt(document.getElementById('timeQuantum').value);
            schedule = calculateRoundRobin(processes, timeQuantum);
            break;
        case 'HRRN':
            schedule = calculateHRRN(processes);
            break;
        case 'MLQ':
            const mlqQuantum = parseInt(document.getElementById('timeQuantum').value) || 2;
            schedule = calculateMultilevelQueue(processes, mlqQuantum);
            break;
        case 'MLFQ':
            const baseQuantum = parseInt(mlfqBaseQuantumInput.value) || 2;
            schedule = calculateMultilevelFeedbackQueue(processes, baseQuantum);
            break;
        case 'RateMonotonic':
            schedule = calculateRateMonotonic(processes);
            break;
        case 'EDF':
            schedule = calculateEDF(processes);
            break;
    }
    
    // Display results
    displayResults(schedule);
}

// Algorithm implementations
function calculateFCFS(processes) {
    // Sort by arrival time
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    const ganttChart = [];
    
    sortedProcesses.forEach(process => {
        // If process arrives after current time, wait for it
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        
        // Process execution
        ganttChart.push({
            process: process.id,
            start: currentTime,
            end: currentTime + process.burstTime
        });
        
        // Calculate times
        process.completionTime = currentTime + process.burstTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
        
        currentTime += process.burstTime;
    });
    
    return {
        processes: sortedProcesses,
        ganttChart: ganttChart
    };
}

function calculateSJF(processes) {
    // Sort by arrival time first
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    const completed = [];
    const ganttChart = [];
    const queue = [];
    
    while (completed.length < sortedProcesses.length) {
        // Add processes that have arrived to the queue
        for (let i = 0; i < sortedProcesses.length; i++) {
            const process = sortedProcesses[i];
            if (process.arrivalTime <= currentTime && 
                !completed.includes(process) && 
                !queue.includes(process)) {
                queue.push(process);
            }
        }
        
        // If queue is empty, move time to next arrival
        if (queue.length === 0) {
            currentTime++;
            continue;
        }
        
        // Sort queue by burst time (SJF)
        queue.sort((a, b) => a.burstTime - b.burstTime);
        
        // Execute the shortest job
        const currentProcess = queue.shift();
        
        ganttChart.push({
            process: currentProcess.id,
            start: currentTime,
            end: currentTime + currentProcess.burstTime
        });
        
        currentProcess.completionTime = currentTime + currentProcess.burstTime;
        currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
        currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        
        currentTime += currentProcess.burstTime;
        completed.push(currentProcess);
    }
    
    return {
        processes: sortedProcesses,
        ganttChart: ganttChart
    };
}

function calculateSRTF(processes) {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const completed = [];
    const ganttChart = [];
    const queue = [];
    
    while (completed.length < sortedProcesses.length) {
        // Add arrived processes to queue
        for (let i = 0; i < sortedProcesses.length; i++) {
            const process = sortedProcesses[i];
            if (process.arrivalTime <= currentTime && 
                !completed.includes(process) && 
                !queue.includes(process)) {
                queue.push(process);
            }
        }
        
        if (queue.length === 0) {
            currentTime++;
            continue;
        }
        
        // Sort by remaining time (SRTF)
        queue.sort((a, b) => a.remainingTime - b.remainingTime);
        const currentProcess = queue[0];
        
        // Execute for 1 unit of time
        const executionStart = currentTime;
        currentProcess.remainingTime--;
        currentTime++;
        
        // Check if process completed
        if (currentProcess.remainingTime === 0) {
            currentProcess.completionTime = currentTime;
            currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
            completed.push(currentProcess);
            queue.shift();
        }
        
        // Add to Gantt chart
        if (ganttChart.length === 0 || ganttChart[ganttChart.length - 1].process !== currentProcess.id) {
            ganttChart.push({
                process: currentProcess.id,
                start: executionStart,
                end: currentTime
            });
        } else {
            ganttChart[ganttChart.length - 1].end = currentTime;
        }
    }
    
    return {
        processes: sortedProcesses,
        ganttChart: ganttChart
    };
}

function calculatePriority(processes) {
    // Sort by arrival time first
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    const completed = [];
    const ganttChart = [];
    const queue = [];
    
    while (completed.length < sortedProcesses.length) {
        // Add processes that have arrived to the queue
        for (let i = 0; i < sortedProcesses.length; i++) {
            const process = sortedProcesses[i];
            if (process.arrivalTime <= currentTime && 
                !completed.includes(process) && 
                !queue.includes(process)) {
                queue.push(process);
            }
        }
        
        // If queue is empty, move time to next arrival
        if (queue.length === 0) {
            currentTime++;
            continue;
        }
        
        // Sort queue by priority (lower number = higher priority)
        queue.sort((a, b) => a.priority - b.priority);
        
        // Execute the highest priority job
        const currentProcess = queue.shift();
        
        ganttChart.push({
            process: currentProcess.id,
            start: currentTime,
            end: currentTime + currentProcess.burstTime
        });
        
        currentProcess.completionTime = currentTime + currentProcess.burstTime;
        currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
        currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        
        currentTime += currentProcess.burstTime;
        completed.push(currentProcess);
    }
    
    return {
        processes: sortedProcesses,
        ganttChart: ganttChart
    };
}

function calculateRoundRobin(processes, timeQuantum) {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const completed = [];
    const ganttChart = [];
    const queue = [];
    let processIndex = 0;
    
    // Add initial processes that arrive at time 0
    while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
        queue.push(sortedProcesses[processIndex]);
        processIndex++;
    }
    
    while (completed.length < sortedProcesses.length) {
        if (queue.length === 0) {
            // If no processes in queue, jump to next arrival time
            if (processIndex < sortedProcesses.length) {
                currentTime = sortedProcesses[processIndex].arrivalTime;
                while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
                    queue.push(sortedProcesses[processIndex]);
                    processIndex++;
                }
            } else {
                break;
            }
        }
        
        const currentProcess = queue.shift();
        const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);
        
        ganttChart.push({
            process: currentProcess.id,
            start: currentTime,
            end: currentTime + executionTime
        });
        
        currentProcess.remainingTime -= executionTime;
        currentTime += executionTime;
        
        // Add newly arrived processes to queue
        while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
            queue.push(sortedProcesses[processIndex]);
            processIndex++;
        }
        
        // If process not completed, add back to queue
        if (currentProcess.remainingTime > 0) {
            queue.push(currentProcess);
        } else {
            currentProcess.completionTime = currentTime;
            currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
            completed.push(currentProcess);
        }
    }
    
    return {
        processes: sortedProcesses,
        ganttChart: ganttChart
    };
}

function calculatePriorityPreemptive(processes) {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const completed = [];
    const ganttChart = [];
    const queue = [];
    
    while (completed.length < sortedProcesses.length) {
        sortedProcesses.forEach(proc => {
            if (proc.arrivalTime <= currentTime && !completed.includes(proc) && !queue.includes(proc)) {
                queue.push(proc);
            }
        });
        
        if (queue.length === 0) {
            currentTime++;
            continue;
        }
        
        queue.sort((a, b) => {
            const pa = a.priority ?? Number.MAX_SAFE_INTEGER;
            const pb = b.priority ?? Number.MAX_SAFE_INTEGER;
            if (pa === pb) {
                if (a.remainingTime === b.remainingTime) {
                    return a.arrivalTime - b.arrivalTime;
                }
                return a.remainingTime - b.remainingTime;
            }
            return pa - pb;
        });
        
        const currentProcess = queue[0];
        const executionStart = currentTime;
        currentProcess.remainingTime--;
        currentTime++;
        
        if (ganttChart.length === 0 || ganttChart[ganttChart.length - 1].process !== currentProcess.id) {
            ganttChart.push({ process: currentProcess.id, start: executionStart, end: currentTime });
        } else {
            ganttChart[ganttChart.length - 1].end = currentTime;
        }
        
        if (currentProcess.remainingTime === 0) {
            currentProcess.completionTime = currentTime;
            currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
            completed.push(currentProcess);
            queue.shift();
        }
    }
    
    return {
        processes: sortedProcesses,
        ganttChart
    };
}

function calculateHRRN(processes) {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const completed = [];
    const ganttChart = [];
    const queue = [];
    
    while (completed.length < sortedProcesses.length) {
        sortedProcesses.forEach(proc => {
            if (proc.arrivalTime <= currentTime && !completed.includes(proc) && !queue.includes(proc)) {
                queue.push(proc);
            }
        });
        
        if (queue.length === 0) {
            currentTime++;
            continue;
        }
        
        queue.sort((a, b) => {
            const responseA = ((currentTime - a.arrivalTime) + a.burstTime) / a.burstTime;
            const responseB = ((currentTime - b.arrivalTime) + b.burstTime) / b.burstTime;
            if (responseA === responseB) {
                return a.arrivalTime - b.arrivalTime;
            }
            return responseB - responseA;
        });
        
        const currentProcess = queue.shift();
        const start = Math.max(currentTime, currentProcess.arrivalTime);
        const end = start + currentProcess.burstTime;
        
        ganttChart.push({ process: currentProcess.id, start, end });
        
        currentProcess.completionTime = end;
        currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
        currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        currentTime = end;
        completed.push(currentProcess);
    }
    
    return {
        processes: sortedProcesses,
        ganttChart
    };
}

function calculateMultilevelQueue(processes, timeQuantum) {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const completed = [];
    const ganttChart = [];
    const highQueue = [];
    const lowQueue = [];
    let processIndex = 0;
    const quantum = timeQuantum || 2;
    
    while (completed.length < sortedProcesses.length) {
        while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
            const proc = sortedProcesses[processIndex];
            const priorityValue = proc.priority ?? Number.MAX_SAFE_INTEGER;
            if (priorityValue <= 2) {
                highQueue.push(proc);
            } else {
                lowQueue.push(proc);
            }
            processIndex++;
        }
        
        if (highQueue.length === 0 && lowQueue.length === 0) {
            currentTime++;
            continue;
        }
        
        if (highQueue.length > 0) {
            const currentProcess = highQueue.shift();
            let executed = 0;
            while (executed < quantum && currentProcess.remainingTime > 0) {
                const executionStart = currentTime;
                currentProcess.remainingTime--;
                currentTime++;
                executed++;
                
                if (ganttChart.length === 0 || ganttChart[ganttChart.length - 1].process !== currentProcess.id) {
                    ganttChart.push({ process: currentProcess.id, start: executionStart, end: currentTime });
                } else {
                    ganttChart[ganttChart.length - 1].end = currentTime;
                }
                
                while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
                    const proc = sortedProcesses[processIndex];
                    const priorityValue = proc.priority ?? Number.MAX_SAFE_INTEGER;
                    if (priorityValue <= 2) {
                        highQueue.push(proc);
                    } else {
                        lowQueue.push(proc);
                    }
                    processIndex++;
                }
            }
            
            if (currentProcess.remainingTime === 0) {
                currentProcess.completionTime = currentTime;
                currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
                currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
                completed.push(currentProcess);
            } else {
                highQueue.push(currentProcess);
            }
        } else if (lowQueue.length > 0) {
            const currentProcess = lowQueue[0];
            const executionStart = currentTime;
            if (ganttChart.length === 0 || ganttChart[ganttChart.length - 1].process !== currentProcess.id) {
                ganttChart.push({ process: currentProcess.id, start: executionStart, end: executionStart });
            }
            
            // Execute in FCFS but allow preemption when a high-priority process arrives
            while (currentProcess.remainingTime > 0) {
                currentProcess.remainingTime--;
                currentTime++;
                ganttChart[ganttChart.length - 1].end = currentTime;
                
                while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
                    const proc = sortedProcesses[processIndex];
                    const priorityValue = proc.priority ?? Number.MAX_SAFE_INTEGER;
                    if (priorityValue <= 2) {
                        highQueue.push(proc);
                    } else {
                        lowQueue.push(proc);
                    }
                    processIndex++;
                }
                
                if (highQueue.length > 0) {
                    break;
                }
            }
            
            if (currentProcess.remainingTime === 0) {
                lowQueue.shift();
                currentProcess.completionTime = currentTime;
                currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
                currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
                completed.push(currentProcess);
            }
        }
    }
    
    return {
        processes: sortedProcesses,
        ganttChart
    };
}

function calculateMultilevelFeedbackQueue(processes, baseQuantum) {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const completed = [];
    const ganttChart = [];
    const q1 = [];
    const q2 = [];
    const q3 = [];
    let processIndex = 0;
    const q1Quantum = baseQuantum || 2;
    const q2Quantum = q1Quantum * 2;
    
    while (completed.length < sortedProcesses.length) {
        while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
            q1.push(sortedProcesses[processIndex]);
            processIndex++;
        }
        
        if (q1.length === 0 && q2.length === 0 && q3.length === 0) {
            currentTime++;
            continue;
        }
        
        let currentProcess;
        let quantum = null;
        let level = 1;
        if (q1.length > 0) {
            currentProcess = q1.shift();
            quantum = q1Quantum;
            level = 1;
        } else if (q2.length > 0) {
            currentProcess = q2.shift();
            quantum = q2Quantum;
            level = 2;
        } else {
            currentProcess = q3.shift();
            level = 3;
        }
        
        let executed = 0;
        while (true) {
            const executionStart = currentTime;
            currentProcess.remainingTime--;
            currentTime++;
            executed++;
            
            if (ganttChart.length === 0 || ganttChart[ganttChart.length - 1].process !== currentProcess.id) {
                ganttChart.push({ process: currentProcess.id, start: executionStart, end: currentTime });
            } else {
                ganttChart[ganttChart.length - 1].end = currentTime;
            }
            
            while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
                q1.push(sortedProcesses[processIndex]);
                processIndex++;
            }
            
            if (currentProcess.remainingTime === 0) {
                currentProcess.completionTime = currentTime;
                currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
                currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
                completed.push(currentProcess);
                break;
            }
            
            if (level === 1 && executed >= quantum) {
                q2.push(currentProcess);
                break;
            }
            
            if (level === 2 && (executed >= quantum || q1.length > 0)) {
                q3.push(currentProcess);
                break;
            }
            
            if (level === 3 && q1.length > 0) {
                q3.unshift(currentProcess);
                break;
            }
            
            if (level === 3 && q1.length === 0 && q2.length > 0) {
                q3.unshift(currentProcess);
                break;
            }
        }
    }
    
    return {
        processes: sortedProcesses,
        ganttChart
    };
}

function calculateRateMonotonic(processes) {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const completed = [];
    const ganttChart = [];
    const queue = [];
    let processIndex = 0;
    
    while (completed.length < sortedProcesses.length) {
        while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
            queue.push(sortedProcesses[processIndex]);
            processIndex++;
        }
        
        if (queue.length === 0) {
            currentTime++;
            continue;
        }
        
        queue.sort((a, b) => {
            const periodA = a.period ?? Number.MAX_SAFE_INTEGER;
            const periodB = b.period ?? Number.MAX_SAFE_INTEGER;
            if (periodA === periodB) {
                return a.remainingTime - b.remainingTime;
            }
            return periodA - periodB;
        });
        
        const currentProcess = queue[0];
        const executionStart = currentTime;
        currentProcess.remainingTime--;
        currentTime++;
        
        if (ganttChart.length === 0 || ganttChart[ganttChart.length - 1].process !== currentProcess.id) {
            ganttChart.push({ process: currentProcess.id, start: executionStart, end: currentTime });
        } else {
            ganttChart[ganttChart.length - 1].end = currentTime;
        }
        
        if (currentProcess.remainingTime === 0) {
            currentProcess.completionTime = currentTime;
            currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
            completed.push(currentProcess);
            queue.shift();
        }
    }
    
    return {
        processes: sortedProcesses,
        ganttChart
    };
}

function calculateEDF(processes) {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const completed = [];
    const ganttChart = [];
    const queue = [];
    let processIndex = 0;
    
    while (completed.length < sortedProcesses.length) {
        while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
            queue.push(sortedProcesses[processIndex]);
            processIndex++;
        }
        
        if (queue.length === 0) {
            currentTime++;
            continue;
        }
        
        queue.sort((a, b) => {
            const deadlineA = a.absoluteDeadline ?? (a.arrivalTime + (a.deadline ?? a.burstTime));
            const deadlineB = b.absoluteDeadline ?? (b.arrivalTime + (b.deadline ?? b.burstTime));
            if (deadlineA === deadlineB) {
                return a.remainingTime - b.remainingTime;
            }
            return deadlineA - deadlineB;
        });
        
        const currentProcess = queue[0];
        const executionStart = currentTime;
        currentProcess.remainingTime--;
        currentTime++;
        
        if (ganttChart.length === 0 || ganttChart[ganttChart.length - 1].process !== currentProcess.id) {
            ganttChart.push({ process: currentProcess.id, start: executionStart, end: currentTime });
        } else {
            ganttChart[ganttChart.length - 1].end = currentTime;
        }
        
        if (currentProcess.remainingTime === 0) {
            currentProcess.completionTime = currentTime;
            currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
            completed.push(currentProcess);
            queue.shift();
        }
    }
    
    return {
        processes: sortedProcesses,
        ganttChart
    };
}

// Display results
function displayResults(schedule) {
    const { processes, ganttChart } = schedule;
    
    // Show results section
    resultsSection.style.display = 'block';
    
    // Prepare step data if step mode is enabled
    if (stepMode) {
        prepareStepData(ganttChart);
        document.getElementById('stepControls').style.display = 'flex';
        currentStep = 0;
        updateStepDisplay();
    } else {
        document.getElementById('stepControls').style.display = 'none';
        // Generate Gantt chart normally
        generateGanttChart(ganttChart);
    }
    
    // Generate results table
    generateResultsTable(processes);
    
    // Calculate and display averages
    calculateAverages(processes);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Prepare step-by-step data
function prepareStepData(ganttChart) {
    stepData = [];
    const colors = [
        '#5a9cb5', '#faac68', '#fa6868', '#face68',
        '#447a90', '#d98a4d', '#d65c5c', '#dcb44f'
    ];
    
    ganttChart.forEach((segment, index) => {
        stepData.push({
            process: segment.process,
            start: segment.start,
            end: segment.end,
            duration: segment.end - segment.start,
            color: colors[index % colors.length]
        });
    });
}

// Generate Gantt chart
function generateGanttChart(ganttChart) {
    ganttContainer.innerHTML = '';
    ganttTimeline.innerHTML = '';
    
    if (ganttChart.length === 0) return;
    
    const totalTime = ganttChart[ganttChart.length - 1].end;
    const colors = [
        '#5a9cb5', '#faac68', '#fa6868', '#face68',
        '#447a90', '#d98a4d', '#d65c5c', '#dcb44f'
    ];
    
    ganttChart.forEach((segment, index) => {
        const width = ((segment.end - segment.start) / totalTime) * 100;
        const color = colors[index % colors.length];
        
        const processElement = document.createElement('div');
        processElement.className = 'gantt-process';
        processElement.style.width = `${width}%`;
        processElement.style.backgroundColor = color;
        processElement.textContent = segment.process;
        processElement.title = `${segment.process} (${segment.start}-${segment.end})`;
        
        ganttContainer.appendChild(processElement);
    });
    
    // Generate timeline
    for (let i = 0; i <= totalTime; i++) {
        const timeElement = document.createElement('div');
        timeElement.className = 'gantt-time';
        timeElement.textContent = i;
        ganttTimeline.appendChild(timeElement);
    }
}

// Generate results table
function generateResultsTable(processes) {
    resultsTableBody.innerHTML = '';
    const showPriority = priorityAlgorithms.includes(selectedAlgorithm);
    const showDeadline = deadlineAlgorithms.includes(selectedAlgorithm);
    
    processes.forEach(process => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${process.id}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td ${!showPriority ? 'style="display:none"' : ''}>${process.priority ?? '-'}</td>
            <td ${!showDeadline ? 'style="display:none"' : ''}>${process.deadline ?? '-'}</td>
            <td>${process.completionTime}</td>
            <td>${process.turnaroundTime}</td>
            <td>${process.waitingTime}</td>
        `;
        
        resultsTableBody.appendChild(row);
    });
}

// Calculate averages
function calculateAverages(processes) {
    const totalTurnaround = processes.reduce((sum, process) => sum + process.turnaroundTime, 0);
    const totalWaiting = processes.reduce((sum, process) => sum + process.waitingTime, 0);
    
    const avgTAT = (totalTurnaround / processes.length).toFixed(2);
    const avgWT = (totalWaiting / processes.length).toFixed(2);
    
    avgTurnaround.textContent = avgTAT;
    avgWaiting.textContent = avgWT;
}