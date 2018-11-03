;(function () {
	if (typeof window.$document === "undefined") {
		window.$document = $(document);
	}

	/**
	 * Метод принимает любою стоку и отдает ее хеш. Если передать пустую строку, то метод отдаст случайный хеш
	 * @returns {string} - хеш строки
	 */
	if(typeof "".hashCode === "undefined"){
		String.prototype.hashCode = function () {
			var preHash = '';
			if (this.length === 0) {
				preHash += Math.floor(Math.random() * (10000001));
			} else {
				preHash = this;
			}
			var hash = preHash.split("").reduce(function (a, b) {
				a = ((a << 5) - a) + b.charCodeAt(0);
				return a & a
			}, 0);
			if(hash < 0){
				return hash*(-1)+'';
			} else {
				return hash+'';
			}
		};
	}


	/**
	 * Конструктор загрузчик для загрузки скриптов по требованию.
	 * @param $element {false|Object.HTML|Object.jQuery} - Элемент относительно которого будет работать модуль или false.
	 * Если false, то для работы модуля $element не нужен
	 * @constructor
	 */
	function ScriptLoad($element) {
		/**
		 *  В первую очередь определяем есть ли данный элемент,
		 * к которому будет применен модуль(и), на странице.
		 * Именно вокруг этой концепции строиться данный загрузчик,
		 * если элемента нет, от и делать, и загружать ни чего не надо.
		 *  Если $element === false, то для работы модуля $element не нужен.
		 */
		if ($element === false
			|| typeof $element.innerHTML !== "undefined"
			|| ($element.length && ($element instanceof jQuery || $element.constructor.prototype.jquery))) {
			/**
			 * Свойство по которому определятся, есть ли элемент на странице.
			 * @type {boolean}
			 * @private
			 */
			var _isElement = true;
		} else {
			_isElement = false;
		}


		// Проверяем, включен ли режим разработки
		if (window._isDev === true){
			/**
			 * Свойство по которому определятся, нужно ли добавлять суффикс "min" к файлу при загрузки.
			 * @type {boolean}
			 * @private
			 */
			var _isDev = true;
		} else {
			_isDev = false;
		}


		/**
		 * Метод проверяет переданные модули на правильность.
		 * @param modules (object) - объект содержащий путь до модуля (он же идентификатор модуля)
		 * и способ определения загружен ли модуль в данный момент или нет, имеет формат {
		 *   '/dist/js/modules/example': window.example,
		 *   '/dist/js/modules/example2': Object.getPrototypeOf($())['example2']  // пример для jQuery
		 * }
		 * !!!ВНИМАНИЕ, путь до модуля указывается без расширения и без суффикса ".min".
		 */
		this.modules = function (modules) {
			//Проверяем модули.
			if (typeof modules !== "object") {
				console.error('Ошибка: параметр modules передаваемый в ScriptLoad.modules() не является объектом.');
				_modules = undefined;
			} else {
				_modules = {};
				// Флаг наличия ошибок в пераданом объекте modules
				var error_modules = false;
				// Переберает все модули для проверки
				for (var module_name in modules){
					if (modules.hasOwnProperty(module_name)) {
						// Флаг наличия ошибок в проверяемом модуле
						var error_module = false;

						// todo проверить на строку не получается, т.к конструкция for in преобразовывает module_name в тип string
						if(module_name === ""){
							error_modules = true;
							error_module = true;
							console.error('Ошибка: путь до модуля должен быть строкой. Передано: "'+module_name+'". Тип: "'+typeof module_name+'"');
						}

						if( !(typeof modules[module_name] === "undefined"
							|| typeof modules[module_name] === "object"
							|| typeof modules[module_name] === "function") ){
							error_modules = true;
							error_module = true;
							console.error('Ошибка: модуль может иметь тип "undefined", если он еще не загружен или "object" если загружен. Передано: "'+modules[module_name]+'". Тип: "'+typeof modules[module_name]+'"');
						}

						if(error_module) continue;

						var module_url = module_name + (_isDev ? '.js' : '.min.js');
						_modules[module_url] = modules[module_name];
					}
				}
				if(error_modules){
					_modules = undefined;

					return;
				}

				_counterModulus = Object.keys(_modules).length;
			}
		};

		/**
		 * Метод загружает переданные модули и исполняет переданные функции после загрузки.
		 * @param callbacks_settings (object) - Объект функций которые сработает в жизненном цикле SL().
		 * В частности:
		 * callback - функция которая сработает при удачной загрузки всех переданных модулей;
		 * callbackError - функция которая сработает при неудачной загрузки какого-либо модуля.
		 */
		this.run = function (callbacks_settings) {
			//Если элемента нет, то просто выходим из функции.
			if (!_isElement) return;

			//Если с объектом что то не то, просто выходим из функции.
			if (typeof _modules === "undefined") return;

			/*
			* Определяем callback и callbackError по умолчанию.
			* */
			var callbacks_default = {
				callback: function (module) {
					console.info('Модуль загружен успешно: ' + module)
				},
				callbackError: function (module) {
					console.error('Ошибка загрузки модуля: ' + module)
				},
			};
			var callbacks = $.extend({}, callbacks_default, callbacks_settings);

			// Переборка всех модулей, подлежащих загрузки.
			for (var module_url in _modules) {
				// Проверка, принадлежит ли свойство module самому объекту _modules (не портотипу).
				if (_modules.hasOwnProperty(module_url)) {
					var module_id = module_url.hashCode();
					// Проверка на присутствие в пространстве имен указанного модуля.
					if (typeof _modules[module_url] === "undefined") {
						// Если модуль "undefined", подписываемся на него и ждем его загрузку.
						_addOnLoad(module_id, module_url, callbacks.callback);

						// Проверка на присутствие в ScriptLoad._registryModules.
						if (typeof _getRegistryModules(module_id) === "undefined") {
							// Если отсутствует, вносим и присваиваем false.
							_setRegistryModules({
								id: module_id,
								status: false,
								url: module_url,
							});

							// Загружаем отсутствующую модуль.
							var script = document.createElement('script');
							script.src = module_url;
							// Записываем идентификатор модуля в атрибут id, для дальнейшего его извлечения после загрузки.
							script.id = module_id;
							script.title = module_url;
							//script.defer = true; //Нужно ли?
							script.type = 'text/javascript';
							document.body.appendChild(script);
							// Если загрузка прошла успешно.

							script.onload = function (event) {
								/*
								* Ставим в ScriptLoad._registryModules[module] статус true,
								* что бы инициализировать событие загрузки мобуля.
								* */
								_setRegistryModules({
									id: event.target.id,
									status: true,
								});
							};
							// Если ошибка при загрузке, например файл не найден.
							script.onerror = function (event) {
								callbacks.callbackError(event.target.title);
							};
						}
					} else {
						// Тут мы выполняем функцию, если модуль уже загружен.
						if(_isDev){
							console.log('Модуль ' + module_url + ' уже был загружен, второй раз его грузить не надо');
						}

						// Запускаем callback.
						_goCallback(callbacks.callback, module_url)
					}
				}
			}
		};

		/**
		 * Свойство для хранения объекта модулей для загрузки.
		 * @type {object}
		 * @private
		 */
		var _modules = undefined;
		/**
		 * Свойство в котором кэшируется количество переданных для загрузки модулей.
		 * @type {number}
		 * @private
		 */
		var _counterModulus = 0;
		/**
		 * Свойство, по которому проверяем число загруженных модулей.
		 * Если оно равно количеству переданных модулей, то можно исполнять переданный код.
		 * @type {number}
		 * @private
		 */
		var _counterModulusReady = 0;


		/**
		 * Метод для получения в _registryModules[module_id] объекта с информацией нужного модуля.
		 * @param module_id {string} - Индентификатор модуля, объект которого нужно получить
		 * @returns {object} - объект настройки модуля вида {
		 *   id: {string}, // - Идентификатор  модуля
		 *   status: {boolean}, // - Статус модуля
		 *   url: {string}, // - Адрес модуля
		 * }
		 * @private
		 */
		function _getRegistryModules(module_id) {
			var module = ScriptLoad._registryModules[module_id];
			if(typeof module === "undefined") return undefined;

			return new function () {
				this.id = module_id;
				this.status = module.status;
				if(typeof module.url === "string"
					&& module.url !== ''){
					this.url = module.url
				}
			};
		}

		/**
		 * Метод для изменения в _registryModules[module_id] объекта с информацией нужного модуля.
		 * @param object_settings {object} - объект настройки модуля вида {
		 *   id: {string}, // - Идентификатор  модуля
		 *   status: {boolean}, // - Статус модуля
		 *   url: {string}, // - Адрес модуля
		 * }
		 * @private
		 */
		function _setRegistryModules(object_settings) {
			if (object_settings.status === true) {
				var module_url = _getRegistryModules(object_settings.id).url;
				if(_isDev) {
					console.log('Модуль "' + module_url + '" загружен');
				}
				/*
				* Тут мы вызваем событие, связанное с загрузкой модуля
				* */
				$document.trigger(object_settings.id);
				$document.off(object_settings.id);
			}

			ScriptLoad._registryModules[object_settings.id] = new function () {
				this.status = object_settings.status;

				if(typeof object_settings.url === "string"
					&& object_settings.url !== ''){
					this.url = object_settings.url
				}
			};
		}

		/**
		 * Функция подписки callback на событие module
		 * @param module_id {string} - Идентификатор события/модуля
		 * @param module_url {string} - Имя события
		 * @param callback {function} - Исполняемая функция в случае успешной загрузки модуля
		 * @private
		 */
		function _addOnLoad(module_id, module_url, callback) {
			var module_status = undefined;

			if(typeof _getRegistryModules(module_id) !== "undefined"){
				module_status = _getRegistryModules(module_id).status;
			}
			if(_isDev) {
				console.log('Статус модуля "' + module_url + '": ' + module_status + '. Подписываемся на загрузку модуля');
			}
			$document.on(module_id, function () {
				// Запускаем callback
				_goCallback(callback, _getRegistryModules(module_id).url)
			});
		}

		/**
		 * Функция увеличивает счетчик загруженных модулей и исполняет callback,
		 * если количество переданных модулей равно количеству загруженных.
		 * @param callback {function} - Исполняемая функция в случае успешной загрузки модуля
		 * @param module_name {string} - Имя модуля
		 * @private
		 */
		function _goCallback(callback, module_name) {
			// Увеличиваем счетчик количества загруженных модулей
			_counterModulusReady++;

			/*
			* Если количество переданных модулей равно количеству загруженных,
			* исполняем callback переданный в методе ScriptLoad.run()
			* */
			if (_counterModulus === _counterModulusReady) {
				callback(module_name);
			}
		}
	}

	/**
	 * Реестр загруженных модулей.
	 * @type {{}}
	 * @private
	 */
	ScriptLoad._registryModules = {};
// экспор ScriptLoad наружу
	window.SL = ScriptLoad;
}());