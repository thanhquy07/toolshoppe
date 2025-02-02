document.getElementById("runCode").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "clickRun" });
});
