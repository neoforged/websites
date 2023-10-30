const VERSIONS_ENDPOINT = 'https://maven.neoforged.net/api/maven/versions/releases/'
const FORGE_GAV = 'net/neoforged/neoforge'
const LEGACY_GAV = 'net/neoforged/forge'
const LATEST_ENDPOINT = 'https://maven.neoforged.net/api/maven/latest/version/releases/'
const DOWNLOAD_URL = 'https://maven.neoforged.net/releases'
//https://maven.neoforged.net/api/maven/latest/version/releases/net%2Fneoforged%2Fneoforge?filter=20.2
async function loadLatestVersions(minecraftVersions) {
    for (const mcVersion of minecraftVersions) {
	let gav;
	let fn;
	if (mcVersion.startsWith("1.20.1")) {
		gav = LEGACY_GAV;
                fn = "forge";
	} else {
		gav = FORGE_GAV;
                fn = "neoforge";
	}
        let currentMcVersionUrl = new URL(LATEST_ENDPOINT + encodeURIComponent(gav) + '?filter=' + encodeURIComponent(mcVersion));
        let versionJson;

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
            const vs = `#filelist${mcVersion}`.split('.').join("");
            const installerUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(version)}/${fn}-${encodeURIComponent(version)}-installer.jar`;
            const changelogUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(version)}/${fn}-${encodeURIComponent(version)}-changelog.txt`;
            document.querySelector(vs).innerHTML = `
                <div class="fileinfo__header">NeoForge ${version}</div>
                <div class="fileinfo__body">
                <a href="${installerUrl}"><span>Latest <em>NeoForge</em> Installer</span><span>${fn}-${version}-installer.jar</span></a>
                <a href="${changelogUrl}"><span>Latest Changelog</span><span>${version}</span></a>
                </div>
            `;
        }
    }
}
