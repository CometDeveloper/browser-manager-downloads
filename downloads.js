const repository = "CometDeveloper/browser-manager-downloads";
const statusElement = document.getElementById("release-status");

async function loadRelease() {
  try {
    const response = await fetch("./latest.json", { cache: "no-store", credentials: "omit" });
    if (!response.ok) throw new Error("Release unavailable");
    const manifest = await response.json();
    if (manifest.schema !== 1 || !/^\d+\.\d+\.\d+$/.test(manifest.version) || !Array.isArray(manifest.packages)) throw new Error("Invalid release");
    const version = manifest.version;
    const windows = manifest.packages.find(item => item.format === "nsis" && item.filename === `BrowserManager-Setup-${version}.exe`);
    const ubuntu = manifest.packages.find(item => item.format === "deb" && item.filename === `browser-manager_${version}_amd64.deb`);
    if (!windows || !ubuntu) throw new Error("Incomplete release");
    for (const [platform, item] of [["windows", windows], ["ubuntu", ubuntu]]) {
      const button = document.getElementById(`${platform}-download`);
      button.href = `https://github.com/${repository}/releases/download/v${version}/${encodeURIComponent(item.filename)}`;
      button.removeAttribute("aria-disabled");
      document.getElementById(`${platform}-size`).textContent = `Версія ${version} · ${(item.size / 1024 ** 2).toFixed(1)} МіБ · x64`;
    }
    document.getElementById("ubuntu-command").textContent = `sudo apt install ./browser-manager_${version}_amd64.deb`;
    document.getElementById("checksums").href = `https://github.com/${repository}/releases/download/v${version}/SHA256SUMS.txt`;
    statusElement.textContent = `Актуальна версія ${version}`;
  } catch {
    statusElement.textContent = "Завантаження з’являться після публікації першого релізу.";
  }
}

const platform = navigator.userAgent.toLowerCase();
document.getElementById(platform.includes("windows") ? "windows-card" : "ubuntu-card").classList.add("recommended");
void loadRelease();
