sap.ui.define([
		'sap/ui/demo/toolpageapp/controller/BaseController',
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/Popover',
		'sap/m/MessagePopover',
		'sap/m/Button',
		'sap/m/Link',
		'sap/m/Bar',
		'sap/m/NotificationListItem',
		'sap/m/MessagePopoverItem',
		'sap/ui/core/CustomData',
		'sap/m/MessageToast'
	], function (BaseController, jQuery, Fragment, Controller, JSONModel, Popover,MessagePopOver, Button, Link, Bar, Notification, Message,CustomData, MessageToast) {
		"use strict";

		return BaseController.extend("sap.ui.demo.toolpageapp.controller.App", {

			onInit: function() {
				//this._setToggleButtonTooltip(!sap.ui.Device.system.desktop);
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getOwnerComponent().getRouter().attachRouteMatched(this.onRouteMatched, this);
			},

			onRouteMatched: function () {
				// Initiate The Notification Counter
				var oModel = this.getView().getModel("alerts");
				var iNotificationCounter =  oModel.getProperty("/alerts/notifications").length;
				oModel.setProperty("/alerts/notificationCounter", iNotificationCounter);
			},

			/**
			 * Convenience method for accessing the router.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			onItemSelect: function(oEvent) {
				var oItem = oEvent.getParameter('item');
				var sKey = oItem.getKey();
				if(sKey !== "home" && sKey !=="systemSettings" && sKey!== "statistics")   {
					MessageToast.show(sKey);
				}
				else {
					this.getRouter().navTo(sKey);
				}
			},

			handleUserNamePress: function(oEvent) {
				// close message popover
				var oMessagePopover = this.getView().byId("messagePopover");
				if (oMessagePopover && oMessagePopover.isOpen()) {
					oMessagePopover.destroy();
				}
				var fnHandleUserMenuItemPress = function (oEvent) {
					MessageToast.show(oEvent.getSource().getText() + " was pressed");
				};
				var oPopover = new Popover({
					showHeader: false,
					placement: sap.m.PlacementType.Bottom,
					content:[
						new Button({
							text: 'User Settings',
							type: sap.m.ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button ({
							text: "Online Guide",
							type: sap.m.ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: 'Feedback',
							type: sap.m.ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: 'Help',
							type: sap.m.ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: 'Logout',
							type: sap.m.ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						})
						],
					afterClose: function () {
						oPopover.destroy();
					}
				}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
				// forward compact/cozy style into dialog
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oPopover);
				oPopover.openBy(oEvent.getSource());
			},

			onSideNavButtonPress: function() {
				var oToolPage = this.getView().byId("app");
				var bSideExpanded = oToolPage.getSideExpanded();
				this._setToggleButtonTooltip(bSideExpanded);
				oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
			},

			_setToggleButtonTooltip : function(bSideExpanded) {
				var oToggleButton = this.getView().byId('sideNavigationToggleButton');
				if (bSideExpanded) {
					oToggleButton.setTooltip('Large Size Navigation');
				} else {
					oToggleButton.setTooltip('Small Size Navigation');
				}
			},

			// Errors Pressed
			handleMessagePopoverPress: function (oEvent) {
				if (!this.getView().byId("messagePopover")) {
					var oMessagePopover = new MessagePopOver(this.getView().createId("messagePopover"), {
						placement: sap.m.VerticalPlacementType.Bottom,
						items: {
							path: 'alerts>/alerts/errors',
							factory: this._createError
						},
						afterClose: function () {
							oMessagePopover.destroy();
						}
					});
					this.getView().byId("app").addDependent(oMessagePopover);
					// forward compact/cozy style into dialog
					jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oMessagePopover);
					oMessagePopover.openBy(oEvent.getSource());
				}
			},

			// Notifications Pressed
			handleNotificationPress: function (oEvent) {
				// close message popover
				var oMessagePopover = this.getView().byId("messagePopover");
				if (oMessagePopover && oMessagePopover.isOpen()) {
					oMessagePopover.destroy();
				}
				var oButton = new Button({
					text: "Show all Notifications",
					press: function () {
						MessageToast.show("Show all Notifications was pressed");
					}
				});
				var oNotificationPopover = new Popover({
					title: "Notifications",
					contentWidth: "300px",
					footer: new Bar({
						contentRight: oButton
					}),
					placement: sap.m.PlacementType.Bottom,
					content: {
						path: 'alerts>/alerts/notifications',
						factory: this._createNotification
					},
					afterClose: function () {
						oNotificationPopover.destroy();
					}
				});
				this.getView().byId("app").addDependent(oNotificationPopover);
				// forward compact/cozy style into dialog
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oNotificationPopover);
				oNotificationPopover.openBy(oEvent.getSource());
			},

			_createNotification: function (sId, oBindingContext) {
				var oBindingObject = oBindingContext.getObject();
				var oNotificationItem = new Notification({
					title: oBindingObject.title,
					description: oBindingObject.description,
					priority: oBindingObject.priority,
					close: function (oEvent) {
						var sBindingPath = oEvent.getSource().getCustomData()[0].getValue();
						var sIndex = sBindingPath.split("/").pop();
						var aItems = oEvent.getSource().getModel("alerts").getProperty("/alerts/notifications");
						aItems.splice(sIndex, 1);
						oEvent.getSource().getModel("alerts").setProperty("/alerts/notifications", aItems);
						oEvent.getSource().getModel("alerts").updateBindings("/alerts/notifications");
						sap.m.MessageToast.show("Notification has been deleted.");
					},
					datetime: oBindingObject.date,
					authorPicture: oBindingObject.icon,
					press: function () {
					},
					customData : [
						new CustomData({
							key : "path",
							value : oBindingContext.getPath()
						})
					]
				});
				return oNotificationItem;
			},

			_createError: function (sId, oBindingContext) {
				var oBindingObject = oBindingContext.getObject();
				var oLink = new Link({
					text: "More Details",
					press: function() {
						MessageToast.show("More Details was pressed");
					}
				});
				var oMessageItem = new Message({
					title: oBindingObject.title,
					subtitle: oBindingObject.subTitle,
					description: oBindingObject.description,
					counter: oBindingObject.counter,
					link: oLink
				});
				return oMessageItem;
			}

		});
});