const CLOUD_URL = "https://josh-backend-om8q.onrender.com";
async function getFromServer() {
  try {
    const response = await fetch(`${CLOUD_URL}/load`);
        const data = await response.json();
        document.getElementById('userMsg').value = data.message || "";
    } catch (err) {
        console.error("Server is still waking up...", err);
    }
}

async function saveToServer() {
    const text = document.getElementById('userMsg').value;
    await fetch(`${CLOUD_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    });
    alert("Saved to server");
}
