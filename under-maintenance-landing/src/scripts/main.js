const outputElement = document.getElementById('output');
const inputElement = document.getElementById('command-input');
const terminalBody = document.getElementById('terminal-body');

const history = [];
let historyIndex = -1;

const bootLines = [
    "booting cv-engineer stack...",
    "loading creative modules...",
    "warming up terminal interface...",
    "status: under construction",
    "tip: type 'help' for commands"
];

const commands = {
    help: () => [
        "Available commands:",
        "about   - portfolio status",
        "status  - build checklist",
        "time    - local time",
        "theme   - toggle theme",
        "clear   - clear terminal",
        "ping    - run diagnostics"
    ],
    about: () => "CV Engineer Under Construction. Portfolio refit in progress.",
    status: () => [
        "Active tasks:",
        "[done] UI wireframes",
        "[live] case study refresh",
        "[next] launch new demos"
    ],
    time: () => new Date().toLocaleString(),
    theme: () => {
        document.body.classList.toggle("theme-teal");
        return "Theme toggled.";
    },
    clear: () => {
        outputElement.innerHTML = "";
        return null;
    },
    ping: () => [
        "diagnostics:",
        "- latency: 4ms",
        "- build queue: stable",
        "- coffee: high"
    ]
};

const addLine = (text, className = "line") => {
    const line = document.createElement("div");
    line.className = className;
    line.textContent = text;
    outputElement.appendChild(line);
    outputElement.scrollTop = outputElement.scrollHeight;
};

const addLines = (lines, className) => {
    lines.forEach((line) => addLine(line, className));
};

const addPromptLine = (command) => {
    addLine(`visitor@cv-engineer $ ${command}`, "line command");
};

const runCommand = (command) => {
    const trimmed = command.trim();
    if (!trimmed) {
        return;
    }

    addPromptLine(trimmed);
    const key = trimmed.toLowerCase();
    const handler = commands[key];

    if (!handler) {
        addLine(`command not found: ${trimmed}`, "line muted");
        return;
    }

    const result = handler();
    if (Array.isArray(result)) {
        addLines(result, "line");
    } else if (typeof result === "string") {
        addLine(result, "line");
    }
};

const typeBootLines = async () => {
    for (const line of bootLines) {
        await new Promise((resolve) => setTimeout(resolve, 220));
        addLine(line, "line");
    }
};

inputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const command = inputElement.value;
        history.push(command);
        historyIndex = history.length;
        runCommand(command);
        inputElement.value = "";
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        if (history.length) {
            historyIndex = Math.max(0, historyIndex - 1);
            inputElement.value = history[historyIndex] || "";
        }
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (history.length) {
            historyIndex = Math.min(history.length, historyIndex + 1);
            inputElement.value = history[historyIndex] || "";
        }
    }
});

terminalBody.addEventListener("click", () => {
    inputElement.focus();
});

typeBootLines();
inputElement.focus();