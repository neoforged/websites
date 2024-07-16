const VERSIONS_ENDPOINT =
  "https://maven.neoforged.net/api/maven/versions/releases/";
const LEGACY_GAV = "net/neoforged/forge";
const LATEST_ENDPOINT =
  "https://maven.neoforged.net/api/maven/latest/version/releases/";
const DOWNLOAD_URL = "https://maven.neoforged.net/releases";
async function loadChangelog() {
  let gav;
  let fn;
  let currentMcVersionUrl;
  let versionJson;
  let mcvers;
  gav = LEGACY_GAV;
  fn = "forge";
  currentMcVersionUrl = new URL(
    LATEST_ENDPOINT +
      encodeURIComponent(gav) +
      "?filter=1.20.1"
  );

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
    mcvers = "1.20.1";

    const vs = `.changelog_body`;
    const changelogUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(
      version
    )}/${fn}-${encodeURIComponent(version)}-changelog.txt`;
    const response = await fetch(`${changelogUrl}`);
    const data = await response.text();

    document.querySelector(vs).innerHTML = `
      <h2>${encodeURIComponent(version)} for Minecraft ${mcvers}</h2>
      <pre class="changelog">${data}</pre>
      `;
  }
}
