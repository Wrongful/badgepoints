//=============================================================================
// Wrongful - Badge Points
// BadgePoints.js
//=============================================================================

var Imported = Imported || {};
Imported.BadgePoints = true;

var Dragonfish = Dragonfish || {};
Dragonfish.BP = {};
Dragonfish.BP.version = 1.00;

/*:
 * @plugindesc Lets the player add Badges to their game. Requires YEP_EquipCore.
 *
 * @param Badge Equip Type ID
 * @desc ID of the Equip Type for Badges.
 * @default 5
 *
 * @param Badge Menu Name
 * @type string
 * @desc Name of the Badge menu.
 * @default Badges
 *
 * @param Badge Points Name
 * @type string
 * @desc What Badge Points will be called in your game.
 * @default Badge Points
 *
 * @param Badge Points Abbr
 * @type string
 * @desc Abbreviation for Badge Points.
 * @default BP
 *
 * @param Auto Add Menu
 * @type boolean
 * @on Enable
 * @off Disable
 * @desc Automatically add the 'Badges' command to the main menu?
 * NO - false     YES - true
 * @default true
 *
 * @param Auto Place Menu
 * @type boolean
 * @on Enable
 * @off Disable
 * @desc Allow this plugin to decide the menu's position?
 * NO - false     YES - true
 * @default true
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin adds a new "Badge" system, where instead of a set number
 * of slots, the player has "points" that can change throughout gameplay;
 * they can equip a small number of powerful badges, or a larger number
 * of lesser ones. This plugin is named after the Badges from Paper Mario,
 * but is also similar to the Charms from Hollow Knight, or the Medals from
 * Bug Fables, for example.
 *
 * Badges all fall under a single Equipment Type, as defined in the plugin
 * parameters. All other equipment types and systems should be the same,
 * meaning you can have both Badges and normal Equipment.
 *
 * Define in the plugin parameters which Equipment Type you want to use for
 * Badges; this eType will then no longer be equippable in any actor's
 * default Equip menu. Then, make a Badge by setting any Armor to that
 * same eType, and make sure their Armor Type is set to 1 as well ('General
 * Armor').
 *
 * From there, make the Badge have whatever unique traits you want!
 *
 * ============================================================================
 * Compatibility
 * ============================================================================
 *
 * Yanfly's EquipCore is required. I don't know of any other incompatibilities,
 * but beware of any plugins where an actor's Equip Slots can change
 * throughout gameplay (such as Yanfly's ClassChangeCore). 
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * Armor Notetags:
 *     <BP:x>
 *     Set x to the number of Badge Points you want this Badge to be worth.
 *     The player can only equip it if they have at least this many BP
 *     available.
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * GainBP 5 1
 *     Gives 5 BP to Actor 1.
 *
 * LoseBP 5 1
 *     Takes 5 BP to Actor 1. (NOTE: If an actor's BP falls into the
 *     negatives, it will automatically unequip Badges until their
 *     BP is at least 0 again.)
 *
 * PartyGainBP 5
 *     Gives 5 BP to the entire current party.
 *
 * PartyLoseBP 5
 *     Takes 5 BP from the entire current party.
 *
 * ShowBadgeMenu
 *     Shows the Badge option in the Main Menu.
 *
 * HideBadgeMenu
 *     Hides the Badge option in the Main Menu.
 *
 * EnableBadgeMenu
 *     Enables the Badge option in the Main Menu.
 *
 * DisableBadgeMenu
 *     Disables the Badge option in the Main Menu.
 *
 * (NOTE: The following plugin commands call for specific indexes in your
 * actor's equipped Badges. Because Badges can have their indexes
 * fluctuate by design, these commands are not always reliable.)
 *
 * ForceEquipBadge 8 3 1 true
 *     Automatically makes Actor 3 equip the Badge with the armor ID of 8
 *     in slot 1. If "true," it will be added along with your other equips;
 *     by default, it will replace whatever Badge is currently in slot 1.
 *     (Note that this *does* still use BP, so be careful not to send an
 *     actor's BP into the negatives.)
 *
 * LockEquipBadge 1 2
 *     Locks Badge slot 1 for Actor 2; the player will not be able to
 *     change it manually in the menu.
 *
 * UnlockEquipBadge 1 2
 *     Unlocks Badge slot 1 for Actor 2, if it was locked previously.
 *
 * ============================================================================
 * Main Menu Manager
 * ============================================================================
 *
 * If you're using Yanfly's Main Menu Manager, add this to that plugin'same
 * commands:
 *
 *       Name: Dragonfish.BP.MenuName
 *     Symbol: badges
 *       Show: $gameSystem.isShowBadges()
 *    Enabled: $gameSystem.isEnableBadges()
 *        Ext: 
 *  Main Bind: this.commandBadges.bind(this)
 * Actor Bind: SceneManager.push(Scene_Badges)
 *
 * Remember to disable "Auto Add Menu" and "Auto Place Menu" from this
 * plugin's parameters.
 *
 * ============================================================================
 * Permissions
 * ============================================================================
 *
 * This plugin may be used freely in any projects, commercial or private, so
 * long as credit is given to Wrongful.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.00:
 * - Finished!
 *
 */
//=============================================================================

Dragonfish.BP.params = PluginManager.parameters('BadgePoints');
Dragonfish.BP.eTypeID = Number(Dragonfish.BP.params['Badge Equip Type ID'] || 5);
Dragonfish.BP.MenuName = (Dragonfish.BP.params['Badge Menu Name'] || 'Badges').toString();
Dragonfish.BP.BPname = (Dragonfish.BP.params['Badge Points Name'] || 'Badge Points').toString();
Dragonfish.BP.BPabbr = (Dragonfish.BP.params['Badge Points Abbr'] || 'BP').toString();
Dragonfish.BP.AutoAddMenu = eval(String(Dragonfish.BP.params['Auto Add Menu'])) || true;
Dragonfish.BP.AutoPlaceMenu = eval(String(Dragonfish.BP.params['Auto Place Menu'])) || true;


_Dragonfish_Scene_Menu_createCommandWindow =
	Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
	_Dragonfish_Scene_Menu_createCommandWindow.call(this);
	this._commandWindow.setHandler('badges', this.commandPersonal.bind(this));
};

_Dragonfish_Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
Scene_Menu.prototype.onPersonalOk = function() {
    if (this._commandWindow.currentSymbol() === 'badges') {
		SceneManager.push(Scene_Badges);
    } else {
		_Dragonfish_Scene_Menu_onPersonalOk.call(this);
    }
};

_Dragonfish_Window_MenuCommand_addOriginalCommands =
    Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function() {
    _Dragonfish_Window_MenuCommand_addOriginalCommands.call(this);
    if (Dragonfish.BP.AutoAddMenu) {this.addBadgesCommand()};
};

Window_MenuCommand.prototype.addBadgesCommand = function() {
	if (!Dragonfish.BP.AutoPlaceMenu) {return};
    if (!$gameSystem.isShowBadges()) return;
    if (this.findSymbol('badges') > -1) return;
    var text = Dragonfish.BP.MenuName;
    var enabled = $gameSystem.isEnableBadges();
    this.addCommand(text, 'badges', enabled);
};

Scene_Menu.prototype.commandBadges = function() {
	SceneManager.push(Scene_Badges);
};

_DragonFish_GameSysInit = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	_DragonFish_GameSysInit.call(this);
	this.initBadgesSettings();
};

//==============================
// * Game System
//==============================

Game_System.prototype.initBadgesSettings = function() {
	this._showBadges = this._showBadges || true;
	this._enableBadges = this._enableBadges || true;
	this._badgesEType = this._badgesEType || Dragonfish.BP.eTypeID;
};

Game_System.prototype.isShowBadges = function() {
	this.initBadgesSettings();
	return this._showBadges;
};

Game_System.prototype.setShowBadges = function(value) {
	this.initBadgesSettings();
	this._showBadges = value;
};

Game_System.prototype.isEnableBadges = function() {
	this.initBadgesSettings();
	return this._enableBadges;
};

Game_System.prototype.setEnableBadges = function(value) {
	this.initBadgesSettings();
	this._enableBadges = value;
};

//==============================
// * Scene_Badges
//==============================

function Scene_Badges() {
	this.initialize.apply(this, arguments);
}

Scene_Badges.prototype =
	Object.create(Scene_MenuBase.prototype);
Scene_Badges.prototype.constructor = Scene_Badges;

Scene_Badges.prototype.initialize = function() {
	Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Badges.prototype.start = function() {
	Scene_MenuBase.prototype.start.call(this);
};

Scene_Badges.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createHelpWindow();
    this.createCommandWindow();
    this.createSlotWindow();
    this.createItemWindow();
	this.createCompareWindow();
    this.refreshActor();
};

Scene_Badges.prototype.createCompareWindow = function() {
	var wx = 0
	var wy = this._helpWindow.height + 144
	var ww = 312
	var wh = Graphics.boxHeight - (this._helpWindow.height + 144)
	this._compareWindow = new Window_BadgesCompare(wx, wy, ww, wh);
	this._itemWindow.setStatusWindow(this._compareWindow);
	this._slotWindow.setStatusWindow(this._compareWindow);
    this.addWindow(this._compareWindow);
};

Scene_Badges.prototype.createCommandWindow = function() {
    var wx = 0
    var wy = this._helpWindow.height;
    var ww = 312;
    this._commandWindow = new Window_BadgesCommand(wx, wy, ww);
	this._commandWindow.height = 144;
    this._commandWindow.setHelpWindow(this._helpWindow);
    this._commandWindow.setHandler('equip',    this.commandEquip.bind(this));
    this._commandWindow.setHandler('clear',    this.commandClear.bind(this));
    this._commandWindow.setHandler('cancel',   this.popScene.bind(this));
    this._commandWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._commandWindow.setHandler('pageup',   this.previousActor.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Badges.prototype.createSlotWindow = function() {
    var wx = this._commandWindow.width;
    var wy = this._helpWindow.height
    var ww = 252
    var wh = 516
    this._slotWindow = new Window_BadgesEquip(wx, wy, ww, wh);
    this._slotWindow.setHelpWindow(this._helpWindow);
    this._slotWindow.setStatusWindow(this._compareWindow);
    this._slotWindow.setHandler('ok',       this.onSlotOk.bind(this));
    this._slotWindow.setHandler('cancel',   this.onSlotCancel.bind(this));
    this.addWindow(this._slotWindow);
};

Scene_Badges.prototype.createItemWindow = function() {
    var wx = this._commandWindow.width + this._slotWindow.width;
    var wy = this._helpWindow.height
    var ww = 252
    var wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_BadgesItem(wx, wy, ww, wh);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this._slotWindow.setItemWindow(this._itemWindow);
    this.addWindow(this._itemWindow);
};

Scene_Badges.prototype.refreshActor = function() {
    var actor = this.actor();
    this._compareWindow.setActor(actor);
    this._slotWindow.setActor(actor);
    this._itemWindow.setActor(actor);
};

Scene_Badges.prototype.commandEquip = function() {
    this._slotWindow.activate();
    this._slotWindow.select(0);
};

Scene_Badges.prototype.commandClear = function() {
    SoundManager.playEquip();
    this.actor().clearBadges();
    this._compareWindow.refresh();
    this._slotWindow.refresh();
	this._itemWindow.refresh();
	this._commandWindow.refresh();
    this._commandWindow.activate();
};

Scene_Badges.prototype.onSlotOk = function() {
    this._itemWindow.activate();
    this._itemWindow.select(0);
};

Scene_Badges.prototype.onSlotCancel = function() {
    this._slotWindow.deselect();
    this._commandWindow.activate();
};

Scene_Badges.prototype.onItemOk = function() {
    SoundManager.playEquip();
    this.actor().changeBadgeEquips(this._slotWindow.index()-1, this._itemWindow.item());
    this._slotWindow.activate();
    this._slotWindow.refresh();
    this._itemWindow.deselect();
    this._itemWindow.refresh();
    this._compareWindow.refresh();
};

Scene_Badges.prototype.onItemCancel = function() {
    this._slotWindow.activate();
    this._itemWindow.deselect();
	this._compareWindow.setTempActor(this._actor);
};

Scene_Badges.prototype.onActorChange = function() {
    this.refreshActor();
	this._compareWindow.setTempActor(null);
	this._commandWindow.refresh();
    this._commandWindow.activate();
};

//==============================
// * Window_BadgesCommand
//==============================

function Window_BadgesCommand() {
    this.initialize.apply(this, arguments);
}

Window_BadgesCommand.prototype = Object.create(Window_EquipCommand.prototype);
Window_BadgesCommand.prototype.constructor = Window_BadgesCommand;

Window_BadgesCommand.prototype.makeCommandList = function() {
	var actor = SceneManager._scene.actor();
	var equip = ((actor._bp > 0) && ($gameParty.unequippedBadges().length > 0))
    this.addCommand(TextManager.equip2,   'equip', equip);
    this.addCommand(TextManager.clear,    'clear');
	this.addFinishCommand();
};

Window_BadgesCommand.prototype.setActor = function(actor) {
	if (this._actor == actor) {return};
	this._actor = actor;
	this.refresh();
};

Window_BadgesCommand.prototype.windowWidth = function() {
	return 312;
};

//==============================
// * Window_BadgesItem
//==============================

function Window_BadgesItem() {
    this.initialize.apply(this, arguments);
}

Window_BadgesItem.prototype = Object.create(Window_EquipItem.prototype);
Window_BadgesItem.prototype.constructor = Window_BadgesItem;

Window_BadgesItem.prototype.updateHelp = function() {
	this.setHelpWindowItem(this.item());
	this.updateCompare();
};

Window_BadgesItem.prototype.updateCompare = function() {
    if (this._actor && this.active && this._statusWindow) {
		var actor = JsonEx.makeDeepCopy(this._actor);
		actor.compareChangeBadge(this._slotId, this.item());
		this._statusWindow.setTempActor(actor);
    } else {
		this._statusWindow.setTempActor(this._actor);
	}
};

Window_BadgesItem.prototype.drawAllItems = function() {
    var topIndex = this.topIndex();
    for (var i = 0; i < this.maxPageItems()+1; i++) {
        var index = topIndex + i;
        if (index < this.maxItems()) {
            this.drawItem(index);
        }
    }
};

Window_BadgesItem.prototype.drawItem = function(index) {
	var item = this._data[index];
	if (item === null) {
		this.drawRemoveEquip(index);
    } else if (item) {
		var rect = this.itemRect(index);
		rect.width -= this.textPadding();
		this.changePaintOpacity(this._actor.canEquipBadge(item));
		this.drawItemName(item, rect.x, rect.y, rect.width);
		this.changePaintOpacity(1);
	};
};

Window_BadgesItem.prototype.drawRemoveEquip = function(index) {
    var rect = this.itemRect(index);
    rect.width -= this.textPadding();
    this.changePaintOpacity(true);
    var ibw = Window_Base._iconWidth + 4;
    this.resetTextColor();
    this.drawIcon(Yanfly.Icon.RemoveEquip, rect.x + 2, rect.y + 2);
    var text = Yanfly.Param.EquipRemoveText;
    this.drawText(text, rect.x + ibw, rect.y, rect.width - ibw);
};

Window_BadgesItem.prototype.makeItemList = function() {
    Yanfly.Item.Window_ItemList_makeItemList.call(this);
    this.listBadges();
};

Window_BadgesItem.prototype.listBadges = function() {
    if (!Yanfly.Param.ItemShEquipped) return;
    var results = [null];
	results = results.concat($gameParty.unequippedBadges());
    this._data = results;
};

Window_BadgesItem.prototype.processOk = function(index) {
	index = index || this._index;
	if (index == 0) {
		this.playOkSound();
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
	} else {
		var item = this._data[index];
		if (!item || !this._actor.canEquipBadge(item)) {
			this.playBuzzerSound();
			return;
		} else {
			Window_Selectable.prototype.processOk.call(this,index);
		};
	};
};

Window_EquipItem.prototype.setSlotId = function(slotId) {
    this._slotId = slotId
};

//==============================
// * Window_BadgesEquip
//==============================

function Window_BadgesEquip() {
    this.initialize.apply(this, arguments);
}

Window_BadgesEquip.prototype = Object.create(Window_EquipSlot.prototype);
Window_BadgesEquip.prototype.constructor = Window_BadgesEquip;

Window_BadgesEquip.prototype.maxItems = function() {
	var maxItems = 0;
	if (this._actor) {
		maxItems += this._actor.badgeEquips().length;
		if (this._actor.bpLeft() > 0) {maxItems++}
	};
	if (this.canDrawBPSlot()) {maxItems++}
	return maxItems;
};

Window_BadgesEquip.prototype.canDrawBPSlot = function() {
	return true;
}

Window_BadgesEquip.prototype.drawAllItems = function() {
    var topIndex = this.topIndex();
    for (var i = 0; i < this.maxPageItems(); i++) {
        var index = topIndex + i;
        if (index < this.maxItems()) {
            this.drawItem(index);
        }
    }
};

Window_BadgesEquip.prototype.drawBPSlot = function(wx, wy, ww) {
    var ibw = Window_Base._iconWidth + 4;
    this.resetTextColor();
    var text = Dragonfish.BP.BPabbr + " Left: " + this._actor.bpLeft();
    this.drawText(text, wx + ibw, wy, ww - ibw);
};

Window_BadgesEquip.prototype.drawItem = function(index) {
	if (!this._actor) return;
	var rect = this.itemRectForText(index);
	this.changeTextColor(this.systemColor());
	this.changePaintOpacity(this.isEnabled(index));
	if (index == 0) {
		this.drawBPSlot(rect.x, rect.y, ww2);
	} else {
		var ww1 = this._nameWidth;
		var ww2 = rect.width
		var item = this._actor.badgeEquips()[index-1];
		if (item) {
			this.drawItemName(item, rect.x, rect.y, ww2);
		} else {
			this.drawEmptySlot(rect.x, rect.y, ww2);
		}
		this.changePaintOpacity(true);
	};
};

Window_BadgesEquip.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    if (this._itemWindow) {
        this._itemWindow.setSlotId(this.index()-1);
    }
};

Window_BadgesEquip.prototype.updateHelp = function() {
	this.setHelpWindowItem(this.item());
};

Window_BadgesEquip.prototype.item = function() {
    return this._actor ? this._actor.badgeEquips()[this.index()] : null;
};

Window_BadgesEquip.prototype.processOk = function(index) {
	index = index || this._index;
	if (index == 0) {return};
	if (this._actor._lockedBadges.includes(index)) {return};
	if (this.isCurrentItemEnabled()) {
        this.playOkSound();
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
    } else {
        this.playBuzzerSound();
    }
};

//==============================
// * Window_BadgesCompare
//==============================

function Window_BadgesCompare() {
    this.initialize.apply(this, arguments);
}

Window_BadgesCompare.prototype = Object.create(Window_StatCompare.prototype);
Window_BadgesCompare.prototype.constructor = Window_BadgesCompare;


Window_BadgesCompare.prototype.refresh = function() {
    this.contents.clear();
    if (!this._actor) return;
	this.drawActorName(this._actor, 0, 0)
	this.drawActorLevel(this._actor, 168, 0)
    for (var i = 0; i < 8; ++i) {
        this.drawItem(0, this.lineHeight() * (i+1), i);
    }
};

//==============================
// * Game_Actor
//==============================

Game_Actor.prototype.equipSlots = function() {
    var slots = this.currentClass().equipSlots.slice();
    if (slots.length >= 2 && this.isDualWield()) slots[1] = 1;
	if (!SceneManager._scene.constructor.name == "Scene_Equip") {
		slots = slots.filter((eSlots) => eSlots == Dragonfish.BP.eTypeID)
	} else {
		slots = slots.filter((eSlots) => eSlots !== Dragonfish.BP.eTypeID)
	};
    return slots;
};

Game_Actor.prototype.badgeEquips = function() {
	var badgeEquips = [];
	var allEquips = this.equips();
    for (var i = 0; i < allEquips.length; i++) {
		if (allEquips[i] !== null) {
			var item = allEquips[i]
			if (item && item.atypeId == 1 && item.etypeId == Dragonfish.BP.eTypeID) {
				badgeEquips.push(item);
			}
		}
    }
	return badgeEquips;
};

Game_Actor.prototype.bpLeft = function() {
	var bpLeft = this._bp;
	for (var i=0; i<this.equips().length; i++) {
		var item = this.equips()[i];
		if (item && item.meta.BP) {
			bpLeft -= item.meta.BP;
		}
	};
	return bpLeft;
};

Game_Actor.prototype.canEquipBadge = function(item) {
	if (!this.canEquipArmor(item)) {return false};
	if (!(item.atypeId == 1 && item.etypeId == Dragonfish.BP.eTypeID)) {return false};
	if (!(item.meta && item.meta.BP)) {return false};
	var bp = item.meta.BP;
	if (bp > this._bp) {return false};
	return true;
};

Game_Actor.prototype.changeBadgeEquips = function(slotId, item) {
	if (this._lockedBadges.includes(slotId+1)) {return true};
	var firstIndex = this.equipSlots().length//+1
	slotId = slotId + firstIndex;
	if (!item) {
		if (!this._equips[slotId]) {return};
		this.tradeItemWithParty(item, this.equips()[slotId]);
		this._equips.splice(slotId,1);
		//this._equips[slotId] = null;
	} else {
		if (!this._equips[slotId]) this._equips[slotId] = new Game_Item();
		if (this.tradeItemWithParty(item, this.equips()[slotId]) && (!item || item.etypeId == Dragonfish.BP.eTypeID)) {
			this._equips[slotId].setObject(item);
			this.refresh();
		};
	};
};

Game_Actor.prototype.forceChangeBadge = function(slotId, item, splice) {
	var firstIndex = this.equipSlots().length
	slotId = slotId + firstIndex;
	if (!this._equips[slotId]) {
		if (!$gameParty.hasItem(item)) {return};
		$gameParty.loseItem(item, 1);
		this._equips.splice(slotId, 0, new Game_Item())
	} else {
		if (splice) {
			if (!$gameParty.hasItem(item)) {return};
			$gameParty.loseItem(item, 1);
			this._equips.splice(slotId, 0, new Game_Item())
		} else {
			if (!this.tradeItemWithParty(item, this.equips()[slotId])) {return};
		};
	};
    this._equips[slotId].setObject(item);
    this.releaseUnequippableItems(true);
    this.refresh();
};

Game_Actor.prototype.compareChangeBadge = function(slotId, item) {
	var firstIndex = this.equipSlots().length
	slotId = slotId + firstIndex;
	if (!this._equips[slotId]) {this._equips.splice(slotId, 0, new Game_Item())}
	this._equips[slotId].setObject(item);
    this.releaseUnequippableItems(true);
    this.refresh();
};

Game_Actor.prototype.clearBadges = function() {
	var badges = this.badgeEquips().length
	var j = 0
	for (var i=0; i<badges; i++) {
		if (this.changeBadgeEquips(j)) {j++};
	};
    this.refresh();
};

Game_Actor.prototype.releaseUnequippableItems = function(forcing) {
    for (;;) {
        var slots = this.equipSlots();
        var equips = this.equips();
        var changed = false;
        for (var i = 0; i < equips.length; i++) {
            var item = equips[i];
            if (item && (!this.canEquip(item) || item.etypeId !== slots[i])) {
				if (item.etypeId == Dragonfish.BP.eTypeID) {break};
                if (!forcing) {
                    this.tradeItemWithParty(null, item);
                }
                this._equips[i].setObject(null);
                changed = true;
            }
        }
        if (!changed) {
            break;
        }
    }
};

Game_Actor.prototype.changeBP = function(args) {
	var BP = args*1;
	if (BP == 0) {return};
	this._bp += BP;
	if (BP < 0) {
		if (this._bp < 0) {this._bp = 0};
		if (this.bpLeft() < this.minBP()) {
			var equipLength = this.badgeEquips().length
			for (var i=0; i<equipLength; i++) {
				this.changeBadgeEquips(this.badgeEquips().length-1);
				if (this.bpLeft() >= this.minBP()) {break}
			};
		}
	};
};

Game_Actor.prototype.minBP = function() {
	var min = 0;
	var badges = this.badgeEquips()
	for (var i=0; i<badges.length; i++) {
		if (this._lockedBadges.includes(i)) {
			var item = badges[i];
			var BP = item.meta.BP*1
			min += BP;
		};
	};
	return min;
};

_DragonFish_GameActorinitMembers = Game_Actor.prototype.initMembers
Game_Actor.prototype.initMembers = function(actorId) {
	_DragonFish_GameActorinitMembers.call(this,actorId);
	this._bp = 0;
	this._lockedBadges = [];
};

//==============================
// * Game_Party
//==============================

Game_Party.prototype.unequippedBadges = function() {
	var results = [];
	for (var i = 0; i < $gameParty.armors().length; i++) {
		var item = $gameParty.armors()[i]
		if (item.atypeId == 1 && item.etypeId == Dragonfish.BP.eTypeID) {
			results.push(item);
		};
	};
	return results;
};

Game_Party.prototype.totalBadges = function() {
	var results = this.unequippedBadges();
	for (var i = 1; i < $gameParty._actors.length+1; i++) {
		var actor = $gameActors._data[i];
		var actorBadges = actor.badgeEquips();
		for (var j = 0; j < actorBadges.length; j++) {
			results.push(actorBadges[j]);
		};
	};
	return results;
};


//=============================================================================
// Game_Interpreter
//=============================================================================

_DragonFish_GameInterp_PluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _DragonFish_GameInterp_PluginCommand.call(this, command, args)
	switch (command) {
		case 'GainBP':
			var actor = $gameActors._data[args[1]];
			if (!actor) {break};
			actor.changeBP(args[0]);
			break;
		case 'LoseBP':
			var actor = $gameActors._data[args[1]];
			if (!actor) {break};
			args[0] = args[0]*-1;
			actor.changeBP(args[0]);
			break;
		case 'PartyGainBP':
			for (var i=0; i<$gameParty._actors.length; i++) {
				var actor = $gameActors._data[$gameParty._actors[i]];
				if (!actor) {break};
				actor.changeBP(args[0]);
			};
			break;
		case 'PartyLoseBP':
			args[0] = args[0]*-1;
			for (var i=0; i<$gameParty._actors.length; i++) {
				var actor = $gameActors._data[$gameParty._actors[i]];
				if (!actor) {break};
				actor.changeBP(args[0]);
			};
			break;
		case 'ShowBadgeMenu':
			$gameSystem._showBadges = true;
			break;
		case 'HideBadgeMenu':
			$gameSystem._showBadges = false;
			break;
		case 'EnableBadgeMenu':
			$gameSystem._enableBadges = true;
			break;
		case 'DisableBadgeMenu':
			$gameSystem._enableBadges = false;
			break;
		case 'ForceEquipBadge':
			var actor = $gameActors._data[args[1]];
			if (!actor) {break};
			var item = $dataArmors[args[0]];
			if (!item || item.etypeId !== Dragonfish.BP.eTypeID) {break};
			var slotId = args[2]
			if (!slotId || slotId > actor.badgeEquips().length) {slotId = actor.badgeEquips().length};
			slotId = slotId*1
			var splice = false;
			if (args[3] == "true") {splice = true};
			actor.forceChangeBadge(slotId, item, splice);
			break;
		case 'LockEquipBadge':
			var actor = $gameActors._data[args[1]];
			if (!actor) {break};
			var slotId = args[0];
			if (!slotId) {break};
			slotId = slotId*1
			if (actor._lockedBadges.includes(slotId)) {break;}
			actor._lockedBadges.push(slotId);
			break;
		case 'UnlockEquipBadge':
			var actor = $gameActors._data[args[1]];
			if (!actor) {break};
			var slotId = args[0];
			if (!slotId) {break};
			slotId = slotId*1
			if (!actor._lockedBadges.includes(slotId)) {break;}
			var index = actor._lockedBadges.indexOf(slotId);
			actor._lockedBadges.splice(index,1);
			break;
		default:
			break;
	};
};