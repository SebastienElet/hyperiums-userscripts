// ==UserScript==
// @name        Hyperiums forum highlighting
// @namespace   http://github.com/Nasga/hyperiums-greasemonkey/
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @include     http://hyp2.hyperiums.com/servlet/Forums*
// @version     40
// @grant       none
// ==/UserScript==

/* global $:false */

"use strict";

var storageAvailable = false;

if (typeof(Storage) !== "undefined") {
    storageAvailable = true;
}
var forumJSon = getForumStorage();

function storeForumPostDate(forumThreadId, forumPostDate) {
    var dummy;
    if (!forumJSon[forumThreadId]) {
        forumJSon[forumThreadId] = forumPostDate;
        return true;
    }
    var storedForumPostDate = new Date(forumJSon[forumThreadId]);
    if (forumPostDate > storedForumPostDate) {
        forumJSon[forumThreadId] = forumPostDate;
    }
    return true;
}

function hypDateToDate(hypDate) {
    return new Date(
        hypDate.substr(0, 4),
        parseInt(hypDate.substr(5, 2)) - 1,
        hypDate.substr(8, 2),
        hypDate.substr(11, 2),
        hypDate.substr(14, 2),
        hypDate.substr(17, 2),
        0
    )
}

function needHighlight(threadId, forumPostDate) {
    if (forumJSon[threadId]) {
        storedForumDate = new Date(forumJSon[threadId]);
    } else {
        storedForumDate = new Date(1970, 0, 1);
    }
    if (forumPostDate > storedForumDate) {
        return true;
    }
    return false;
}

function getForumStorage() {
    if (!storageAvailable) {
        return "";
    }
    var forumStorage = localStorage.forumStorage;
    if (forumStorage) {
        return JSON.parse(forumStorage);
    }
    else {
        return {};
    }
}

function setForumStorage(forumStorageIn) {
    localStorage.forumStorage = JSON.stringify(forumStorageIn);
    return true;
}

function getUrlVars(urlIn) {
    var vars = {};
    var parts = urlIn.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

if ((window.location.search.indexOf("action=fenter") > -1) ||
    ($('body center center span.info:not(.bigtext)').length > 0)) {
    if (storageAvailable) {
        var link = "";
        var threadId = "";
        var forumThreadLastPost;

        // Create Read All button
        $('body ul.solidblockmenu2').append('<li><a class="megaTextItem" id="markAllRead">Mark all Read</li>');
        // on click Read All button, store last posts dates per threadid to forumJSon
        $('#markAllRead').click(function () {
                $('body center form tr:not(#forumArray)')
                    .each(function (idx, elt) {
                        if ($(elt).find('#noStyle').length < 1) {
                            link = $(elt).find('td:not(.hc) a:first').prop("href");
                            threadId = getUrlVars(link)["threadid"];
                            forumThreadLastPost = hypDateToDate($(elt).find('td.hc:eq(2)').text());
                            if (forumJSon[threadId]) {
                                storedForumDate = new Date(forumJSon[threadId]);
                            } else {
                                storedForumDate = new Date(1970, 0, 1);
                            }
                            if (forumThreadLastPost > storedForumDate) {
                                forumJSon[threadId] = forumThreadLastPost.toUTCString();
                                $(elt).find('td:not(.hc) a:first').css("font-style", "normal");
                            }
                        }
                    }
                )
                setForumStorage(forumJSon);
            }
        );


        $('body center form tr:not(#forumArray)')
            .each(function (idx, elt) {
                link = $(elt).find('td:not(.hc) a:first').prop("href");
                threadId = getUrlVars(link)["threadid"];
                forumThreadLastPost = hypDateToDate($(elt).find('td.hc:eq(2)').text());
                if (needHighlight(threadId, forumThreadLastPost)) {
                    $(elt).find('td:not(.hc) a:first').css("font-style", "italic");
                }
            }
        );


    }
}

if (window.location.search.indexOf("action=fdispmsg") > -1) {
    if (storageAvailable) {
        var forumPostDate;
        var forumThreadId;
        var storedForumDate;
        forumThreadId = getUrlVars(window.location.href)["threadid"];

        if (forumJSon[forumThreadId]) {
            storedForumDate = new Date(forumJSon[forumThreadId]);
        } else {
            storedForumDate = new Date(1970, 0, 1);
        }
        $('body table.sender td.player')
            .each(function (idx, elt) {
                forumPostDate = hypDateToDate($(elt).text().substr(0, 19));
//            alert(forumPostDate);
                if (forumPostDate > storedForumDate) {
                    forumJSon[forumThreadId] = forumPostDate.toUTCString();
                }
            }
        );
        setForumStorage(forumJSon);
    }
}

if (window.location.search.indexOf("action=lastmsg") > -1) {
    if (storageAvailable) {
        var forumPostDate;
        var forumThreadId;
        var storedForumDate;
        var link = "";

        $('body center table.hc:not(.body)')
            .each(function (idx, elt) {
                if ($(elt).width() > 460) {
                    link = $(elt).find('tr.msgForum td.hc a').attr("href");
//                if (link != 'undefined') {
                    forumThreadId = getUrlVars(link)["threadid"];
                    if (forumJSon[forumThreadId]) {
                        storedForumDate = new Date(forumJSon[forumThreadId]);
                    } else {
                        storedForumDate = new Date(1970, 0, 1);
                    }
                    forumPostDate = hypDateToDate($(elt).find('table.sender td.player').text().substr(0, 19));
                    if (forumPostDate > storedForumDate) {
                        forumJSon[forumThreadId] = forumPostDate.toUTCString();
                    }
                }
            }
        );
        setForumStorage(forumJSon);
    }
}
