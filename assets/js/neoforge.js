const VERSIONS_ENDPOINT =
  "https://maven.neoforged.net/api/maven/versions/releases/";
const FORGE_GAV = "net/neoforged/forge";
const LATEST_ENDPOINT =
  "https://maven.neoforged.net/api/maven/latest/version/releases/";
const DOWNLOAD_URL = "https://maven.neoforged.net/net/neoforged/forge";
//https://maven.neoforged.net/api/maven/latest/version/releases/net%2Fneoforged%2Fforge?filter=1.20.1
async function loadLatestVersions(minecraftVersions) {
  for (const mcVersion of minecraftVersions) {
    let currentMcVersionUrl = new URL(
      LATEST_ENDPOINT +
        encodeURIComponent(FORGE_GAV) +
        "?filter=" +
        encodeURIComponent(mcVersion)
    );
    let versionJson;

    try {
      const response = await fetch(currentMcVersionUrl);
      versionJson = await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.log(
          "There was a SyntaxError parsing the JSON response from the maven server.",
          error
        );
      } else {
        console.log(
          "There was an error processing the request for a new version.",
          error
        );
      }
    }

    if (versionJson) {
      const { version } = versionJson;

      const installerUrl = `${DOWNLOAD_URL}/${encodeURIComponent(
        version
      )}/forge-${encodeURIComponent(version)}-installer.jar`;
      const changelogUrl = `${DOWNLOAD_URL}/${encodeURIComponent(
        version
      )}/forge-${encodeURIComponent(version)}-changelog.txt`;
      document.querySelector("#filelist").innerHTML = `
            <div class="fileinfo">
            <div class="fileinfo__header">
              <i aria-hidden="true"></i><b>Download (Latest)</b><br />
              <small></small><br />
            </div>
            <div class="fileinfo__body">
              <div class="link link-boosted">
                <a href="${installerUrl}" title="Installer..."
                  ><svg class="installer_icon" height="128px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xml:space="preserve"><path d="M35 2H17a1 1 0 0 0-.707.293l-8 8A1 1 0 0 0 8 11v30c0 2.757 2.243 5 5 5h22c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5zm3 39c0 1.654-1.346 3-3 3H13c-1.654 0-3-1.346-3-3V11.414L17.414 4H35c1.654 0 3 1.346 3 3v34zM17 14h-5a1 1 0 1 1 0-2h5c.551 0 1-.448 1-1V6a1 1 0 1 1 2 0v5c0 1.654-1.346 3-3 3zm7 3c-4.962 0-9 4.037-9 9s4.038 9 9 9 9-4.037 9-9-4.038-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm3.707-6.707a1 1 0 0 1 0 1.414l-3 3a.997.997 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L23 27.586V22a1 1 0 1 1 2 0v5.586l1.293-1.293a1 1 0 0 1 1.414 0z" fill="#26303d" class="fill-000000"></path></svg>
                  <br /><span>Latest <em>NeoForge</em> Installer</span>
                  <p id="file-name">(neo)forge--installer.jar</p></a
                >
              </div>
              <div class="link">
                <a href="${changelogUrl}" title="Changelog..."
                  ><svg class="changelog_icon" height="64px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xml:space="preserve"><path d="M35 2H17a1 1 0 0 0-.707.293l-8 8A1 1 0 0 0 8 11v30c0 2.757 2.243 5 5 5h22c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5zm-7 2h4v13.936l-1.13-1.547a1.001 1.001 0 0 0-.798-.41c-.285.019-.614.144-.805.394L28 18.037V4zm10 37c0 1.654-1.346 3-3 3H13c-1.654 0-3-1.346-3-3V11.414L17.414 4H26v17a1 1 0 0 0 1.796.606l2.25-2.955 2.146 2.939A1.002 1.002 0 0 0 34 21V4h1c1.654 0 3 1.346 3 3v34zM20 6v5c0 1.654-1.346 3-3 3h-5a1 1 0 0 1 0-2h5c.551 0 1-.449 1-1V6a1 1 0 0 1 2 0z" fill="#26303d" class="fill-000000"></path></svg>
                  <br /><span>Latest Changelog</span><br /><span></span
                ></a>
              </div>
              <div class="link">
                <a
                  href="https://maven.neoforged.net/#/releases/net/neoforged/forge"
                  title="Older Versions..."
                  ><svg class="history_icon" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 0 0-6.88 2.77V3a1 1 0 0 0-2 0v4.5a1 1 0 0 0 1 1h4.5a1 1 0 0 0 0-2h-2.4A8 8 0 1 1 4 12a1 1 0 0 0-2 0A10 10 0 1 0 12 2Zm0 6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 0-2h-1V9a1 1 0 0 0-1-1Z" fill="#26303d" class="fill-6563ff"></path></svg>
                  <br /><span>Older Versions -></span></a
                >
              </div>
            </div>
          </div>
            `;
    }
  }
}
