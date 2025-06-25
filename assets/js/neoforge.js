const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/"
const FALLBACK_VERSIONS_ENDPOINT = "https://maven.creeperhost.net/"
const NEOFORGE_GAV = "net/neoforged/neoforge"
const LEGACY_GAV = "net/neoforged/forge"
const LATEST_ENDPOINT = "https://maven.neoforged.net/api/maven/latest/version/releases/"
const DOWNLOAD_URL = "https://maven.neoforged.net/releases"
// For the latest version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge
// For legacy version(s): https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/forge?filter=1.20.1
// To filter a specific MC version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge?filter=20.4

// Cache all neoforge versions in javascript variable.
// This does persist as long as page stays loaded.
const allNeoforgeVersions = [];

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

        // Remove 0.25w14craftmine and other april fools versions
        const neoforgeVersions = versions.filter((version) => !version.startsWith("0"));

        // Using a set to prevent duplicate minecraft versions quickly as we extract the Minecraft versions from the NeoForge versions.
        const minecraftVersions = new Set([]);
        for (const neoforgeVersion of neoforgeVersions) {
            // The left 2 numbers for NeoForge versions is the last 2 numbers for Minecraft versions.
            minecraftVersions.add("1." + getFirstTwoVersionNumbers(neoforgeVersion)); 
        }
        // Sorts the mc versions so newest is topmost. We can't sort a set so convert to array first.
        const sortedMinecraftVersion = Array.from(minecraftVersions).sort(function (a,b) {
            return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
        });
        
        // Get newest NeoForge at end of the version list. Already future proofed to ignore April Fools version due to earlier filter.
        const latestNeoForgeVersion = neoforgeVersions[neoforgeVersions.length - 1];
        // Use the latest NeoForge version to know which other NeoForge versions are also in the same current Minecraft version.
        const neoforgeVersionPrefixForCurrentMinecraft = getFirstTwoVersionNumbers(latestNeoForgeVersion);
        // Get newest NeoForge version at start of the sorted minecraft version list.
        const latestMinecraftVersion = sortedMinecraftVersion[0];

        const latestInstallerUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(latestNeoForgeVersion)}/neoforge-${encodeURIComponent(latestNeoForgeVersion)}-installer.jar`;
        const latestChangelogUrl = "/changelog"; // This URL is the latest version's changelog on site. Always kept up to date automatically.
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
                    <a id="installerlink" href="${latestInstallerUrl}"><span>Click Here to Download Installer</span></span></a>
                    <a id="changeloglink" href="${latestChangelogUrl}"><span>See changelog</span></a>
                </div>
            </div>
        `;

        // Versions url always gives list of versions from oldest to newest (exception of april fools versions which we filted already)
        // So iterating backwards will let us have newest be first option.
        for (let index = neoforgeVersions.length - 1; index >= 0; index--) {   
            allNeoforgeVersions.push(neoforgeVersions[index]);
        }
        
        // Creates the select element for Minecraft versions
        createAndPopulateSelectElement('Minecraft Versions', 'minecraftversions', minecraftValueChanged, sortedMinecraftVersion, "minecraftversionscontainer");
       
        // Creates the select element with NeoForge versions that are for the latest Minecraft version initially
        const filteredNeoforgeVersion = allNeoforgeVersions.filter((neoforgeVersion) => neoforgeVersion.startsWith(neoforgeVersionPrefixForCurrentMinecraft));
        createAndPopulateSelectElement('NeoForge Versions', 'neoforgeversions', neoforgeValueChanged, filteredNeoforgeVersion, "neoforgeversionscontainer");
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
    const latestNeoforgeVersion = allNeoforgeVersions[0].value;

    const installerUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(neoforgeVersion)}/neoforge-${encodeURIComponent(neoforgeVersion)}-installer.jar`;
    const installerLink = document.getElementById("installerlink");
    installerLink.href = installerUrl;
    installerLink.innerHTML = `<span>Click Here to Download Installer</span>`;
    
    // The latest changelog exists on the website at /changelog so we use that when latest NeoForge is selected.
    // Otherwise use the maven changelog text file link.
    let changelogUrl = "/changelog";
    if (neoforgeVersion != latestNeoforgeVersion) {
        changelogUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(neoforgeVersion)}/neoforge-${encodeURIComponent(neoforgeVersion)}-changelog.txt`;
    }
    document.getElementById("changeloglink").href = changelogUrl;
}

function minecraftValueChanged(selectedMinecraftVersion) {
    const neoforgeVersionPrefixForCurrentMinecraft = getLastTwoVersionNumbers(selectedMinecraftVersion);

    const neoforgeDropdown = document.getElementById("neoforgeversions");

    // Nuke all NeoForge version options as we will re-add the new eligible versions
    removeAllOptions(neoforgeDropdown);
    
    let newestNeoforgeForCurrentMinecraft = undefined;
    for (let index = 0; index < allNeoforgeVersions.length; index++) {
        const neoforgeVersion = allNeoforgeVersions[index];

        // Skip versions that are not eligible for current minecraft version
        if (!neoforgeVersion.startsWith(neoforgeVersionPrefixForCurrentMinecraft)) {
            continue;
        }

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