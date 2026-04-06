
// 🚫 Disable Right Click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// 🚫 Disable Key Shortcuts (Inspect, View Source, etc.)
document.addEventListener('keydown', function(e) {

    // Block F12
    if (e.key === "F12") {
        e.preventDefault();
    }

    // Block Ctrl+Shift+I (Inspect)
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
    }

    // Block Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
    }

    // Block Ctrl+U (View Source)
    if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
    }

    // Block Ctrl+S (Save Page)
    if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
    }
});

// 🚫 Detect DevTools Open
setInterval(function() {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;

    if (widthThreshold || heightThreshold) {
        document.body.innerHTML = "<h1>Access Denied</h1>";
    }
}, 1000);

// 🚫 Disable Text Selection
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});

// 🚫 Disable Dragging
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
});

// 🚫 Block Copy
document.addEventListener('copy', function(e) {
    e.preventDefault();
});

// 🚫 Block Cut
document.addEventListener('cut', function(e) {
    e.preventDefault();
});

// 🚫 Block Paste
document.addEventListener('paste', function(e) {
    e.preventDefault();
});
// Disable right-click
document.addEventListener("contextmenu", e => e.preventDefault());

// Block common shortcuts
document.onkeydown = function(e) {
    if (
        e.key === "F12" || 
        (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "u")
    ) {
        return false;
    }
};

// Clear page if DevTools opens
setInterval(() => {
    if (window.outerWidth - window.innerWidth > 150 ||
        window.outerHeight - window.innerHeight > 150) {
        document.body.innerHTML = "<h1>Access Denied</h1>";
    }
}, 1000);

