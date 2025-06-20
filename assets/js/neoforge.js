const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/"
const FORGE_GAV = "net/neoforged/neoforge"
const LEGACY_GAV = "net/neoforged/forge"
const LATEST_ENDPOINT = "https://maven.neoforged.net/api/maven/latest/version/releases/"
const DOWNLOAD_URL = "https://maven.neoforged.net/releases"
// For the latest version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge
// For legacy version(s): https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/forge?filter=1.20.1
// To filter a specific MC version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge?filter=20.4

async function loadLatestVersions(minecraftVersions) {
    for (const mcVersion of minecraftVersions) {
        let gav = FORGE_GAV;
        let fn = "neoforge";
        let mcvers;
        let dropDown_VAL = ` open="open"`;
        let badges_beta = "";
        let badges_new = "";
        let badges_legacy = "";
        let changelogUrl = "/changelog";

        let currentMcVersionUrl = new URL(LATEST_ENDPOINT + encodeURIComponent(gav));
        let versionJson;

        try {
            const response = await fetch(currentMcVersionUrl);
            versionJson = await response.json();
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.log("There was a SyntaxError parsing the JSON response from the maven server.", error);
            } else {
                console.log("There was an error processing the request for a new version.", error);
            }
        }

        if (versionJson) {
            const {version} = versionJson;
            if (mcVersion == "latest") {
                mcvers = "1." + version.slice(0, 4);
            }
            if (version.includes("beta")) {
                badges_beta = `<font class="badges badges_beta">BETA</font>`;
            }

            const vs = `#filelist${mcVersion}`.split(".").join("");
            const installerUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(version)}/${fn}-${encodeURIComponent(version)}-installer.jar`;

            document.querySelector(vs).innerHTML = `
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

            document.querySelector("projectlinkdetails").open = true;
        }
    }
}
