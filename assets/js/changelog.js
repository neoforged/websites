const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/";
const LATEST_ENDPOINT = "https://maven.neoforged.net/api/maven/latest/version/releases/";
const DETAILS_ENDPOINT = "https://maven.neoforged.net/api/maven/details/releases/";
const DOWNLOAD_URL = "https://maven.neoforged.net/releases";
const GITHUB_URL = "https://github.com/neoforged/NeoForge";
const FORGE_GAV = "net/neoforged/neoforge";

async function loadChangelog() {
    const gav = FORGE_GAV;
    const fn = "neoforge";
    const vs = `.changelog_body`;
    let mcvers;

    const currentMcVersionUrl = LATEST_ENDPOINT + encodeURIComponent(gav);
    let versionJson;

    try {
        const response = await fetch(currentMcVersionUrl);
        
        if (!response.ok) {
            console.log("Latest version endpoint was not available");
            displayChangelogError();
            return;
        }
        
        versionJson = await response.json();
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.log("There was a SyntaxError parsing the JSON response from the maven server.", error);
        } else {
            console.log("There was an error processing the request for a new version.", error);
        }
    }

    if (versionJson) {
        let { version } = versionJson;
        mcvers = "1." + version.slice(0, 4);

        const changelogUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(version)}/${fn}-${encodeURIComponent(version)}-changelog.txt`;
        let response = await fetch(`${changelogUrl}`);
        const isSnapshot = version.includes("snapshot");
        const changelogs = [];

        if (response.ok) {
            changelogs.push(await response.text());
        }

        if (isSnapshot || !response.ok) {
            console.log(isSnapshot
                ? `Changelog for ${version} is a snapshot; searching previous snapshots...`
                : `No changelog for ${version}; searching previous versions...`);

            const detailsUrl = DETAILS_ENDPOINT + encodeURIComponent(gav);
            const detailsResponse = await fetch(detailsUrl);
            const detailsJson = await detailsResponse.json();

            if (detailsJson && detailsJson.files && Array.isArray(detailsJson.files)) {
                const directories = detailsJson.files.filter(item => item.type === "DIRECTORY").reverse();

                for (const dir of directories) {
                    const versionToTry = dir.name;
                    if (versionToTry === version) continue;

                    const tryChangelogUrl = `${DOWNLOAD_URL}/${gav}/${encodeURIComponent(versionToTry)}/${fn}-${encodeURIComponent(versionToTry)}-changelog.txt`;
                    try {
                        const tryResponse = await fetch(tryChangelogUrl);
                        if (tryResponse.ok) {
                            changelogs.push(await tryResponse.text());
                            console.log(`Found changelog in version: ${versionToTry}`);
                            if (!versionToTry.includes("snapshot")) break;
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }
        }
        
        if (changelogs.length === 0) {
            console.log("Could not find any available changelog");
            displayChangelogError();
            return;
        }
        
        const data = changelogs.join("\n").split("\n");

        const resultArray = [];

        data.forEach(line => {
            if (line.startsWith(" - ")) {
                const lineVersion = line.substring(line.indexOf("`") + 1, line.indexOf("`", line.indexOf("`") + 1));
                const installerUrl = `${DOWNLOAD_URL}/${gav}/${lineVersion}/${fn}-${lineVersion}-installer.jar`;
                line = line.replace("`" + lineVersion + "`", `<a href="${installerUrl}" class="changelog_version" title="Install ${lineVersion} for Minecraft ${mcvers}"><code>${lineVersion}</code></a>`);

                line = line.replace(" - ", `<li class="changelog_item">`);
                line += "</li>";

                const pr = line.substring(line.indexOf("(#") + 2, line.indexOf(")", line.indexOf("(#")));
                line = line.replace(`(#${pr})`, `<a class="pr-link" href="${GITHUB_URL}/pull/${pr}">(#${pr})</a>`);

                const mcBadgeText = line.substring(line.indexOf("[") + 1, line.indexOf("]", line.indexOf("[")));
                line = line.replace(`[${mcBadgeText}]`, `<font class="badges badges_mc">${mcBadgeText}</font>`);
            } else if (line !== "") {
                if (line !== "   ") {
                    line = "▸" + line;
                }

                line = `<li class="changelog_item_desc">` + line + `</li>`
                line = line.replace("Co-authored-by:", `<font class="badges badges_coauth">Co-authored-by</font>`)
            }

            line = line.replace(/`([^`]+)`/g, `<code>$1</code>`);

            if (line.includes("#")) {
                const startIndex = line.indexOf("#") + 1;
                let endIndex = line.indexOf(" ", startIndex);

                if (endIndex === -1) {
                    endIndex = line.length - 5; // exclude </li>
                }

                const issue = line.substring(startIndex, endIndex);
                if (!isNaN(issue)) {
                    line = line.replace(`#${issue}`, `<a href="${GITHUB_URL}/issues/${issue}">#${issue}</a>`);
                }
            }

            resultArray.push(line);
        });

        const result = resultArray.join("\n");

        document.querySelector(vs).innerHTML = `
        <h2><code>${encodeURIComponent(version)}</code> for Minecraft ${mcvers}</h2><hr>
        <div class="changelog">${result}</div>
        `;
    }
}

function displayChangelogError() {
    const vs = `.changelog_body`;
    document.querySelector(vs).innerHTML = `
    <h2>Changelog</h2><hr>
    <div class="changelog">
        <li class="changelog_item">The changelog could not be loaded</li>
    </div>
    `;
}
