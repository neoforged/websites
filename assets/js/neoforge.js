const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/"
const NEOFORGE_GAV = "net/neoforged/neoforge"
const LEGACY_GAV = "net/neoforged/forge"
const LATEST_ENDPOINT = "https://maven.neoforged.net/api/maven/latest/version/releases/"
const DOWNLOAD_URL = "https://maven.neoforged.net/releases"
// For the latest version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge
// For legacy version(s): https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/forge?filter=1.20.1
// To filter a specific MC version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge?filter=20.4

function setLinks(neoforgeVersion) {
    const selectedMinecraftVersion = "1." + neoforgeVersion.slice(0, 4);

    const mainMinecraftDropdown = document.getElementById("minecraft-versions");
    mainMinecraftDropdown.innerHTML = `${selectedMinecraftVersion}<span style="float: inline-end;">▼</span>`;
    mainMinecraftDropdown.value = selectedMinecraftVersion;

    const mainNeoforgeDropdown = document.getElementById("neoforge-versions");
    mainNeoforgeDropdown.innerHTML = `${neoforgeVersion}<span style="float: inline-end;">▼</span>`;
    mainNeoforgeDropdown.value = neoforgeVersion;

    const allNeoforgeVersionDropdown = document.getElementById("all-neoforge-versions");
    const latestNeoforgeVersion = allNeoforgeVersionDropdown.options[0].value;

    const installerUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(neoforgeVersion)}/neoforge-${encodeURIComponent(neoforgeVersion)}-installer.jar`;
    const installerLink = document.getElementById("installer-link");
    installerLink.href = installerUrl;
    installerLink.innerHTML = `<span>Click Here to Download:&nbsp;<br><span class="normal__font__weight">neoforge-${selectedMinecraftVersion}-${neoforgeVersion}-installer.jar</span></span>`;
    
    // The latest changelog exists on the website at /changelog so we use that when latest NeoForge is selected.
    // Otherwise use the maven changelog text file link.
    let changelogUrl = "/changelog";
    if (neoforgeVersion != latestNeoforgeVersion) {
        changelogUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(neoforgeVersion)}/neoforge-${encodeURIComponent(neoforgeVersion)}-changelog.txt`;
    }
    document.getElementById("changelog-link").href = changelogUrl;
}

function minecraftValueChanged(optionElement, optionClass) {
    let neoforgeVersionPrefixForCurrentMinecraft = optionElement.dataset.minecraftVersion.slice(2, 6);

    // Unselect previous option in dropdown
    const allRelatedOptions = document.querySelectorAll(`.${optionClass}`);
    allRelatedOptions.forEach((option) => { option.classList.remove("selectedOption"); option.setAttribute('aria-selected', 'false'); });
    optionElement.classList.add("selectedOption");
    optionElement.setAttribute('aria-selected', 'true');

    const allNeoforgeVersionOptions = document.querySelectorAll("#all-neoforge-versions option");
    const allNeoforgeVersions = [...allNeoforgeVersionOptions].map((option) => option.value);
    const neoforgeDropdown = document.getElementById("neoforge-versions-dropdown-content");

    // Nuke all options as we will re-add the new eligible versions
    neoforgeDropdown.innerHTML = '';
    
    // Creates the dropdown of visible eligible NeoForge versions. Already in order of newest to oldest
    const orderedNeoforgeVersionList = allNeoforgeVersions
        .filter((neoVersion) => neoVersion.startsWith(neoforgeVersionPrefixForCurrentMinecraft)); // Only get the neoforge versions for current minecraft version

    populateDropdown(neoforgeDropdown, optionClass, "neoforge-version", orderedNeoforgeVersionList, neoforgeValueChanged);
    setLinks(orderedNeoforgeVersionList[0]);
}

function neoforgeValueChanged(optionElement, optionClass) {
    // Unselect previous option in dropdown
    const allRelatedOptions = document.querySelectorAll(`.${optionClass}`);
    allRelatedOptions.forEach((option) => { option.classList.remove("selectedOption"); option.setAttribute('aria-selected', 'false'); });
    optionElement.classList.add("selectedOption");
    optionElement.setAttribute('aria-selected', 'true');

    setLinks(optionElement.dataset.neoforgeVersion);
}

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
            console.log("There was an error processing the request for a new version.", error);
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
            minecraftVersions.add("1." + neoforgeVersion.slice(0, 4)); 
        }

        // Sorts the mc versions so newest is topmost. We can't sort a set so convert to array first.
        const sortedMinecraftVersion = Array.from(minecraftVersions).sort(function (a,b) {
            return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
        });
        
        // Get newest NeoForge at end of the version list. Already future proofed to ignore April Fools version due to earlier filter.
        const latestNeoForgeVersion = neoforgeVersions[neoforgeVersions.length - 1];
        // Get newest NeoForge version at start of the sorted minecraft version list.
        const latestMinecraftVersion = sortedMinecraftVersion[0];
        const latestInstallerUrl = `${DOWNLOAD_URL}/${NEOFORGE_GAV}/${encodeURIComponent(latestNeoForgeVersion)}/neoforge-${encodeURIComponent(latestNeoForgeVersion)}-installer.jar`;
        const latestChangelogUrl = "/changelog"; // Always is the latest version's changelog on site.
        document.getElementById("filelist").innerHTML = `
            <div class="fileinfo__body">
                <div class="selection_row">
                    <div class="selection_block" id="minecraft-versions-container">
                        <label for="minecraft-versions">Minecraft Version:&nbsp;</label>
                    </div>
                    <div class="selection_block" id="neoforge-versions-container">
                        <label for="neoforge-versions">NeoForge Version:&nbsp;</label>
                    </div>
                </div>
                <div class="download_row">
                    <a id="installer-link" href="${latestInstallerUrl}"><span>Click Here to Download:&nbsp;<br><span class="normal__font__weight">neoforge-${latestMinecraftVersion}-${latestNeoForgeVersion}-installer.jar</span></span></a>
                    <a id="changelog-link" href="${latestChangelogUrl}"><span>See changelog</span></a>
                </div>
            </div>
        `;

        // Creates the select element for Minecraft versions
        const minecraftVersionDropdown = createDropdownButton(
            "Minecraft Versions", 
            "minecraft-versions",
            "minecraftVersionOption", 
            "minecraft-version",
            sortedMinecraftVersion,
            minecraftValueChanged);
        document.getElementById("minecraft-versions-container").appendChild(minecraftVersionDropdown);

        // Creates the hidden select element for holding all neoforge versions.
        // This is so we can use this as version storage to use to populate the dropdowns on Minecraft version change.
        // We could not use a normal visible Select because Safari will show disabled/hidden options and browsers will show massive dropdowns of all options.
        // A custom dropdown is used to have more control over the dropdowns and this hidden select is just for helping to cache version data on page quickly.
        const allNeoforgeVersionSelect = document.createElement('select');
        allNeoforgeVersionSelect.id = 'all-neoforge-versions';
        allNeoforgeVersionSelect.hidden = true;
        allNeoforgeVersionSelect.disabled = true;
        allNeoforgeVersionSelect.style.display = 'none';
        // Versions url always gives list of versions from oldest to newest (exception of april fools versions which we filted already)
        // So iterating backwards will let us have newest be first option in dropdown.
        for (let index = neoforgeVersions.length - 1; index >= 0; index--) {   
            const neoforgeVersion = neoforgeVersions[index];
            const neoforgeVersionOption = document.createElement('option');
            neoforgeVersionOption.value = neoforgeVersion;
            neoforgeVersionOption.innerHTML = neoforgeVersion;
            allNeoforgeVersionSelect.appendChild(neoforgeVersionOption);
        }
        document.querySelector(".fileinfo__body").appendChild(allNeoforgeVersionSelect);
        
        // Creates the dropdown of visible eligible NeoForge versions
        const neoforgeVersionPrefixForCurrentMinecraft = latestNeoForgeVersion.slice(0, 4);
        const orderedNeoforgeVersionList = neoforgeVersions
            .filter((neoVersion) => neoVersion.startsWith(neoforgeVersionPrefixForCurrentMinecraft)) // Only get the neoforge versions for current minecraft version
            .reverse(); // reverse as this function wants newest versions first.
        const neoforgeVersionDropdown = createDropdownButton(
            "NeoForge Versions", 
            "neoforge-versions",
            "neoforgeVersionOption", 
            "neoforge-version",
            orderedNeoforgeVersionList,
            neoforgeValueChanged);
        document.getElementById("neoforge-versions-container").appendChild(neoforgeVersionDropdown);
    }
}

let openedDropdownId = undefined;
let currentOptionIndex = 0;

/* Modified custom dropdown element from: https://www.w3schools.com/howto/howto_js_dropdown.asp */
/* When the user clicks on the button, toggle between hiding and showing the dropdown content */
function showDropdown(currentElement) {
    // Hide all dropdowns as we will re-open the currently selected dropdown option
    closeAllDropdowns();

    // Keep clicked dropdown closed if it was already opened before. Creates toggle behavior of show/hide when clicking the selected preview element
    if (openedDropdownId == currentElement.id) {
        openedDropdownId = undefined;
        return;
    }

    // Display current dropdown's options
    currentElement.setAttribute('aria-expanded', true);
    document.getElementById(currentElement.dataset.dropdownContentId).classList.toggle("show");

    // Move user focus to selected dropdown element (Hoping this is better for keyboard users)
    const selectedDropdown = document.querySelector(`#${currentElement.dataset.dropdownContentId} .selectedOption`);
    selectedDropdown.focus();

    currentOptionIndex = Number(selectedDropdown.dataset.index);
    openedDropdownId = currentElement.id;
}

function closeAllDropdowns() {
    // Mark all dropdown as closed
    const otherDropdowns = document.querySelectorAll(`.dropbtn`);
    for (let i = 0; i < otherDropdowns.length; i++) {
        const otherDropdown = otherDropdowns[i];
        otherDropdown.setAttribute('aria-expanded', false);
    }

    // Close dropdown options of other dropdowns.
    const otherDropdownDisplays = document.querySelectorAll(`.dropdown-content`);
    for (let i = 0; i < otherDropdownDisplays.length; i++) {
        const otherDropdownDisplay = otherDropdownDisplays[i];
        if (otherDropdownDisplay.classList.contains('show')) {
            otherDropdownDisplay.classList.remove('show');
        }
    }
}

function closeDropdownOnOutsideClick(event) {
  if (openedDropdownId && !event.target.matches('.dropbtn')) {
    closeAllDropdowns();
    openedDropdownId = undefined;
  }
}

function handleKeyPress(event) {
  if (!openedDropdownId) {
    return
  } 

  if (event.key === 'Escape') {
    closeAllDropdowns();
    openedDropdownId = undefined;
    event.preventDefault();
  }
  else if (event.key === 'ArrowDown') {
    const currentDropdownMain = document.querySelector(`#${openedDropdownId}`);
    const currentOpenedDropdown = document.querySelector(`#${currentDropdownMain.dataset.dropdownContentId}`);
    const currentSelectedOption = document.querySelector(`#${currentOpenedDropdown.id} .selectedOption`);
    if (currentOptionIndex < currentOpenedDropdown.children.length - 1) {
        currentOptionIndex++;

        const newSelectedOption = currentOpenedDropdown.children[currentOptionIndex];
        newSelectedOption.setAttribute('aria-selected', 'true');
        newSelectedOption.focus({ focusVisible: true });
        newSelectedOption.classList.add("selectedOption");

        currentSelectedOption.classList.remove("selectedOption");
        currentSelectedOption.setAttribute('aria-selected', 'false');
        event.preventDefault();
    }
  }
  else if (event.key === 'ArrowUp') {
    const currentDropdownMain = document.querySelector(`#${openedDropdownId}`);
    const currentOpenedDropdown = document.querySelector(`#${currentDropdownMain.dataset.dropdownContentId}`);
    const currentSelectedOption = document.querySelector(`#${currentOpenedDropdown.id} .selectedOption`);
    if (currentOptionIndex > 0) {
        currentOptionIndex--;
        
        const newSelectedOption = currentOpenedDropdown.children[currentOptionIndex];
        newSelectedOption.setAttribute('aria-selected', 'true');
        newSelectedOption.focus({ focusVisible: true });
        newSelectedOption.classList.add("selectedOption");

        currentSelectedOption.classList.remove("selectedOption");
        currentSelectedOption.setAttribute('aria-selected', 'false');
        event.preventDefault();
    }
  }
}

// Close the dropdown menu if the user clicks outside of it or clicks esc
window.onclick = closeDropdownOnOutsideClick;
window.onkeydown = handleKeyPress;

// Helper to create the custom dropdowns quickly
function createDropdownButton(name, id, optionClass, dataname, listOfButtonOptions, optionOnclickFunction) {
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add("dropdown");

    const dropdownMainButton = document.createElement('button');;
    dropdownMainButton.setAttribute("tab-index", "0");
    dropdownMainButton.classList.add("dropbtn");
    dropdownMainButton.name = name;
    dropdownMainButton.id = id;
    dropdownMainButton.dataset.dropdownContentId = `${id}-dropdown-content`;
    dropdownMainButton.onclick = function(){showDropdown(this)};
    dropdownMainButton.role = "combobox";
    dropdownMainButton.setAttribute("aria-controls", "listbox");
    dropdownMainButton.setAttribute("aria-haspopup", "listbox");
    dropdownMainButton.setAttribute("aria-expanded", "true")

    // Creates the dropdown's options as buttons that when clicked, will set parent text and download links.
    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add("dropdown-content");
    dropdownContent.id = `${id}-dropdown-content`;
    dropdownContent.role = "listbox";
    populateDropdown(dropdownContent, optionClass, dataname, listOfButtonOptions, optionOnclickFunction);

    // Default to newest version displayed
    dropdownMainButton.innerHTML = `${listOfButtonOptions[0]}<span style="float: inline-end;">▼</span>`;
    dropdownMainButton.value = listOfButtonOptions[0];
    
    dropdownContainer.appendChild(dropdownMainButton);
    dropdownContainer.appendChild(dropdownContent);
    return dropdownContainer;
}

function populateDropdown(dropdownContentDiv, optionClass, dataname, listOfButtonOptions, optionOnclickFunction) {
    let firstOption = true;
    let index = 0;
    listOfButtonOptions.forEach(function(optionValue) {
        const optionButton = document.createElement('button');
        optionButton.classList.add(optionClass);
        optionButton.setAttribute(`data-${dataname}`, optionValue);
        optionButton.setAttribute(`data-index`, index);
        optionButton.onclick = function(){optionOnclickFunction(this, optionClass)};
        optionButton.innerHTML = optionValue;
        optionButton.role = "option";

        if (firstOption) {
            // visually show as the selected option in dropdown
            optionButton.classList.add("selectedOption");
            optionButton.setAttribute('aria-selected', 'true');
            firstOption = false;
        }
        else {
            optionButton.setAttribute('aria-selected', 'false');
        }

        dropdownContentDiv.appendChild(optionButton);
        index++;
    });
}