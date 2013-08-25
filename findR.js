/*
	findR.js v 0.6.0
	Author: sudhanshu yadav
	Copyright (c) 2013 Sudhanshu Yadav, released under the MIT license.
	www.ignitersworld.com
*/
;(function (window, document, undefined) {
    var globV = {
        //maintain status of cntrl button pressed
        ctrl: false,
        //maintain status of initialized and binded
        initialized: false,
        //to maintain all elements in which findR is propagated.
        elements: [],
        binded: false,
        selector: ''
    },
        //cache dom elements
        getDom = function (id) {
            if (!globV[id]) {
                globV[id] = document.getElementById(id);
            }
            return globV[id];
        }



        //return a findR object
    var findR = function (selector) {
        findR.fn.eventAssigner(window, 'load', function () {
            findR.fn.init(selector);
        });
    }

    //create protype of findR
    findR.fn = findR.prototype = {
        init: function (selector) {
            if (!selector || selector == document) {
                selector = document.getElementsByTagName('body')[0];
            } else {
                selector = document.getElementById(selector);
            }


            if (!selector) return;
            this.selector = selector;

            //to store it on element array
            globV.elements.push(selector);

            if (!globV.binded) {
                globV.binded = true;

                //add html
                this.addHtml();

                //to bind events
                this.bindKeyEvent();
            }

            //to bind click event on instance
            this.eventAssigner(selector, 'click', function (e) {
                //to change selector
                globV.selector = selector;
                e.stopPropagation();
            });

        },
        eventAssigner: function (elm, events, callback) {
            //for all browser other than ie
            if (window.addEventListener) {
                elm.addEventListener(events, callback, false)
            }
            //for ie	
            else {
                elm.attachEvent('on' + events, callback)
            }
        },
        eventRemove: function (elm, events, callback) {
            //for all browser other than ie

            if (window.removeEventListener) {
                elm.removeEventListener(events, callback)
            }

            //for ie	
            else {
                elm.detachEvent('on' + events, callback);
            }

        },
        bindKeyEvent: function () {

            //objects
            //find textbox
            var findT = getDom('findTextbx'),

                eventCallback = function (e) {

                    if (!globV.ctrl || globV.selector == '') return;

                    //to stop default exection
                    e.preventDefault();

                    var keyCode = e.keyCode;

                    //for find
                    if (keyCode == 70) {
                        //to open find and box
                        findR.fn.openToolbar();
                    }
                    if (keyCode == 78) {
                        findR.fn.focusNext();
                    }
                    if (keyCode == 80) {
                        findR.fn.focusPrev();
                    }
                    if (keyCode == 82) {
                        findR.fn.replaceMethod();
                    }

                }


                //to bind event on all keys
            this.eventAssigner(document, 'keydown', eventCallback);

            //bind key event on cntrl
            this.eventAssigner(document, 'keydown', function (e) {
                if (e.keyCode == 17) {
                    globV.ctrl = true;
                }
            });
            this.eventAssigner(document, 'keyup', function (e) {
                if (e.keyCode == 17) {
                    globV.ctrl = false;
                }
            });


            //bind key event on text box
            this.eventAssigner(findT, 'keyup', function (e) {
                if (e.keyCode != 17 && e.keyCode != 18) {
                    findR.fn.findTEvent();
                }
            });

            //bind event on replace button
            this.eventAssigner(getDom('replaceButn'), 'click', function () {
                findR.fn.replaceMethod();
            });

            //bind event on replace all button
            this.eventAssigner(getDom('replaceAllButn'), 'click', function () {
                findR.fn.replaceMethod(true);
            });

            //assign event on close button
            this.eventAssigner(getDom('closeFrToolbar'), 'click', function (e) {
                //to display toolbar and reset textbox values;
                getDom('frToolbar').style.display = 'none';
                getDom('frToolbarForm').reset();
                globV.initialized = false;

                //to unrap all highligted text
                findR.fn.unwrapTextNodes();

                e.stopPropagation();
            });

        },

        openToolbar: function () {
            var frToolbar = getDom('frToolbar');

            frToolbar.style.display = "block";

            //to make initialze flag true
            globV.initialized = true;

            //to initialize/reinitialize wrappers
            this.wrapTextNodes();

        },
        wrapTextNodes: function () {
            var nodes = [];
            //get all nodes

            function findNodes(element) {
                var childNodes = element.childNodes;
                if (childNodes.length > 0) {
                    for (var i = 0, ln = childNodes.length; i < ln; i++) {
                        var elm = childNodes[i];

                        //to remove find toolbar from searched
                        if (elm.id == 'frToolbar') {
                            continue;
                        } else if (elm.nodeType == Node.TEXT_NODE) {
                            if (nodes.indexOf(elm) == -1) {
                                nodes.push(elm);
                                var parent = elm.parentNode;

                                //if element is not already wrapped wrap text node to an span
                                if (parent.className != 'findRTextWrapper' && parent.parentNode.className != 'findRTextWrapper') {
                                    var newNode = document.createElement('span');
                                    newNode.setAttribute('class', 'findRTextWrapper');
                                    newNode.textContent = elm.textContent;
                                    parent.insertBefore(newNode, elm);
                                    parent.removeChild(elm);
                                }
                            }
                        } else {
                            findNodes(elm);
                        }
                    }
                }
            }

            //to get nodes
            findNodes(globV.selector);
            //store wrapper in this
            this.findRTextWrapper = document.getElementsByClassName('findRTextWrapper');


        },
        //to unwrap text nodes when toolbar is closed
        unwrapTextNodes: function () {
            var selElm = this.selectedElm,
                textWrap = this.findRTextWrapper,
                removeWrap = function (node) {
                    var parent = node.parentNode,
                        textNode = document.createTextNode(node.innerHTML);

                    parent.insertBefore(textNode, node);
                    parent.removeChild(node);

                };

            //to remove selected wrap
            while (selElm.length != 0) {
                removeWrap(selElm[0])
            }

            //to remove text wrap
            while (textWrap.length != 0) {
                removeWrap(textWrap[0])
            }


        },
        findTEvent: function () {
            if (globV.ctrl) return;

            var str = getDom('findTextbx').value,
                regexSearch = getDom('regexSearch').checked,
                matchCase = getDom('matchCase').checked,
                flag = matchCase ? 'g' : 'gi',
                regEx;

            //to change str according to regexSearch flag
            str = regexSearch ? str : this.escapeRegExp(str);

            //have an fallback for regex so error should not come	
            try {
                regEx = new RegExp('&[^;]+;|(' + str + ')', flag);
            } catch (e) {
                regEx = new RegExp('()', flag);
            };


            //loop on all text node and search for string
            var findRTextWrapper = this.findRTextWrapper,
                hltRegEx = /<span class="findRhighlighted">(.*?)\<\/span>/g,

                hltRegEx2 = /<span class="findRhighlighted findRhighlightedFocused">(.*?)<\/span>/g;


            for (var i = 0, ln = findRTextWrapper.length; i < ln; i++) {
                var elm = findRTextWrapper[i],
                    elmContent = elm.innerHTML;

                //to make already highlighted to normal
                elmContent = elmContent.replace(hltRegEx, '$1');
                elmContent = elmContent.replace(hltRegEx2, '$1');

                //if str is empty continue
                if (str == '') {
                    elm.innerHTML = elmContent;
                    continue;
                }

                //to highlight new text
                elmContent = elmContent.replace(regEx, function ($0, $1) {
                    return $0 == $1 ? '<span class="findRhighlighted">' + $1 + '</span>' : $0;
                });

                elm.innerHTML = elmContent;

            }

            //to add focused class on first one
            var selectedElm = document.getElementsByClassName('findRhighlighted');
            if (selectedElm.length != 0) {
                selectedElm[0].className = "findRhighlighted findRhighlightedFocused";
            }

            //store selected elmenet and focused elem on this
            this.selectedElm = selectedElm;
            this.focusedElm = document.getElementsByClassName('findRhighlightedFocused');
            this.focusindex = 0;

            this.scrollToFocus();

        },
        //replace method
        replaceMethod: function (allElm) {
            //replace string 
            var rstr = getDom('replaceTextbx').value;

            if (allElm) {
                var elm = Array.prototype.slice.apply(this.selectedElm);
            }
            //replace and got to next
            else {
                var elm = [this.focusedElm[0]];

                //to goto next elemnet if one element to be replaced
                this.focusNext();
            }

            while (elm.length != 0) {
                var parent = elm[0].parentNode,
                    tNode = document.createTextNode(rstr);
                parent.insertBefore(tNode, elm[0]);
                parent.removeChild(elm[0]);

                //to remove from array
                elm.splice(0, 1);

            }

        },


        focusNext: function () {
            if (this.selectedElm.length != 0) {
                var selElm = this.selectedElm,
                    elmFoc = this.focusedElm[0],
                    index = this.getIndexElm(selElm, elmFoc);

                //to make it circular
                if (index == selElm.length - 1) {
                    index = -1;
                }

                elmFoc.className = "findRhighlighted";
                selElm[index + 1].className = "findRhighlighted findRhighlightedFocused";

                //to go to selected area		
                this.scrollToFocus();
            }
        },
        focusPrev: function () {
            if (this.selectedElm.length != 0) {
                var selElm = this.selectedElm,
                    elmFoc = this.focusedElm[0],
                    index = this.getIndexElm(selElm, elmFoc);


                //to make it circular
                if (index == 0) {
                    index = selElm.length;
                }

                elmFoc.className = "findRhighlighted";
                selElm[index - 1].className = "findRhighlighted findRhighlightedFocused";

                //to go to selected area
                this.scrollToFocus();
            }
        },


        getIndexElm: function (collection, elm) {
            for (var i = 0, ln = collection.length; i < ln; i++) {
                if (collection[i] == elm) return i;
            }
            return -1;
        },
        escapeRegExp: function (str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },

        findPos: function (obj) {
            var curtop = 0;
            if (obj.offsetParent) {
                do {
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
                return [curtop];
            }
        },
        scrollToFocus: function () {
            var obj = this.focusedElm[0];

            if (obj) {
                var offsetTop = this.findPos(obj);
                window.scroll(0, offsetTop);
            }
        },
        addHtml: function () {
            if (!getDom('frToolbar')) {
                var findRtoolbar = document.createElement('div');
                findRtoolbar.innerHTML = '<form id="frToolbarForm">Find :<input type="textbox" id="findTextbx"/> &nbsp;&nbsp; Replace:<input type="textbox" id="replaceTextbx"/> &nbsp;&nbsp; Match Cases:<input type="checkbox" id="matchCase" checked="checked" /> &nbsp;&nbsp; Regex Search:<input type="checkbox" id="regexSearch"  /> <input type="button" id="replaceButn" value="Find And Replace"/>&nbsp; &nbsp;<input type="button" id="replaceAllButn" value="Replace All"/> &nbsp;&nbsp;&nbsp;<span id="closeFrToolbar">&times;</span></form>';
                findRtoolbar.id = "frToolbar";
                findRtoolbar.setAttribute('class', 'findRtoolbar');

                document.getElementsByTagName('body')[0].appendChild(findRtoolbar);
            }
        }

    };

    //make findR global
    window.findR = findR;
})(window, document);