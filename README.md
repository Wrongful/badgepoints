## Introduction

This plugin adds a new "Badge" system, where instead of a set number
of slots, the player has "points" that can change throughout gameplay;
they can equip a small number of powerful badges, or a larger number
of lesser ones. This plugin is named after the Badges from Paper Mario,
but is also similar to the Charms from Hollow Knight, or the Medals from
Bug Fables, for example.

Badges all fall under a single Equipment Type, as defined in the plugin
parameters. All other equipment types and systems should be the same,
meaning you can have both Badges and normal Equipment.

Define in the plugin parameters which Equipment Type you want to use for
Badges; this eType will then no longer be equippable in any actor's
default Equip menu. Then, make a Badge by setting any Armor to that
same eType, and make sure their Armor Type is set to 1 as well ('General
Armor').

From there, make the Badge have whatever unique traits you want!

## Compatibility

Yanfly's EquipCore is required. I don't know of any other incompatibilities,
but beware of any plugins where an actor's Equip Slots can change
throughout gameplay (such as Yanfly's ClassChangeCore). 

## Notetags

Armor Notetags:
<BP:x>
    Set x to the number of Badge Points you want this Badge to be worth.
    The player can only equip it if they have at least this many BP
    available.

## Plugin Commands

* GainBP 5 1

Gives 5 BP to Actor 1.

LoseBP 5 1
Takes 5 BP to Actor 1. (NOTE: If an actor's BP falls into the
negatives, it will automatically unequip Badges until their
BP is at least 0 again.)

PartyGainBP 5
Gives 5 BP to the entire current party.

PartyLoseBP 5
Takes 5 BP from the entire current party.

ShowBadgeMenu
Shows the Badge option in the Main Menu.

HideBadgeMenu
Hides the Badge option in the Main Menu.

EnableBadgeMenu
Enables the Badge option in the Main Menu.

DisableBadgeMenu
Disables the Badge option in the Main Menu.

(NOTE: The following plugin commands call for specific indexes in your
actor's equipped Badges. Because Badges can have their indexes
fluctuate by design, these commands are not always reliable.)

ForceEquipBadge 8 3 1 true
Automatically makes Actor 3 equip the Badge with the armor ID of 8
in slot 1. If "true," it will be added along with your other equips;
by default, it will replace whatever Badge is currently in slot 1.
(Note that this *does* still use BP, so be careful not to send an
actor's BP into the negatives.)

LockEquipBadge 1 2
Locks Badge slot 1 for Actor 2; the player will not be able to
change it manually in the menu.

UnlockEquipBadge 1 2
Unlocks Badge slot 1 for Actor 2, if it was locked previously.

## Main Menu Manager

If you're using Yanfly's Main Menu Manager, add this to that plugin'same
commands:

Name: Dragonfish.BP.MenuName
Symbol: badges
Show: $gameSystem.isShowBadges()
Enabled: $gameSystem.isEnableBadges()
Ext: 
Main Bind: this.commandBadges.bind(this)
Actor Bind: SceneManager.push(Scene_Badges)

Remember to disable "Auto Add Menu" and "Auto Place Menu" from this
plugin's parameters.

## Permissions

This plugin may be used freely in any projects, commercial or private, so
long as credit is given to Wrongful.

## Changelog

Version 1.00:
- Finished!
