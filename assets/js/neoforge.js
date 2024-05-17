const VERSIONS_ENDPOINT = 'https://maven.neoforged.net/api/maven/versions/releases/'
const FORGE_GAV = 'net/neoforged/neoforge'
const LEGACY_GAV = 'net/neoforged/forge'
const LATEST_ENDPOINT = 'https://maven.neoforged.net/api/maven/latest/version/releases/'
const DOWNLOAD_URL = 'https://maven.neoforged.net/releases'
// For the latest version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge
// For legacy version(s): https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/forge
// To filter a specific MC version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge?filter=20.4
async function loadLatestVersions(minecraftVersions) {
    for (const mcVersion of minecraftVersions) {
        let gav;
        let fn;
        let mcvers;
        let dropDown_VAL;
        let badges_beta;
        let badges_new;
        let badges_legacy;
        if (mcVersion.startsWith("1.20.1")) {
            gav = LEGACY_GAV;
            fn = "forge";
            mcvers = "1.20.1";
            badges_new = "";
            badges_legacy = `<font class="badges badges_legacy">LEGACY</font>`;
            badges_beta = "";
            dropDown_VAL = "";
        } else {
            gav = FORGE_GAV;
            fn = "neoforge";
            badges_beta = "";
            badges_new = `<font class="badges badges_new">NEW</font>`;
            badges_legacy = "";
            dropDown_VAL = ` open="open"`;
        }

        let currentMcVersionUrl;
        let versionJson;
        if (mcvers == "1.20.1") {
            currentMcVersionUrl = new URL(LATEST_ENDPOINT + encodeURIComponent(gav) + '?filter=' + encodeURIComponent(mcVersion));
        } else {
            currentMcVersionUrl = new URL(LATEST_ENDPOINT + encodeURIComponent(gav));
        }

        try {
            const response = await fetch(currentMcVersionUrl);
            versionJson = await response.json();
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.log('There was a SyntaxError parsing the JSON response from the maven server.', error);
            } else {
                console.log('There was an error processing the request for a new version.', error);
            }
        }

        if (versionJson) {
            const {version} = versionJson;
            if (mcVersion == "latest") {
                mcvers = "1." + Array.from(version)[0] + Array.from(version)[1] + Array.from(version)[2] + Array.from(version)[3];
            }
            if (version.includes("beta")) {
                badges_beta = `<font class="badges badges_beta">BETA</font>`;
            }
            
            const vs = `#filelist${mcVersion}`.split('.').join("");
            const installerUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(version)}/${fn}-${encodeURIComponent(version)}-installer.jar`;
            const changelogUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(version)}/${fn}-${encodeURIComponent(version)}-changelog.txt`;
           
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
        }
    }
}
