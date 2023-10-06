'use strict';

(function setupToggleMode(document, window, undefined) {
	const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");
	const mainHtml = document.querySelector("html");

	function getTheme() {
		let theme = localStorage.getItem("theme");
		if (theme == "dark" || theme == "light") {
			return theme;
		} else if (systemSettingDark.matches) {
			return "dark";
		}
		return "light";
	}

	function toggleMode() {
		let theme = getTheme();
		if (theme == "dark") {
			theme = "light";
		} else {
			theme = "dark";
		}
		localStorage.setItem("theme", theme);

		mainHtml.setAttribute("data-theme", theme);
	}

	
	const initialTheme = getTheme();
	localStorage.setItem("theme", initialTheme);
	mainHtml.setAttribute("data-theme", initialTheme);

	document.addEventListener('DOMContentLoaded', function() {
		const toggleModeButton = document.querySelector(".footer_modetoggle-button");
		toggleModeButton.addEventListener('click', toggleMode, false);
	});
}(document, window));
