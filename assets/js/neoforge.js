const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/"
const FORGE_GAV = "net/neoforged/neoforge"
const LATEST_ENDPOINT = "https://maven.neoforged.net/api/maven/latest/version/releases/"
const DOWNLOAD_URL = "https://maven.neoforged.net/releases"

async function loadInstaller() {
    const versions = await fetchMinecraftVersions();
    const select = document.getElementById("mcVersionSelect");

    select.innerHTML = versions.map(v => `<option value="${v}">${v}</option>`).join("");

    showInstaller(versions[0]);

    select.addEventListener("change", () => {
        const selectedVersion = select.value;
        showInstaller(selectedVersion);
    });
}

async function fetchMinecraftVersions() {
    const result = await fetch(
        "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
    );
    const json = await result.json();
    const versions = [];

    for (const entry of json.versions) {
        if (entry.type !== "release") continue;

        versions.push(entry.id);
        if (entry.id === "1.20.4") break; // We don't support releases older than 1.20.4.
    }

    return versions;
}

async function showInstaller(mcVersion) {
    let badges_beta = "";
    let badges_new = ""
    let badges_legacy = "";

    const currentMcVersionUrl = new URL(LATEST_ENDPOINT + encodeURIComponent(FORGE_GAV));
    const mcParts = mcVersion.split(".");
    const filterVersion = `${mcParts[1]}.${mcParts[2] || "0"}`;
    currentMcVersionUrl.searchParams.set("filter", filterVersion);

    try {
        const response = await fetch(currentMcVersionUrl);
        const versionJson = await response.json();

        const { version } = versionJson;

        if (version.includes("beta")) {
            badges_beta = `<font class="badges badges_beta">BETA</font>`;
        }

        const installerUrl = `${DOWNLOAD_URL}/${FORGE_GAV}/${version}/neoforge-${version}-installer.jar`;

        const mcVersions = await fetchMinecraftVersions();
        let changelogUrl = `${DOWNLOAD_URL}/${FORGE_GAV}/${version}/neoforge-${version}-changelog.txt`;
        if (parseFloat(filterVersion) > 21.3) changelogUrl = "/changelog";

        document.getElementById("filelist").innerHTML = `
            <details open="open">
                <summary class="fileinfo__header">${badges_beta} ${badges_new} ${badges_legacy} NeoForge <code>${version}</code> for Minecraft ${mcVersion}</summary>
                <div class="fileinfo__body">
                    <a href="${installerUrl}">
                        <span class="fileinfo__icon">
                            <i class="bi-file-earmark-zip-fill" style="font-size: 2rem;"></i>
                        </span>
                        <span class="fileinfo__content">
                            <span>Latest <em>NeoForge</em> Installer</span>
                            <span class="installer-version">neoforge-${version}-installer.jar</span>
                        </span>
                    </a>
                    <a href="${changelogUrl}">
                        <span class="fileinfo__icon">
                            <i class="bi-file-earmark-text-fill" style="font-size: 2rem;"></i>
                        </span>
                        <span class="fileinfo__content">
                            <span>Latest Changelog</span>
                            <span>${version}</span>
                        </span>
                    </a>
                </div>
            </details>
        `;

    } catch (e) {
        document.getElementById("fileList").innerHTML = `<p>Failed to fetch installer for <code>${mcVersion}</code></p>`;
        console.error("Failed to fetch installer:", e);
    }
}
