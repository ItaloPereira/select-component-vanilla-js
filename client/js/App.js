"use strict";

import "../sass/app.scss";
import { API_URL } from "./env";

const getOptions = async (term) => {
	try {
		const res = await (
			await fetch(`${API_URL}/states?term=${term}`)
		).json();

		return res.data;
	} catch {
		throw new Error("An error ocurred tryng to fetch data");
	}
};

const itemTemplate =
	'<li class="autocomplete__list__item" tabindex="0">{{TEXT}}</li>';

const createAutocomplete = () => {
	const $wrapper = document.querySelector(".main");
	const $autocomplete = $wrapper.querySelector(".autocomplete");
	const $form = $wrapper.querySelector(".main__form");
	const $input = $wrapper.querySelector(".autocomplete__input");
	const $clearButton = $wrapper.querySelector(".autocomplete__input__clear");
	const $optionsList = $wrapper.querySelector(".autocomplete__list");
	const $helperText = $wrapper.querySelector(".autocomplete__helper");
	const $tempValue = $wrapper.querySelector(".autocomplete__temp-value");

	let currentFocusedOption = -1;

	const showClearButton = () =>
		$clearButton.classList.remove("autocomplete__input__clear--hidden");
	const hideClearButton = () =>
		$clearButton.classList.add("autocomplete__input__clear--hidden");

	const showTempValue = (text) => {
		$tempValue.classList.remove("autocomplete__temp-value--hidden");
		$tempValue.textContent = text;
	};

	const hideTempValue = () => {
		$tempValue.classList.add("autocomplete__temp-value--hidden");
		$tempValue.textContent = "";
	};

	const showOptionsList = () =>
		$optionsList.classList.remove("autocomplete__list--hidden");

	const hideOptionsList = () => {
		currentFocusedOption = -1;
		hideTempValue();
		$optionsList.classList.add("autocomplete__list--hidden");
	};

	const showHelperText = (text) => {
		$helperText.textContent = text;
	};

	const hideHelperText = () => {
		$helperText.textContent = "";
	};

	const handleFormSubmit = (ev) => {
		ev.preventDefault();
	};

	const fillOptions = (options) => {
		let items = ``;

		for (let item of options) {
			items += itemTemplate.replaceAll("{{TEXT}}", item.name);
		}

		$optionsList.innerHTML = items;
	};

	const handleOptionClick = (ev) => {
		const $this = ev.target;

		$input.value = $this.textContent;
		hideOptionsList();
		hideHelperText();
	};

	const bindItemsEvents = () => {
		const $selectItems = $wrapper.querySelectorAll(
			".autocomplete__list__item"
		);

		for (let $option of $selectItems) {
			$option.addEventListener("click", handleOptionClick);
		}
	};

	const toggleClearButton = (value) =>
		!!value ? showClearButton() : hideClearButton();

	const toggleHelperText = (value) => {
		const helperText = "You must type at least 2 characteres!";

		if (!value.length) {
			hideHelperText();
		} else if (value.length > 0 && value.length < 2) {
			showHelperText(helperText);
		}
	};

	const handleOptionsLoad = (options) => {
		fillOptions(options);
		bindItemsEvents();
		showOptionsList();
	};

	const handleNoOptions = () => {
		showHelperText("No results for this query!");
		hideOptionsList();
	};

	const handleInputChange = async (ev) => {
		const {
			target: { value },
		} = ev;

		hideTempValue();
		toggleClearButton(value);
		toggleHelperText(value);

		if (value.length >= 2) {
			const options = await getOptions(value);

			if (!options.length) {
				handleNoOptions();
				return;
			}

			if (options.length > 0) {
				handleOptionsLoad(options);
				return;
			}
		}

		hideOptionsList();
	};

	const handleInputFocus = (ev) => {
		handleInputChange(ev);
	};

	const handleClickOutside = (ev) => {
		const $this = ev.target;

		if (!$autocomplete.contains($this)) {
			hideOptionsList();
			hideHelperText();
		}
	};

	const handleTempValueClick = () => {
		const tempValueText = $tempValue.textContent;
		$input.value = tempValueText;
		hideTempValue();
		$input.focus();
	};

	const handleClear = () => {
		$input.value = "";
		hideClearButton();
		hideOptionsList();
		hideHelperText();
		$input.focus();
	};

	const navigation = {
		ArrowUp: ($selectItems) => {
			currentFocusedOption--;

			if (currentFocusedOption < 0) {
				currentFocusedOption = $selectItems.length - 1;
			}

			const $prev = $selectItems[currentFocusedOption];
			const prevText = $prev.textContent;

			showTempValue(prevText);
			$prev.focus();
		},
		ArrowDown: ($selectItems) => {
			currentFocusedOption++;

			if (currentFocusedOption >= $selectItems.length) {
				currentFocusedOption = 0;
			}

			const $next = $selectItems[currentFocusedOption];
			const nextText = $next.textContent;

			showTempValue(nextText);
			$next.focus();
		},
		Escape: () => {
			hideOptionsList();
			hideHelperText();
			$input.blur();
		},
		Enter: ($selectItems) => {
			$selectItems[currentFocusedOption].click();
		},
	};

	const handleNavigation = (ev) => {
		const { key } = ev;

		if (!navigation[key]) {
			$input.focus();
			return;
		}

		const $selectItems = $wrapper.querySelectorAll(
			".autocomplete__list__item"
		);

		if (!$selectItems.length) return;

		navigation[key]($selectItems);
		ev.preventDefault();
	};

	const bindEvents = () => {
		$form.addEventListener("submit", handleFormSubmit);
		$input.addEventListener("input", handleInputChange);
		$input.addEventListener("focus", handleInputFocus);
		$autocomplete.addEventListener("keydown", handleNavigation);
		$clearButton.addEventListener("click", handleClear);
		document.addEventListener("click", handleClickOutside);
		$tempValue.addEventListener("click", handleTempValueClick);
	};

	const init = () => {
		bindEvents();
	};

	return {
		init,
	};
};

const autocomplete = createAutocomplete();
autocomplete.init();
