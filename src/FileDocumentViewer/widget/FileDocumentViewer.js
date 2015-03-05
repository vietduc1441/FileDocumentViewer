/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console */
/*mendix */

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
require( [
	'dojo/_base/declare', 'mxui/widget/_WidgetBase', 'dijit/_TemplatedMixin',
	'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-attr','dojo/dom-construct', 'dojo/dom-style', 'dojo/_base/lang', 'dojo/text',
	'dojo/text!FileDocumentViewer/widget/templates/FileDocumentViewer.html'
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domAttr, domConstruct, domStyle, lang, text, widgetTemplate) {
	'use strict';

	// Declare widget's prototype.
	return declare('FileDocumentViewer.widget.FileDocumentViewer', [ _WidgetBase, _TemplatedMixin ], {
		// _TemplatedMixin will create our dom node using this HTML template.
		templateString: widgetTemplate,

		// Parameters configured in the Modeler.
		mfToExecute: "",
		messageString: "",
		backgroundColor: "",

		// Internal variables. Non-primitives created in the prototype are shared between all widget instances.
		_handle: null,
		_contextObj: null,
		_objProperty: null,

		// dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
		postCreate: function () {
			console.log(this.id + '.postCreate');

			if (!this.showheader) {
				domStyle.set(this.toolbarNode, 'display', 'none');
			}
			
			domStyle.set(this.domNode, {
				'width': this.width === 0 ? 'auto' : this.width + 'px'
			});
			domStyle.set(this.iframeNode, {
				'height': this.height === 0 ? 'auto' : this.height + 'px',
				'width' : '100%',
				'overflow': 'auto'
			});

			this._setupEvents();
		},

		// mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
		update: function (obj, callback) {
			console.log(this.id + '.update');

			this._contextObj = obj;
			this._resetSubscriptions();
			this._updateRendering();

			callback();
		},
		
		_updateRendering: function () {
			if (this._contextObj)  {
				domAttr.set(this.iframeNode, "src", this._getFileUrl());
				this.toolbarNode.appendChild(document.createTextNode(this._contextObj.get('Name')));
			} else {
				domAttr.set(this.iframeNode, "src", mx.moduleUrl("FileDocumentViewer.widget", "ui/blank.html"));
			}
		},

		_resetSubscriptions: function () {
			// Release handle on previous object, if any.
			if (this._handle) {
				this.unsubscribe(this._handle);
				this._handle = null;
			}

			if (this._contextObj) {
				this._handle = this.subscribe({
					guid: this._contextObj.getGuid(),
					callback: this._updateRendering
				});
			}
		},
		
		_setupEvents : function(){
			this.connect(this.enlargeNode, "onclick", this._eventEnlarge);
			this.connect(this.popoutNode, "onclick",  this._eventPopout);
		},
		
		_getFileUrl : function() {
			var url;
			if (this._contextObj === null || this._contextObj.getAttribute("Name") === null) {
				url = mx.moduleUrl("FileDocumentViewer.widget", "ui/error.html");
			} else {
				url ="file?target=window&guid=" + this._contextObj.getGUID() + "&csrfToken=" + mx.session.getCSRFToken() + "&time=" + Date.now();
			}
			return url;
		},

		_eventEnlarge : function() {
			domStyle.set(this.iframeNode, {
				height: (domStyle.get(this.iframeNode, 'height') * 1.5) +'px'
			});
		},

		_eventPopout : function() {
			window.open(this._getFileUrl());
		}
	});
});
