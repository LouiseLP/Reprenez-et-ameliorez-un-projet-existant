/*global qs, qsa, $on, $parent, $delegate */

(function (window) {
	'use strict';

	/**
	     * View that abstracts away the browser's DOM completely.
	     * It has two simple entry points:
	     *	
	     *   - bind(eventName, handler)
	     *     Takes a todo application event and registers the handler
	     *   - render(command, parameterObject)
	     *     Renders the given command with the options
		 * @class View
		 * @param {objet} template
		 * Define default values of {@link Template}
	     */
	function View(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$footer = qs('.footer');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
	}

	/**
	 * Delete the Todo through its ID
	 * @memberof View
	 * @param {number} id ID of the item to delete 
	 */
	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	/**
	 * Clear the View of completed items 
	 * @memberof View
	 * @param {number} completedCount Number of selected items
	 * @param {boolean} visible true (visible) || false (not visible)
	 */
	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};

	/**
	 * Delete the Todo through its ID
	 * @memberof View
	 * @param {string} currentPage current page 
	 * 								'' || active || completed
	 */
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};

	/**
	 * Check if the item is completed
	 * @memberof View
	 * @param {number} id ID of the item to check 
	 * @param {boolean} completed item's state
	 */
	View.prototype._elementComplete = function (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;
	};
 
	/**
	 * To edit an item
	 * @memberof View
	 * @param {number} id ID of the item to edit
	 * @param {string} title item's edited value  
	 */
	View.prototype._editItem = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	/**
	 * Replace the old item with the new edited version
	 * @memberof View
	 * @param {number} id ID of the item to edit
	 * @param {string} title item's edited value
	 */
	View.prototype._editItemDone = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};

	/**
	 * Return the items in the DOM
	 * @memberof View
	 * @param {string} viewCmd active function
	 * @param {object} parameter active parameters
	 */
	View.prototype.render = function (viewCmd, parameter) {
		var self = this;
		var viewCommands = {
			/**
			 * Displays items
			 */
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			/**
			 * Removes item
			 */
			removeItem: function () {
				self._removeItem(parameter);
			},
			/**
			 * Updates the counter
			 */
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			/**
			 * Display the 'clearCompleted' button
			 */
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			/**
			 * Checks item's visibility
			 */
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			/**
			 * Turns all items as completed
			 */
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			/**
			 * Filters items
			 */
			setFilter: function () {
				self._setFilter(parameter);
			},
			/**
			 * Clears new todo input
			 */
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			/**
			 * Displays completed items
			 */
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			/**
			 * Allows item to be edited 
			 */
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			/**
			 * Saves edited item
			 */
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		viewCommands[viewCmd]();
	};

	/**
	 * Add an ID to an item
	 * @memberof View
	 * @param {object} element active element
	 */
	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	/**
	 * EventListener on a validated item edit 
	 * @memberof View
	 * @param {function} handler callback under conditions
	 */
	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};

	/**
	 * EventListener on a cancelled item edit 
	 * @memberof View
	 * @param {function} handler callback under conditions
	 */
	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
	};

	/**
	 * Links between {@link Controller}'s methods and {@link View}'s elements 
	 * @memberof View
	 * @param {function} event active element
	 * @param {function} handler callback under conditions
	 */
	View.prototype.bind = function (event, handler) {
		var self = this;
		if (event === 'newTodo') {
			/**
			 * $on : add eventListener.
			 * self.$newTodo.value to handler (input content).
			 */
			$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});

		} else if (event === 'removeCompleted') {
			$on(self.$clearCompleted, 'click', function () {
				handler();
			});

		} else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
			});

		} else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});

		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));
