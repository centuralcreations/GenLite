// ==UserScript==
// @name         _GenLite Github Module
// @namespace    GenLite
// @version      0.1.2
// @description  There are some known issues to this such as tampermonkey headers not functioning properly when loading in this way.
// @author       Bonesdog
// @match        https://play.genfanad.com/play/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=genfanad.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    const REPO_USER = "Retoxified"
    const REPO_NAME = "GenLite"
    const BRANCH = "main"

    GM_xmlhttpRequest({ method : "GET",
                       url : `https://api.github.com/repos/${REPO_USER}/${REPO_NAME}/git/trees/${BRANCH}?recursive=1`,
                       onload : ( event ) => {
                           const { tree } = JSON.parse( event.responseText )
                           tree.forEach( ( plugin ) => {
                               const url = new URL(`https://github.com/${REPO_USER}/${REPO_NAME}/raw/main/${plugin.path}`)

                               if(plugin.path.endsWith(".js") && !plugin.path.startsWith('_')) {
                                   GM_xmlhttpRequest({ method : "GET",
                                                      url : url.href,
                                                      onload : ( event ) => {
                                                          const responseText = event.responseText
                                                          let head, embed_script

                                                          head = document.head || document.getElementsByTagName('head')[0]

                                                          embed_script = document.createElement("script")
                                                          embed_script.type = "text/javascript"
                                                          embed_script.innerHTML = responseText

                                                          head.appendChild( embed_script )
                                                      }}) //require( url.href ) why can this not be done instead?
                               }
                           })
                       }})
})()
