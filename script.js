// DOM Elements
const appPage = document.getElementById('appPage');
const logoutBtn = document.getElementById('logoutBtn');
const algorithmCards = document.querySelectorAll('.algorithm-card');
const timeQuantumSection = document.getElementById('timeQuantumSection');
const priorityHeader = document.getElementById('priorityHeader');
const resultsPriorityHeader = document.getElementById('resultsPriorityHeader');
const processTableBody = document.getElementById('processTableBody');
const resultsSection = document.getElementById('resultsSection');
const ganttContainer = document.getElementById('ganttContainer');
const ganttTimeline = document.getElementById('ganttTimeline');
const resultsTableBody = document.getElementById('resultsTableBody');
const avgTurnaround = document.getElementById('avgTurnaround');
const avgWaiting = document.getElementById('avgWaiting');

// Current selected algorithm
let selectedAlgorithm = 'FCFS';

// Process management
let processCount = 2;

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
    // Set FCFS as default selected algorithm
    document.querySelector('.algorithm-card[data-algorithm="FCFS"]').classList.add('selected');
    
    // Add event listeners
    logoutBtn.addEventListener('click', handleLogout);
    
    algorithmCards.forEach(card => {
        card.addEventListener('click', handleAlgorithmSelection);
    });
    
    // Add pulse animation to app container
    appPage.classList.add('pulse');
    setTimeout(() => {
        appPage.classList.remove('pulse');
    }, 500);
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
    
    // Show/hide time quantum for Round Robin
    if (selectedAlgorithm === 'RoundRobin') {
        timeQuantumSection.style.display = 'block';
    } else {
        timeQuantumSection.style.display = 'none';
    }
    
    // Show/hide priority column for Priority scheduling
    if (selectedAlgorithm === 'Priority') {
        priorityHeader.style.display = 'table-cell';
        resultsPriorityHeader.style.display = 'table-cell';
        document.querySelectorAll('.priority-cell').forEach(cell => {
            cell.style.display = 'table-cell';
        });
    } else {
        priorityHeader.style.display = 'none';
        resultsPriorityHeader.style.display = 'none';
        document.querySelectorAll('.priority-cell').forEach(cell => {
            cell.style.display = 'none';
        });
    }
    
    // Reset results
    resultsSection.style.display = 'none';
}

// Process management functions
function addProcess() {
    processCount++;
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>P${processCount}</td>
        <td><input type="number" class="arrival-time" min="0" value="0"></td>
        <td><input type="number" class="burst-time" min="1" value="1"></td>
        <td class="priority-cell"><input type="number" class="priority" min="1" value="1"></td>
        <td><button class="delete-btn action-btn" onclick="deleteProcess(this)">Delete</button></td>
    `;
    processTableBody.appendChild(newRow);
    
    // Hide priority column if not needed
    if (selectedAlgorithm !== 'Priority') {
        newRow.querySelector('.priority-cell').style.display = 'none';
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
        const priority = selectedAlgorithm === 'Priority' ? 
            parseInt(row.querySelector('.priority').value) : null;
        
        processes.push({
            id: `P${index + 1}`,
            arrivalTime: arrivalTime,
            burstTime: burstTime,
            priority: priority,
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
        case 'RoundRobin':
            const timeQuantum = parseInt(document.getElementById('timeQuantum').value);
            schedule = calculateRoundRobin(processes, timeQuantum);
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

// Display results
function displayResults(schedule) {
    const { processes, ganttChart } = schedule;
    
    // Show results section
    resultsSection.style.display = 'block';
    
    // Generate Gantt chart
    generateGanttChart(ganttChart);
    
    // Generate results table
    generateResultsTable(processes);
    
    // Calculate and display averages
    calculateAverages(processes);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Generate Gantt chart
function generateGanttChart(ganttChart) {
    ganttContainer.innerHTML = '';
    ganttTimeline.innerHTML = '';
    
    if (ganttChart.length === 0) return;
    
    const totalTime = ganttChart[ganttChart.length - 1].end;
    const colors = ['#6e8efb', '#a777e3', '#51cf66', '#ff6b6b', '#ffa94d', '#20c997', '#e64980', '#7950f2'];
    
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
    
    processes.forEach(process => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${process.id}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td ${selectedAlgorithm !== 'Priority' ? 'style="display:none"' : ''}>${process.priority || '-'}</td>
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