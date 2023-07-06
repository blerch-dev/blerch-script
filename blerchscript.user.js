// ==UserScript==
// @name         BlerchScript
// @namespace    https://www.destiny.gg/
// @version      1.1.2
// @description  extra utilities for embeds
// @author       blerch
// @match        *://*.destiny.gg/*
// @run-at       document-start
// ==/UserScript==

bs_run();

function bs_run() {
    const DebugLog = (...args) => {
        console.log('-- BlerchScript:', ...args);
    };

    const GetURL = (url) => {
        if(url === null)
          return 'about:blank';

        let curl = "parent=" + window.location.hostname;
        if(url.indexOf('?') >= 0) {
            curl = url + "&" + curl;
        } else {
            curl = url + "?" + curl;
        }

        return curl;
    };

    const CreateIframe = (url) => {
        let f = document.createElement('iframe');
        f.src = GetURL(url);
        f.id = "custom-iframe";
        f.style = "border: medium none; overflow: hidden; width: 100%; height: 100%;";
        f.scrolling = "no";
        f.allowFullscreen = "true";
        f.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";

        return f;
    };

    let currentEmbed = null;
    const SetCustomEmbed = (url) => {
        let wrap = document.getElementById('stream-wrap');
        DebugLog("SetCustomEmbed:", url);
        if(!(wrap instanceof Element)) { return DebugLog('No instance of element with id "stream-wrap"'); }

        let children = [...wrap.children], iframe = null;
        //console.log(wrap, children);
        for(let i = 0; i < children.length; i++) {
            //console.log(children[i].tagName);
            if(children[i].tagName === 'IFRAME') {
                iframe = children[i];
            }
        }

      	observer.disconnect();
        if(iframe instanceof Element) {
            iframe.src = GetURL(url);
        } else {
            iframe = CreateIframe(url);
            wrap.appendChild(iframe);
        }

        currentEmbed = iframe.src === "about:blank" ? null : iframe.src;
      	observer.observe(iframe, { attributes: true });
      	//document.getElementById('abyss-shield').style.display = 'none';
    };

    const CreateInput = (parent) => {
        if(!(parent instanceof Element)) {
            return DebugLog("No instance of parent element.", parent);
        }

        let ci = document.getElementById('bs-direct-player-elem')
        if(ci instanceof Element) {
            return DebugLog("Already instance of input, should be set up.", ci);
        }

        let elem = document.createElement('div');
        elem.style.width = "100%";
        elem.style.height = "100%";
        elem.style.display = "none";
        elem.style.flexDirection = "column";
        elem.style.position = "absolute";
        elem.style.top = "0px";
        elem.style.left = "0px";
        elem.style.backgroundColor = "#0009";
        elem.style.padding = "20px";
        elem.style.zIndex = "51";
        elem.id = "bs-direct-player-elem";

        let input = document.createElement('input');
        input.placeholder = "direct player url";
        input.id = "bs-direct-player-input";
        input.style.background = "rgb(27, 30, 31)";
        input.style.borderRadius = "40px";
        input.style.padding = "20px";
        input.style.height = "40px";
        input.style.color = "white";
        input.style.border = "4px solid #141617";
        elem.appendChild(input);

        let desc = document.createElement('p');
        desc.style.padding = "15px";
        desc.innerHTML = 'Controls:<br><br>- Backquote to hide/show<br>- Enter/NumpadEnter to set iframe source<br>- P to Randomize Highlights' +
        '<br><br>Requires direct player url (iframe source)<br>Examples:<br><br>#twitch/destiny = https://player.twitch.tv/?channel=destiny' +
        '<br>#youtube/G9rLVTzlGdY = https://www.youtube.com/embed/G9rLVTzlGdY?autoplay=1&playsinline=1' +
        '<br>strims.gg/zlxb = whatever the source at https://strims.gg/zlxb is (usually https://player.angelthump.com/?channel=zlxb)';
        //<div title="GIGACHAD" class="emote GIGACHAD">GIGACHAD </div><div title="UNLUCKY" class="emote UNLUCKY">UNLUCKY </div>
        elem.appendChild(desc);
        parent.appendChild(elem);
    };

    const ToggleInput = () => {
        let elem = document.getElementById("bs-direct-player-elem");
        if(!(elem instanceof Element)) { return DebugLog("No instance of input found."); }

        elem.style.display = elem.style.display === "none" ? "flex" : "none";
    };

    const handleEmbed = (clear = false) => {
      if(clear === true) {
        return SetCustomEmbed(null); 
      }

      let embed = window.location.hash?.split('/');
      if(embed[0] === "#youtube") {
        SetCustomEmbed(`https://www.youtube.com/embed/${embed[1]}?autoplay=1&playsinline=1&hd=1`);
      } else if(embed[0] === "#twitch") {
        SetCustomEmbed(`https://player.twitch.tv/?channel=${embed[1]}`);
      } else if(embed[0] === "#kick") {
        SetCustomEmbed(`https://player.kick.com/${embed[1]}?autoplay=true`);
      } else if(embed[0] === "#rumble") {
        SetCustomEmbed(`https://rumble.com/embed/${embed[1]}/?pub=7a20&rel=5&autoplay=2`)
      } else if(embed[0] === "#custom") {
        SetCustomEmbed(embed[1]);
      } else {
        SetCustomEmbed(null);
      }
    }

    window.addEventListener("hashchange", () => {
      DebugLog("Hash Change:", window.location.hash);
      handleEmbed();
    });

    document.addEventListener('DOMContentLoaded', () => {
      	document.getElementById("stream-block").remove();
      	document.getElementById("offline-text").remove();
      	document.getElementById("embed").remove();

        handleEmbed();

        document.getElementById("host-pill-icon").addEventListener("click", (e) => {
          if(currentEmbed != null) { handleEmbed(true) }
        });
      
        document.addEventListener('keydown', (e) => {
            //DebugLog(e.target.id, e.key, e.target?.id === "bs-direct-player-input", e.key === "Enter");
            if(e.code === 'Backquote') {
                ToggleInput();
            } else if(e.target?.id === "bs-direct-player-input" && e.key === "Enter") {
                SetCustomEmbed(e.target.value);
            } else if(e.code === 'KeyP') {
              enable_highlight_randomizer = !enable_highlight_randomizer;
              if(enable_highlight_randomizer)
                DebugLog("Enabled Highlight Randomizer");
              else
                DebugLog("Disabled Highlight Randomizer");
            } else {
              //DebugLog("Code:", e.code);
            }
        });

        DebugLog('Starting Script...........');
        CreateInput(document.getElementById('stream-panel'));

      let chat_list = document.getElementsByClassName('chat-lines')[0];
      if(chat_list instanceof Element) {
        	DebugLog("Connected Chat List");
      		chat_obv.observe(chat_list, { childList: true });
      	} else {
          DebugLog("Could not find chat list.");
        }
      });

  const observer = new MutationObserver((mut) => {
    DebugLog('IFrame Mutation:', mut);
  });

  const highlight_prob = 60;
  var enable_highlight_randomizer = false;
  const chat_obv = new MutationObserver((mut) => {
    if(!enable_highlight_randomizer)
      return;

    let elem = mut[0]?.addedNodes[0];
    if(elem instanceof Element) {
      let value = Math.random() * 100;
      if(value < highlight_prob) {
        let ret = elem.classList.add('msg-highlight');
      }
    } else {
      DebugLog("Not Element:", elem);
    }
  });
}