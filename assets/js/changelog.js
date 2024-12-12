const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/";
const FORGE_GAV = "net/neoforged/neoforge";
const LATEST_ENDPOINT = "https://maven.neoforged.net/api/maven/latest/version/releases/";
const DOWNLOAD_URL = "https://maven.neoforged.net/releases";
const GITHUB_URL = "https://github.com/neoforged/NeoForge";

async function loadChangelog() {
    let gav = FORGE_GAV;
    let fn = "neoforge";
    let mcvers;

    let currentMcVersionUrl = new URL(LATEST_ENDPOINT + encodeURIComponent(gav));
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
        const { version } = versionJson;
        mcvers = "1." + version.slice(0, 4);

        const vs = `.changelog_body`;
        const changelogUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(version)}/${fn}-${encodeURIComponent(version)}-changelog.txt`;
        const response = await fetch(`${changelogUrl}`);
        const data = (await response.text()).split("\n");

        const resultArray = [];

        data.forEach(line => {
            if (line.startsWith(" - ")) {
                line = line.replace(" - ", `<li class="changelog-item">`);
                line = line + "</li>";

                const lineVersion = line.substring(line.indexOf('`') + 1, line.indexOf('`', line.indexOf('`') + 1));
                line = line.replace("`" + lineVersion + "`", `<code>${lineVersion}</code>`);

                const pr = line.substring(line.indexOf("(#") + 2, line.indexOf(")", line.indexOf("(#")));
                line = line.replace(`(#${pr})`, `<a class="pr-link" href="${GITHUB_URL}/pull/${pr}">(#${pr})</a>`);

                const mcBadgeText = line.substring(line.indexOf("[") + 1, line.indexOf("]", line.indexOf("[")));
                line = line.replace(`[${mcBadgeText}]`, `<font class="badges badges_mc">${mcBadgeText}</font>`);
            } else {
                line = `<li class="changelog-item-desc">` + line + `</li>`
                line = line.replace("Co-authored-by:", `<font class="badges badges_coauth">Co-authored-by</font>`)
            }

            resultArray.push(line);
        });

        const result = resultArray.join("\n");

        document.querySelector(vs).innerHTML = `
        <h2>${encodeURIComponent(version)} for Minecraft ${mcvers}</h2><hr>
        <div class="changelog">${result}</div>
        `;
    }
}
