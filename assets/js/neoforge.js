const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/"
const NEOFORGE_GAV = "net/neoforged/neoforge"
const LEGACY_GAV = "net/neoforged/forge"
const LATEST_ENDPOINT = "https://maven.neoforged.net/api/maven/latest/version/releases/"
const DOWNLOAD_URL = "https://maven.neoforged.net/releases"
// For the latest version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge
// For legacy version(s): https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/forge?filter=1.20.1
// To filter a specific MC version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge?filter=20.4

async function loadVersions() {
    let fn = "neoforge";
    let mcvers;
    let dropDown_VAL = ` open="open"`;
    let badges_beta = "";
    let badges_new = "";
    let badges_legacy = "";
    let changelogUrl = "/changelog";

    let allVersionUrl = new URL(VERSIONS_ENDPOINT + encodeURIComponent(NEOFORGE_GAV));
    let versionsJson;

    try {
        const response = await fetch(allVersionUrl);
        versionsJson = await response.json();
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.log("There was a SyntaxError parsing the JSON response from the maven server.", error);
        } else {
            console.log("There was an error processing the request for a new version.", error);
        }
    }

    if (versionsJson) {
        const {versions} = versionJson;
        if (mcVersion == "latest") {
            mcvers = "1." + version.slice(0, 4);
        }

        const vs = `filelist${mcVersion}`.split(".").join("");

        document.getElementById(vs).innerHTML = `
            <details${dropDown_VAL}>
            <summary class="fileinfo__header">${badges_beta} ${badges_new} ${badges_legacy} NeoForge <code>${version}</code> for Minecraft ${mcvers}</summary>
            <div class="fileinfo__body">
            <a href="${installerUrl}"><span class="fileinfo__icon"><i class="bi-file-earmark-zip-fill" style="font-size: 2rem;"></i></span>
            <span class="fileinfo__content"><span>Latest <em>NeoForge</em> Installer</span><span class="installer-version">${fn}-${version}-installer.jar</span></span></a>
            <a href="${changelogUrl}"><span class="fileinfo__icon"><i class="bi-file-earmark-text-fill" style="font-size: 2rem;"></i></span>
            <span class="fileinfo__content"><span>Latest Changelog</span><span>${version}</span></span></a>
            </div>
            </details>
        `;

        document.querySelector(vs).innerHTML = `
            <div class="fileinfo__body">
                <div class="selection_row">
                    <div class="selection_block">
                        <label for="minecraftversions">Minecraft Version:&nbsp;</label>
                        <select name="Minecraft Versions" id="minecraftversions" onchange="minecraftValueChanged(this.value)">
                            <option value="">Loading...</option>
                        </select>
                    </div>
                    <div class="selection_block">
                        <label for="neoforgeversions">NeoForge Version:&nbsp;</label>
                        <select name="Neoforge Versions" id="neoforgeversions" onchange="neoforgeValueChanged(this.value)">
                            <option value="">Loading...</option>
                        </select>
                    </div>
                </div>
                <div class="download_row">
                    <a id="installerlink" href="${installerUrl}><span>Click Here to Download:&nbsp;<br><span class="normal__font__weight">neoforge-0.00.00-00.00.00-installer.jar</span></span></a>
                    <a id="changeloglink" href="${changelogUrl}><span>See changelog</span></a>
                </div>
            </div>
        `;
    }
}

async function minecraftValueChanged(selectedMinecraftVersion) {

    const selectedMinecraftVersion = document.getElementById("minecraftversions").value;
    let allVersionUrl = new URL(VERSIONS_ENDPOINT + encodeURIComponent(NEOFORGE_GAV));

    let versionJson;
    try {
        const response = await fetch(allVersionUrl);
        versionJson = await response.json();
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.log("There was a SyntaxError parsing the JSON response from the maven server.", error);
        } else {
            console.log("There was an error processing the request for a new version.", error);
        }
    }

    const neoforgeDropdown = document.getElementById("neoforgeversions");
    //const selectedNeoforgeVersions = .value;

    setLinks(selectedNeoforgeVersions);
}

async function neoforgeValueChanged(selectedNeoforgeVersions) {
    setLinks(selectedNeoforgeVersions);
}

async function setLinks(neoforgeVersion) {
    const installerUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(neoforgeVersion)}/${fn}-${encodeURIComponent(neoforgeVersion)}-installer.jar`;
    const changelogUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(neoforgeVersion)}/${fn}-${encodeURIComponent(neoforgeVersion)}-changelog.txt`;

    document.getElementById("installerlink").href = installerUrl;
    document.getElementById("changeloglink").href = changelogUrl;
}