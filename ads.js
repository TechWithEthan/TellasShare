// 🔥 Ads list (edit with your real ads)
const ads = [
    {
        img: "https://via.placeholder.com/300x200?text=Ad+1",
        link: "https://example.com",
        text: "🔥 Special Offer - Click Now!"
    },
    {
        img: "https://via.placeholder.com/300x200?text=Ad+2",
        link: "https://example2.com",
        text: "💰 Earn Money Online!"
    },
    {
        img: "https://via.placeholder.com/300x200?text=Ad+3",
        link: "https://example3.com",
        text: "🚀 Boost Your Business!"
    }
];

// Wait for page load
window.addEventListener("load", () => {

    const today = new Date().toDateString();
    const lastShown = localStorage.getItem("lastAdDate");

    // Show once per day
    if (lastShown !== today) {
        setTimeout(showAd, 3000); // delay 3 sec
        localStorage.setItem("lastAdDate", today);
    }

});

function showAd() {
    const ad = ads[Math.floor(Math.random() * ads.length)];

    // Create popup elements dynamically
    const popup = document.createElement("div");
    popup.style = `
        position:fixed;
        top:0; left:0;
        width:100%; height:100%;
        background:rgba(0,0,0,0.6);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:9999;
    `;

    const box = document.createElement("div");
    box.style = `
        background:#fff;
        padding:20px;
        border-radius:12px;
        text-align:center;
        width:300px;
        position:relative;
    `;

    const close = document.createElement("span");
    close.innerHTML = "×";
    close.style = `
        position:absolute;
        top:8px; right:10px;
        cursor:pointer;
        font-size:18px;
        font-weight:bold;
    `;
    close.onclick = () => document.body.removeChild(popup);

    const link = document.createElement("a");
    link.href = ad.link;
    link.target = "_blank";

    const img = document.createElement("img");
    img.src = ad.img;
    img.style = "width:100%; border-radius:10px;";

    const text = document.createElement("p");
    text.innerText = ad.text;

    link.appendChild(img);
    box.appendChild(close);
    box.appendChild(link);
    box.appendChild(text);
    popup.appendChild(box);

    document.body.appendChild(popup);
}