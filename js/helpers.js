/*global NodeList */
/**
 * @function Helpers
 */
(function (window) {
	'use strict';

	/**
	 * Get element(s) by CSS selector: qs = querySelector
	 * Used in {@link View}
	 * @memberof Helpers
	 */
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};
	/**
	 * Get elements by CSS selector: qsa = querySelectorAll
	 * Used in {@link View}
	 * @memberof Helpers
	 */
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};
 
	/**
	 * addEventListener wrapper:
	 * Used in {@link View} and {@link App}
	 * @memberof Helpers
	 * @param {object} target  
	 * @param {boolean} type Focus || Blur
  	 * @param {function} callback 
	 * @param {object} useCapture captured element
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	/** 
	 * Attach a handler to event for all elements that match the selector,
	 * now or in the future, based on a root element
	 * Used in {@link View}
	 * @memberof Helpers
	 * @param  {object} target  
	 * @param  {function} selector Checks for a match between children and parents
	 * @param {boolean} type 
	 * @param  {function} handler callback executed under one condition
	 */ 
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target;
			var potentialElements = window.qsa(selector, target);
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				/**
				 * If there's an element 'hasMatch', we call the handler on the targeted element 
				 */
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === 'blur' || type === 'focus';

		window.$on(target, type, dispatchEvent, useCapture);
	};

	/**
	 * Find the element's parent with the given tag name: $parent(qs('a'), 'div');
	 * Used in {@link View}
	 * @memberof Helpers
	 * @param {object} element active element
	 * @param {string} tagName element's tagname
	 */
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
