const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/"
const NEOFORGE_GAV = "net/neoforged/neoforge"
const LEGACY_GAV = "net/neoforged/forge"
const LATEST_ENDPOINT = "https://maven.neoforged.net/api/maven/latest/version/releases/"
const DOWNLOAD_URL = "https://maven.neoforged.net/releases"
// For the latest version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge
// For legacy version(s): https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/forge?filter=1.20.1
// To filter a specific MC version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge?filter=20.4

function removeAllOptions(selectElement) {
   let i;
   let length = selectElement.options.length - 1
   for(i = length; i >= 0; i--) {
      selectElement.remove(i);
   }
}

function setLinks(neoforgeVersion) {
    const neoforgeDropdown = document.getElementById("neoforgeversions");
    const latestNeoforgeVersion = neoforgeDropdown.options[0].value;
    const selectedMinecraftVersion = "1." + neoforgeVersion.slice(0, 4);

    const installerUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(neoforgeVersion)}/neoforge-${encodeURIComponent(neoforgeVersion)}-installer.jar`;
    let changelogUrl = "/changelog";
    if (neoforgeVersion != latestNeoforgeVersion) {
        changelogUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(neoforgeVersion)}/neoforge-${encodeURIComponent(neoforgeVersion)}-changelog.txt`;
    }

    const installerLink = document.getElementById("installerlink");
    installerLink.href = installerUrl;
    installerLink.innerHTML = `<span>Click Here to Download:&nbsp;<br><span class="normal__font__weight">neoforge-${selectedMinecraftVersion}-${neoforgeVersion}-installer.jar</span></span>`;
    
    document.getElementById("changeloglink").href = changelogUrl;
}

function minecraftValueChanged(selectedMinecraftVersion) {
    var neoforgeVersionPrefixForCurrentMinecraft = selectedMinecraftVersion.slice(2, 6);

    const allNeoforgeVersionDropdown = document.getElementById("allneoforgeversions");
    const neoforgeDropdown = document.getElementById("neoforgeversions");

    // Nuke all options as we will re-add the new eligible versions
    removeAllOptions(neoforgeDropdown);
    
    let newestNeoforgeForCurrentMinecraft = undefined;
    for (var index = 0; index < allNeoforgeVersionDropdown.options.length; index++) {
        const option = allNeoforgeVersionDropdown.options[index];
        const neoforgeVersion = option.value;

        // Skip versions that are not eligible for current minecraft version
        if (!neoforgeVersion.startsWith(neoforgeVersionPrefixForCurrentMinecraft)) {
            continue;
        }

        var neoforgeVersionOption = document.createElement('option');
        neoforgeVersionOption.value = neoforgeVersion;
        neoforgeVersionOption.innerHTML = neoforgeVersion;
        if (newestNeoforgeForCurrentMinecraft == undefined) {
            newestNeoforgeForCurrentMinecraft = neoforgeVersion;
            neoforgeVersionOption.selected = true;
        }

        neoforgeDropdown.appendChild(neoforgeVersionOption);
    }

    setLinks(newestNeoforgeForCurrentMinecraft);
}

function neoforgeValueChanged(selectedNeoforgeVersions) {
    setLinks(selectedNeoforgeVersions);
}

async function loadVersions() {
    let allVersionUrl = new URL(VERSIONS_ENDPOINT + encodeURIComponent(NEOFORGE_GAV));
    let neoforgeVersionsJson;
    try {
        const response = await fetch(allVersionUrl);
        neoforgeVersionsJson = await response.json();
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.log("There was a SyntaxError parsing the JSON response from the maven server.", error);
        } else {
            console.log("There was an error processing the request for a new version.", error);
        }
    }

    if (neoforgeVersionsJson) {
        const {versions} = neoforgeVersionsJson;
        const minecraftVersions = new Set([]);
        for (const neoforgeVersion of versions) {
            if (!neoforgeVersion.startsWith("0")) { // Skip 0.25w14craftmine and other april fools versions
                minecraftVersions.add("1." + neoforgeVersion.slice(0, 4)); // Grab the Minecraft version from the NeoForge versions
            }
        }
        // Sorts the mc versions so newest is topmost. Done because we used a set to prevent duplicate minecraft versions quickly.
        const sortedMinecraftVersion = Array.from(minecraftVersions).sort(function (a,b) {
            return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
        });
        
        const latestNeoForgeVersion = versions[versions.length - 1];
        const latestMinecraftVersion = sortedMinecraftVersion[0];
        const latestInstallerUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(latestNeoForgeVersion)}/neoforge-${encodeURIComponent(latestNeoForgeVersion)}-installer.jar`;
        const latestChangelogUrl = "/changelog";
        document.getElementById("filelist").innerHTML = `
            <div class="fileinfo__body">
                <div class="selection_row">
                    <div class="selection_block" id="minecraftversionscontainer">
                        <label for="minecraftversions">Minecraft Version:&nbsp;</label>
                    </div>
                    <div class="selection_block"id="neoforgeversionscontainer">
                        <label for="neoforgeversions">NeoForge Version:&nbsp;</label>
                    </div>
                </div>
                <div class="download_row">
                    <a id="installerlink" href="${latestInstallerUrl}"><span>Click Here to Download:&nbsp;<br><span class="normal__font__weight">neoforge-${latestMinecraftVersion}-${latestNeoForgeVersion}-installer.jar</span></span></a>
                    <a id="changeloglink" href="${latestChangelogUrl}"><span>See changelog</span></a>
                </div>
            </div>
        `;

        
        // Creates the select element for Minecraft versions
        var minecraftVersionSelect = document.createElement('select');
        minecraftVersionSelect.name = 'Minecraft Versions';
        minecraftVersionSelect.id = 'minecraftversions';
        minecraftVersionSelect.onchange = function(){minecraftValueChanged(this.value);};
        let firstOption = true;
        sortedMinecraftVersion.forEach(function(minecraftVersion) {

            var minecraftVersionOption = document.createElement('option');
            minecraftVersionOption.value = minecraftVersion;
            minecraftVersionOption.innerHTML = minecraftVersion;
            if (firstOption) {
                minecraftVersionOption.selected = true;
            }
            minecraftVersionSelect.appendChild(minecraftVersionOption);

            firstOption = false;
        });
        document.getElementById("minecraftversionscontainer").appendChild(minecraftVersionSelect);

        // Creates the hidden select element for holding all neoforge versions.
        // We need to do this because Safari will show hidden/disabled option elements. Thus this workaround
        var allNeoforgeVersionSelect = document.createElement('select');
        allNeoforgeVersionSelect.id = 'allneoforgeversions';
        allNeoforgeVersionSelect.hidden = true;
        allNeoforgeVersionSelect.disabled = true;
        allNeoforgeVersionSelect.style.display = 'none';
        // Versions url always gives list of versions from oldest to newest (exception of april fools versions which we will skip)
        // So iterating backwards will let us have newest be first option in dropdown.
        for (let index = versions.length - 1; index >= 0; index--) {   
            const neoforgeVersion = versions[index];
            if (!neoforgeVersion.startsWith("0")) { // Skip 0.25w14craftmine and other april fools versions
                var neoforgeVersionOption = document.createElement('option');
                neoforgeVersionOption.value = neoforgeVersion;
                neoforgeVersionOption.innerHTML = neoforgeVersion;
                if (index == 0) {
                    neoforgeVersionOption.selected = true;
                }
                allNeoforgeVersionSelect.appendChild(neoforgeVersionOption);
            }
        }
        document.querySelector(".fileinfo__body").appendChild(allNeoforgeVersionSelect);
        
        // Creates the select element for NeoForge versions
        var neoforgeVersionSelect = document.createElement('select');
        neoforgeVersionSelect.name = 'NeoForge Versions';
        neoforgeVersionSelect.id = 'neoforgeversions';
        neoforgeVersionSelect.onchange = function(){neoforgeValueChanged(this.value);};
        var neoforgeVersionPrefixForCurrentMinecraft = latestNeoForgeVersion.slice(0, 4);
        // Versions url always gives list of versions from oldest to newest (exception of april fools versions which we will skip)
        // So iterating backwards will let us have newest be first option in dropdown.
        for (let index = versions.length - 1; index >= 0; index--) {   
            const neoforgeVersion = versions[index];
             // Only get the neoforge versions for current minecraft version
            if (!neoforgeVersion.startsWith("0") && neoforgeVersion.startsWith(neoforgeVersionPrefixForCurrentMinecraft)) {
                var neoforgeVersionOption = document.createElement('option');
                neoforgeVersionOption.value = neoforgeVersion;
                neoforgeVersionOption.innerHTML = neoforgeVersion;
                if (index == 0) {
                    neoforgeVersionOption.selected = true;
                }
                neoforgeVersionSelect.appendChild(neoforgeVersionOption);
            }
        }
        document.getElementById("neoforgeversionscontainer").appendChild(neoforgeVersionSelect);
    }
}