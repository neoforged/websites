const VERSIONS_ENDPOINT = 'https://maven.neoforged.net/api/maven/versions/releases/'
const FORGE_GAV = 'net/neoforged/forge'
const LATEST_ENDPOINT = 'https://maven.neoforged.net/api/maven/latest/version/releases/'
const DOWNLOAD_URL = 'https://maven.neoforged.net/net/neoforged/forge'
//https://maven.neoforged.net/api/maven/latest/version/releases/net%2Fneoforged%2Fforge?filter=1.20.1
async function loadLatestVersions(minecraftVersions) {
    for (const mcVersion of minecraftVersions) {
        let currentMcVersionUrl = new URL(LATEST_ENDPOINT + encodeURIComponent(FORGE_GAV) + '?filter=' + encodeURIComponent(mcVersion));
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
            
            const installerUrl = `${DOWNLOAD_URL}/${encodeURIComponent(version)}/forge-${encodeURIComponent(version)}-installer.jar`;
            const changelogUrl = `${DOWNLOAD_URL}/${encodeURIComponent(version)}/forge-${encodeURIComponent(version)}-changelog.txt`;
            document.querySelector("#filelist").innerHTML = `
                <a href="${installerUrl}">Latest <em>NeoForge</em> Installer - neoforge-${version}-installer.jar</a>

                <a href="${changelogUrl}">Latest Changelog (${version})</a>
            `;
        }
    }
}
