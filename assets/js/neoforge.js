const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/"
const FALLBACK_VERSIONS_ENDPOINT = "https://maven.creeperhost.net/api/maven/versions/releases/"
const NEOFORGE_GAV = "net/neoforged/neoforge"
const LEGACY_GAV = "net/neoforged/forge"
const LATEST_ENDPOINT = "https://maven.neoforged.net/api/maven/latest/version/releases/"
const DOWNLOAD_URL = "https://maven.neoforged.net/releases"
// For the latest version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge
// For legacy version(s): https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/forge?filter=1.20.1
// To filter a specific MC version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge?filter=20.4

// Cache all neoforge versions in javascript variable.
// This does persist as long as page stays loaded.
const allNeoforgeVersions = new Map();
let latestNeoForgeVersion = undefined;
let isInFallbackMode = false;

// Use JQuery to replace select element with select2 element that we can actually style ourselves.
// Documentation: https://select2.org/getting-started/basic-usage
$(document).ready(function() {
    $('.select2-mode').select2();
});

// Runs once at page load to create the dropdowns with latest Minecraft and latest NeoForge version selected by default.
async function loadVersions() {
    // Reminder, this endpoint will return all NeoForge versions with April Fools versions first, then oldest to newest versions afterwards.
    const allVersionUrl = new URL(VERSIONS_ENDPOINT + encodeURIComponent(NEOFORGE_GAV));
    let neoforgeVersionsJson;
    try {
        const response = await fetch(allVersionUrl);
        neoforgeVersionsJson = await response.json();
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.log("There was a SyntaxError parsing the JSON response from the maven server.", error);
        } else {
            console.log("There was an error processing the request for a new version from the maven server.", error);
        }

        // Main maven is down. We will use fallback URL to get NeoForge installers. Permission was granted by CreeperHost to do this.
        const fallbackAllVersionUrl = new URL(FALLBACK_VERSIONS_ENDPOINT + encodeURIComponent(NEOFORGE_GAV));
        try {
            const response = await fetch(fallbackAllVersionUrl);
            neoforgeVersionsJson = await response.json();
            isInFallbackMode = true;
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.log("There was a SyntaxError parsing the JSON response from the fallback maven server.", error);
                setVersionFetchErrorState();
            } else {
                console.log("There was an error processing the request for a new version from the fallback maven server.", error);
                setVersionFetchErrorState();
            }
        }
    }

    if (neoforgeVersionsJson) {
        // Extract all NeoForge versions.
        const {versions} = neoforgeVersionsJson;

        // Using a set to prevent duplicate minecraft versions quickly as we extract the Minecraft versions from the NeoForge versions.
        const minecraftVersions = new Set([]);
        let latestMinecraftVersion = undefined;

        // Versions url always gives list of versions from oldest to newest (exception of april fools versions)
        // So iterating backwards will let us have newest be first option
        for (let index = versions.length - 1; index >= 0; index--) {
            const neoVersion = versions[index];
            const mcVersion = getMcVersionFromNeoForgeVersion(neoVersion);

            // Remove 0.25w14craftmine and other april fools versions
            if (neoVersion.startsWith("0")) continue;

            // Set the versions if not already set (only for non-alpha versions, as to not promote snapshots by default)
            if (!neoVersion.includes("-alpha")) {
                if (latestNeoForgeVersion === undefined) latestNeoForgeVersion = neoVersion;
                if (latestMinecraftVersion === undefined) latestMinecraftVersion = mcVersion;
            }

            // Get and push version lists
            let neoVersionList = undefined;
            if (!allNeoforgeVersions.has(mcVersion)) {
                minecraftVersions.add(mcVersion);
                neoVersionList = [];
                allNeoforgeVersions.set(mcVersion, neoVersionList);
            } else {
                neoVersionList = allNeoforgeVersions.get(mcVersion);
            }
            neoVersionList.push(neoVersion);            
        }
        
        // Sorts the mc versions so newest is topmost. We can't sort a set so convert to array first.
        const sortedMinecraftVersion = Array.from(minecraftVersions).sort(function (a,b) {
            return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
        });

        const latestInstallerUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(latestNeoForgeVersion)}/neoforge-${encodeURIComponent(latestNeoForgeVersion)}-installer.jar`;
        const latestChangelogUrl = "/changelog"; // This URL is the latest version's changelog on site. Always kept up to date automatically.
        let installerBoxHtml = `
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
                    <a id="installerlink" href="${latestInstallerUrl}"><span>Click Here to Download Installer</span></span></a>
                    <a id="changeloglink" href="${latestChangelogUrl}"><span>See changelog</span></a>
                </div>
            </div>
        `;

        if (isInFallbackMode) {
            installerBoxHtml += `
                <div class="fallback__instructions">
                    <span class="inlined">NeoForge Maven is temporarily offline.</span>
                    <span class="inlined">Run the installer with this command:</span>
                    <br/><span id="fallbackInstructions"><code>java -jar neoforge-${latestNeoForgeVersion}-installer.jar --mirror https://maven.creeperhost.net</code></span>
                </div>
            `
        }

        document.getElementById("filelist").innerHTML = installerBoxHtml;
        
        // Creates the select element for Minecraft versions
        createAndPopulateSelectElement('Minecraft Versions', 'minecraftversions', minecraftValueChanged, sortedMinecraftVersion, "minecraftversionscontainer");
       
        // Creates the select element with NeoForge versions that are for the latest Minecraft version initially
        createAndPopulateSelectElement('NeoForge Versions', 'neoforgeversions', neoforgeValueChanged, allNeoforgeVersions.get(latestMinecraftVersion), "neoforgeversionscontainer");
    }
}

function setVersionFetchErrorState() {
    const minecraftVersionDropdown = document.getElementById("minecraftversions");
    const option1 = document.createElement('option');
    option1.value = "";
    option1.innerHTML = "Error";
    minecraftVersionDropdown.innerHTML = ``;
    minecraftVersionDropdown.appendChild(option1);

    const neoforgeVersionDropdown = document.getElementById("neoforgeversions");
    const option2 = document.createElement('option');
    option2.value = "";
    option2.innerHTML = "Error";
    neoforgeVersionDropdown.innerHTML = ``;
    neoforgeVersionDropdown.appendChild(option2);

    document.getElementById("installerlink").innerHTML = `<span>Unable to fetch version data</span>`;
    document.getElementById("installerlink").innerHTML = `<span>Unable to fetch version data</span>`;
    document.getElementById("changeloglink").innerHTML = `<span>Unable to fetch version data</span>`;
}

// Handles ensuring that the installer download and changelog links matches what the dropdown selections are.
// Call this on dropdown value change.
function setLinks(neoforgeVersion) {
    const installerUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(neoforgeVersion)}/neoforge-${encodeURIComponent(neoforgeVersion)}-installer.jar`;
    const installerLink = document.getElementById("installerlink");
    installerLink.href = installerUrl;
    installerLink.innerHTML = `<span>Click Here to Download Installer</span>`;
    
    // The latest changelog exists on the website at /changelog so we use that when latest NeoForge is selected.
    // Otherwise use the maven changelog text file link.
    let changelogUrl = "/changelog";
    if (neoforgeVersion != latestNeoForgeVersion) {
        changelogUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(neoforgeVersion)}/neoforge-${encodeURIComponent(neoforgeVersion)}-changelog.txt`;
    }
    document.getElementById("changeloglink").href = changelogUrl;
    
    if (isInFallbackMode) {
        document.getElementById("fallbackInstructions").innerHTML = `<code>java -jar neoforge-${neoforgeVersion}-installer.jar --mirror https://maven.creeperhost.net</code>`;
    }
}

function minecraftValueChanged(selectedMinecraftVersion) {
    const neoforgeDropdown = document.getElementById("neoforgeversions");

    // Nuke all NeoForge version options as we will re-add the new eligible versions
    removeAllOptions(neoforgeDropdown);
    
    // Get version list for minecraft version
    const neoVersionList = allNeoforgeVersions.get(selectedMinecraftVersion);
    
    let newestNeoforgeForCurrentMinecraft = undefined;
    for (let index = 0; index < neoVersionList.length; index++) {
        const neoforgeVersion = neoVersionList[index];

        const neoforgeVersionOption = document.createElement('option');
        neoforgeVersionOption.value = neoforgeVersion;
        neoforgeVersionOption.innerHTML = neoforgeVersion;

        // Since allNeoforgeVersions is sorted by newest to oldest,
        // we want to find the NeoForge version that is the newest one for this new Minecraft version and have it selected. 
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

function getMcVersionFromNeoForgeVersion(versionString) {
    const spl = versionString.split('.');
    // Handle the new versioning scheme first
    if (parseInt(spl[0]) >= 26) {
        // 26.1.0.X -> 26.1
        var mcVersion = spl[0] + '.' + spl[1];
        // 26.1.1.X -> 26.1.1
        if (spl[2] != '0') {
            mcVersion += '.' + spl[2];
        }

        // 26.1.0.0-alpha+snapshot-1
        const splitBySnapshotIdentifier = versionString.split('+');
        if (splitBySnapshotIdentifier.length == 2) {
            mcVersion += '-' + splitBySnapshotIdentifier[1];
        }
        return mcVersion;
    }
    return "1." + getFirstTwoVersionNumbers(versionString);
}

// Split on first period and use everything afterwards.
// So 1.21.1 becomes 21.1 which is the prefix for NeoForge versions on that Minecraft version.
function getLastTwoVersionNumbers(versionString) {
    return versionString.substring(versionString.indexOf('.') + 1);
}

// Split on periods and use only the first two version numbers
// So 21.1.29 becomes 21.1 which is the prefix for NeoForge versions on that Minecraft version.
function getFirstTwoVersionNumbers(versionString) {
    let splitVersion = versionString.split('.');
    return `${splitVersion[0]}.${splitVersion[1]}`;
}

// Used for clearing the NeoForge version dropdown when a new Minecraft version is selected.
// That way it can be populated with the new eligible NeoForge versions afterwards.
function removeAllOptions(selectElement) {
   const length = selectElement.options.length - 1
   for(let i = length; i >= 0; i--) {
      selectElement.remove(i);
   }
}

// Helper to setup the selects 
function createAndPopulateSelectElement(name, id, valueChangeCallback, listOfOptionValues, idOfParentToAttachTo) {
    const select = document.createElement('select');
    select.name = name;
    select.id = id;
    select.classList.add("select2-mode");
    select.onchange = function(){valueChangeCallback(this.value);};
    
    // Populate the select with the provided options.
    // First option selected by default.
    firstOption = true;
    listOfOptionValues.forEach((optionValue) => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.innerHTML = optionValue;
        if (firstOption) {
            option.selected = true;
            firstOption = false;
        }
        select.appendChild(option);
    });
    document.getElementById(idOfParentToAttachTo).appendChild(select);
    
    // Convert the above dropdown to select2 format.
    $(`#${id}`).select2();
}