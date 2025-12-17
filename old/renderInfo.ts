import { NS } from "@ns";

export async function main(ns: NS) {
  // Create a custom tail window
  const doc = eval("document");
  const hook0 = doc.getElementById("overview-extra-hook-0");
  const hook1 = doc.getElementById("overview-extra-hook-1");

  // Function to update the tail window content
  function updateTailWindow() {
    // Clear previous content
    hook0.innerHTML = "";
    hook1.innerHTML = "";

    // Add custom information
    hook0.innerHTML = `<div>Player Money: $${ns
      .getPlayer()
      .money.toLocaleString()}</div>`;
    hook1.innerHTML = `<div>Hacking Level: ${
      ns.getPlayer().skills.hacking
    }</div>`;
  }

  // Initial update
  updateTailWindow();

  // Optional: Set up periodic updates
  const updateInterval = setInterval(updateTailWindow, 1000);

  // Keep the script running
  while (true) {
    await ns.sleep(1000);
  }
}

// Helper function to create a more advanced custom tail window
export function createAdvancedTailWindow(ns: NS) {
  const doc = eval("document");
  const tailWindow = doc.createElement("div");
  tailWindow.style.position = "fixed";
  tailWindow.style.top = "10px";
  tailWindow.style.right = "10px";
  tailWindow.style.width = "250px";
  tailWindow.style.backgroundColor = "rgba(0,0,0,0.7)";
  tailWindow.style.color = "white";
  tailWindow.style.padding = "10px";
  tailWindow.style.borderRadius = "5px";

  // Create content sections
  tailWindow.innerHTML = `
      <h3>Custom Bitburner Stats</h3>
      <div id="money-display">Money: loading...</div>
      <div id="hack-display">Hacking: loading...</div>
      <div id="servers-display">Servers: loading...</div>
  `;

  // Append to document
  doc.body.appendChild(tailWindow);

  // Update function
  function updateCustomTail() {
    const moneyDisplay = doc.getElementById("money-display");
    const hackDisplay = doc.getElementById("hack-display");
    const serversDisplay = doc.getElementById("servers-display");

    if (moneyDisplay)
      moneyDisplay.textContent = `Money: $${ns
        .getPlayer()
        .money.toLocaleString()}`;
    if (hackDisplay)
      hackDisplay.textContent = `Hacking: ${ns.getPlayer().skills.hacking}`;
    if (serversDisplay)
      serversDisplay.textContent = `Servers: ${
        ns.getPlayer().numPurchasedServers
      }`;
  }

  // Set up periodic updates
  const updateInterval = setInterval(updateCustomTail, 1000);

  // Return a function to stop updates if needed
  return () => clearInterval(updateInterval);
}
