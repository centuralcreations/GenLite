// ==UserScript==
// @name         GenLite Recipe Recorder
// @namespace    GenLite
// @version      0.1.2
// @description  try to take over the world!
// @author       dpe#0175
// @match        https://play.genfanad.com/play/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=genfanad.com
// @grant        none
// ==/UserScript==
(function() {
    class GenLiteRecipeRecorder {
        constructor() {

            /* stores state needed for recording crafting */
            this.crafting = {
                isCrafting: false,
                recipe: undefined,
                recipeName: undefined,
                prevInventory: undefined,
                prevVerb: undefined,
                stTime: 0,

                resultsList: {}
            };

        }

        init() {
            window.genlite.registerModule(this);
        }

        action(verb, params) {
            if (params.hasOwnProperty('action')) {
                if (params.action.hasOwnProperty('recipe')) {
                    this.crafting.isCrafting = true;
                    this.crafting.recipe = params.action.recipe;
                    this.crafting.prevInventory = INVENTORY.items;
                    this.crafting.recipeName = params.action.recipe;
                    for (i in params.action.params) // if params is set here then record a complex recipe name
                        this.crafting.recipeName = this.crafting.recipeName.concat("__", i, params.action.params[i]);
                    if (this.crafting.resultsList[this.crafting.recipeName] === undefined)
                        this.crafting.resultsList[this.crafting.recipeName] = {
                            input: {},
                            output: {}
                        };
                }
            }
        }

        handle(verb, payload) {
            let itemList = {};
            /* filters NETWORK messages from other players
                some messages have no ID set those are always unique to the player
            */
            if (this.crafting.isCrafting &&
                (payload.id == PLAYER.id || payload.player == PLAYER.id ||
                    (payload.id === undefined && payload.player === undefined))) {
                /* TODO? I dont like relying on NETWORK message orders
                    but after filtering I have never seen them come in a different one
                */
                if (verb == 'inventory') {
                    if (this.crafting.prevVerb == 'inventory') {
                        for (i in this.crafting.prevInventory) {
                            /* add up the quantities of the inventory */
                            if (itemList[this.crafting.prevInventory[i].item] === undefined)
                                itemList[this.crafting.prevInventory[i].item] = 0;
                            if (this.crafting.prevInventory[i].quantity === undefined) {
                                itemList[this.crafting.prevInventory[i].item] += 1;
                            } else {
                                itemList[this.crafting.prevInventory[i].item] += this.crafting.prevInventory[i].quantity;
                            }
                        }
                        /* subtract the new inventory */
                        for (i in payload) {
                            if (itemList[payload[i].item] === undefined)
                                itemList[payload[i].item] = 0;
                            if (payload[i].quantity === undefined) {
                                itemList[payload[i].item] -= 1;
                            } else {
                                itemList[payload[i].item] -= payload[i].quantity;
                            }
                        }
                        /* negative values are outputs
                            positive are inputs
                        */
                        for (i in itemList) {
                            if (itemList[i] < 0) {
                                if (this.crafting.resultsList[this.crafting.recipeName].output[i] === undefined)
                                    this.crafting.resultsList[this.crafting.recipeName].output[i] = 0;
                                this.crafting.resultsList[this.crafting.recipeName].output[i] -= itemList[i];
                            } else if (itemList[i] > 0) {
                                if (this.crafting.resultsList[this.crafting.recipeName].input[i] === undefined)
                                    this.crafting.resultsList[this.crafting.recipeName].input[i] = 0;
                                this.crafting.resultsList[this.crafting.recipeName].input[i] += itemList[i];
                            }
                        }
                        this.crafting.prevInventory = structuredClone(payload);
                    }
                    /* determines if crafting is done by looking for the stop animation
                        that comes only after the crafting animation
                    */
                } else if (verb == 'animation') {
                    if (payload.anim) {
                        this.crafting.stTime = payload.timestamp;
                    } else if (this.crafting.stTime < payload.timestamp && this.crafting.stTime != 0) {
                        this.crafting.isCrafting = false;
                        this.crafting.stTime = 0;
                    }
                }
                this.crafting.prevVerb = verb;
            }
        }

    }


    window.GenLiteRecipeRecorder = new GenLiteRecipeRecorder();

    let gameLoadTimer = setInterval(function() {
        try {
            if (window.genlite !== undefined) {
                window.GenLiteRecipeRecorder.init();
                clearInterval(gameLoadTimer);
            }
        } catch (e) {}
    }, 1000);
})();
