const { ipcRenderer } = require('electron');

var sidePanelActions;

ipcRenderer.on('domReady', function(event, data) {
    window.addEventListener('unload', function() {
        ipcRenderer.sendToHost('unload', false);
    }, false);
    ipcRenderer.sendToHost('domReady', true);
});

ipcRenderer.on('fromUS', function(event, args) {
    if (args.key && args.action) {
        var key = args.key;
        var action = args.action;
        switch (action) {
            case 'getMeInfo':
                sendrequest('https://www.linkedin.com/voyager/api/me', function(res) {
                    ipcRenderer.sendToHost(key, res);
                });
                break;
            case 'readNetworkInfo':
                sendrequest('https://www.linkedin.com/voyager/api/identity/profiles/' + args.data.profile + '/networkinfo', function(res) {
                    ipcRenderer.sendToHost(key, res);
                });
                break;
            case 'extractProfile':
                sidePanelActions.extractProfileFromPage(args.data.appData.xpaths, args.data.distance, args.data.appData.minDistanceForExtraction, args.data.extractFullProfile, function(res) {
                    ipcRenderer.sendToHost(key, res);
                });
                break;
            case 'stopExtraction':
                sidePanelActions.stopExtraction();
                ipcRenderer.sendToHost(key, { success: true });
                break;
            case 'extractCompany':
                sidePanelActions.extractCompanyFromPage(args.data.appData.companyXpaths, args.data.extractFullCompany, function(res) {
                    ipcRenderer.sendToHost(key, res);
                });
                break;
            case 'getCurrentUrl':
                ipcRenderer.sendToHost(key, { url: window.location.href });
                break;
        }
    }
});

// Get the cross foreign token and call the voyager API
function sendrequest(url, sendResponse) {
    let cookie = readCookie(document.cookie, "JSESSIONID");
    if (cookie) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("csrf-token", cookie);
        xhr.setRequestHeader("X-RestLi-Protocol-Version", "2.0.0");
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                localStorage.lastStatus = xhr.status;
                if (xhr.status == 200) {
                    let result = xhr.responseText;
                    sendResponse(JSON.parse(result));
                } else {
                    sendResponse({ error: xhr.statusText, status: xhr.status });
                }
            }
        };
        xhr.send();
    }
}

// Method to read a cookie read the cookie 
function readCookie(cookie, name) {
    let nameEQ = name + "=";
    let ca = cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length).replace(/"+/g, '');
        }
    }
    return null;
}

class SidePanelActions {
    constructor() {
        this.extractionStopped = false;
        this.localEmailObjArray = [];
        this.localcontactInfoObjArray = [];
        this.extractionStopped = false;
        this.xpathExtractionStopped = null;
    }
    stopExtraction() {
        this.extractionStopped = true;
    }
    checkStopByElements() {
        let _this = this;
        let xpathES;
        xpathES = _this.xpathExtractionStopped;
        if (!xpathES) {
            xpathES = localStorage.getItem("xpathExtractionStopped");
        }
        let elementToCheck = _this.getElementsByXPath(xpathES, document);
        return elementToCheck.length > 0;
    }
    checkExtractionStopped(sendResponse, scrollInterval = null) {
        if (this.checkStopByElements()) {
            if (scrollInterval) clearInterval(scrollInterval);
            sendResponse({ error: "Extraction stopped due to LinkedIn logout" });
            throw "Extraction stopped due to LinkedIn logout";
        }
        if (this.extractionStopped) {
            if (scrollInterval) clearInterval(scrollInterval);
            sendResponse({ error: true });
            throw "Extraction Stopped";
        }
    }
    extractProfileFromPage(xpath, distance, minDistance, extractFullProfile, sendResponse) {
        let _this = this;
        try {
            _this.xpathExtractionStopped = _this.getXpathByKey("USElementsToCheckStop", xpath);
            if (_this.xpathExtractionStopped) {
                localStorage.setItem("xpathExtractionStopped", _this.xpathExtractionStopped);
            }
            // Se revisa si el perfil cargo bien.
            let unavailableClassElement = document.querySelector(".profile-unavailable");
            let currentUrl = window.location.href;
            let profileNotFoundElement = _this.getElementByXPathKey(xpath, document, "USUnavailableProfileElement");
            if (unavailableClassElement || currentUrl.indexOf("/in/unavailable") > -1 || profileNotFoundElement) {
                sendResponse({ error: "Does not exist or is unavailable" });
            } else {
                let inLinkedInId = "";
                let encLinkedInId = "";
                let scrollInterval = setInterval(async function() {
                    window.scrollBy(0, 150);
                    _this.checkExtractionStopped(sendResponse, scrollInterval);
                    // Check when get to the button to clear the interval.
                    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                        // Stops the scroll
                        clearInterval(scrollInterval);
                        window.scrollBy(0, 0);
                        _this.checkExtractionStopped(sendResponse, scrollInterval);
                        // Se obtienen los code.
                        let codes = _this.getElementsByXPath("//code", document);
                        if (codes) {
                            let networkInfoBodyId;
                            for (let i = 0; i < codes.length; i++) {
                                let text = codes[i].innerHTML.trim();
                                if (text) {
                                    try {
                                        let obj = JSON.parse(text);
                                        if (obj && obj.request && obj.request.indexOf("/networkinfo") > -1 && obj.body) {
                                            networkInfoBodyId = obj.body;
                                            // Se intenta obtener el id de LinkedIn "in" o "enc".
                                            let requestArr = obj.request.split('/');
                                            let identifier = requestArr[requestArr.indexOf("profiles") + 1];
                                            if (identifier.startsWith("ACoAA")) {
                                                encLinkedInId = "/in/" + identifier;
                                            } else {
                                                inLinkedInId = "/in/" + identifier;
                                            }
                                            break;
                                        }
                                    } catch (err) {}
                                }
                            }
                            if (networkInfoBodyId) {
                                let networkInfoBody = document.getElementById(networkInfoBodyId);
                                if (networkInfoBody) {
                                    let networkInfoText = networkInfoBody.innerHTML.trim();
                                    if (networkInfoText) {
                                        try {
                                            let networkInfoObj = JSON.parse(networkInfoText);
                                            if (networkInfoObj && networkInfoObj.data) {
                                                // Se intenta obtener el id de LinkedIn "enc".
                                                if (!encLinkedInId && networkInfoObj.data.entityUrn) {
                                                    let entityUrnArr = networkInfoObj.data.entityUrn.split(':');
                                                    encLinkedInId = "/in/" + entityUrnArr[entityUrnArr.length - 1];
                                                }
                                                // Se intenta obtener la distancia al perfil si no se tenía ya.
                                                if (distance === -1 && networkInfoObj.data.distance && networkInfoObj.data.distance.value) {
                                                    let distanceValueArr = networkInfoObj.data.distance.value.split('_');
                                                    let distanceText = distanceValueArr[distanceValueArr.length - 1];
                                                    if (distanceText && !isNaN(distanceText)) {
                                                        distance = +distanceText;
                                                    }
                                                }
                                            }
                                        } catch (err) {}
                                    }
                                }
                            }
                        }
                        // Si no se pudo obtener desde los code, se intenta obtener la distancia al perfil con xpath.
                        if (distance === -1) {
                            let distanceElement = _this.getElementByXPathKey(xpath, document, "PEConnectionLevel");
                            if (distanceElement) {
                                let distanceText = distanceElement.innerHTML.trim();
                                if (distanceText && !isNaN(distanceText.charAt(0))) {
                                    distance = +distanceText.charAt(0);
                                }
                            }
                        }
                        let profileViewCodeExists = _this.getElementsByXPath(".//code[contains(text(),'/profileView')]", document).length > 0;
                        if (distance === -1 || distance > minDistance) {
                            if (profileViewCodeExists) {
                                let profileViewHeader = _this.getElementsByXPath(".//code[contains(text(),'/profileView')]", document)[0];
                                if (profileViewHeader) {
                                    let profileViewHeaderText = profileViewHeader.innerText.trim();
                                    try {
                                        let profileViewHeaderObj = JSON.parse(profileViewHeaderText);
                                        if (profileViewHeaderObj && profileViewHeaderObj.body) {
                                            let profileViewBody = document.getElementById(profileViewHeaderObj.body);
                                            if (profileViewBody) {
                                                let profileViewBodyObj = JSON.parse(profileViewBody.innerText.trim());
                                                if (profileViewBodyObj && profileViewBodyObj.data && profileViewBodyObj.included) {
                                                    let positionViewUrn = profileViewBodyObj.data["positionView"] ? profileViewBodyObj.data["positionView"] : profileViewBodyObj.data["*positionView"];
                                                    if (positionViewUrn) {
                                                        let positionViewObj = profileViewBodyObj.included.find(i => i.entityUrn == positionViewUrn);
                                                        if (positionViewObj) {
                                                            let positions = positionViewObj["elements"] ? positionViewObj["elements"] : positionViewObj["*elements"];
                                                            if (positions && positions.length > 0) {
                                                                if (!positions.find(positionUrn => {
                                                                        let positionObj = profileViewBodyObj.included.find(i => i.entityUrn == positionUrn);
                                                                        return positionObj && positionObj.title && positionObj.companyName;
                                                                    })) {
                                                                    sendResponse({ error: "Distance: Couldn't find any valid experience" });
                                                                    return;
                                                                }
                                                            } else {
                                                                sendResponse({ error: "Distance: Couldn't find any experience" });
                                                                return;
                                                            }
                                                        }
                                                    } else {
                                                        sendResponse({ error: "Distance: Couldn't find any experience" });
                                                        return;
                                                    }
                                                }
                                            }
                                        }
                                    } catch (err) {}
                                }
                            } else {
                                // Se valida si el nombre del perfil es visible.
                                let nameElement = _this.getElementByXPathKey(xpath, document, "PEProfileName");
                                if (!nameElement) {
                                    sendResponse({ error: "Distance: Couldn't find profile name" });
                                    return;
                                }
                                // Se valida si al menos una experiencia es visible.
                                let experienceContainerElement = _this.getElementByXPathKey(xpath, document, "PEExperiencesContainer");
                                if (experienceContainerElement) {
                                    let validExperience = _this.getElementByXPathKey(xpath, document, "USValidExperience");
                                    if (!validExperience) {
                                        sendResponse({ error: "Distance: Couldn't find any valid experience" });
                                        return;
                                    }
                                } else {
                                    sendResponse({ error: "Distance: Couldn't find any experience" });
                                    return;
                                }
                            }
                        }
                        await _this.Sleep(_this.GetRandom(3000, 5000));
                        // open the see more education panel
                        _this.clickInputElementByXpathKey(xpath, document, "PEButtonExpandEducations");
                        _this.checkExtractionStopped(sendResponse, scrollInterval);
                        await _this.Sleep(_this.GetRandom(3000, 5000));
                        // open the summary panel
                        _this.clickInputElementByXpathKey(xpath, document, "PEButtonExpandSummary");
                        _this.checkExtractionStopped(sendResponse, scrollInterval);
                        await _this.Sleep(_this.GetRandom(3000, 5000));
                        // Mientras exista un botón "Mostrar más", se expande el tab de recomendaciones activo.
                        while (_this.clickInputElementByXpathKey(xpath, document, "PEExpandActiveRecommendationTab")) {
                            await _this.Sleep(_this.GetRandom(1000, 3000));
                            _this.checkExtractionStopped(sendResponse, scrollInterval);
                        }
                        // Se activa el tab de recomendaciones inactivo.
                        if (_this.clickInputElementByXpathKey(xpath, document, "PEInactivateRecommendationTab")) {
                            await _this.Sleep(_this.GetRandom(3000, 5000));
                            // Mientras exista un botón "Mostrar más", se expande el tab de recomendaciones activo.
                            while (_this.clickInputElementByXpathKey(xpath, document, "PEExpandActiveRecommendationTab")) {
                                await _this.Sleep(_this.GetRandom(1000, 3000));
                                _this.checkExtractionStopped(sendResponse, scrollInterval);
                            }
                        }
                        await _this.Sleep(_this.GetRandom(3000, 5000));
                        // Array para guardar el HTML de cada sección de logros completamente expandida.
                        let accomplishmentSectionHtmlArr = [];
                        // Se obtienen los conteos de cada sección de logros.
                        let sectionCountArr = _this.getElementsByXPath(_this.getXpathByKey("USPEAccomplishmentSectionCount", xpath), document);
                        for (let i = 0; i < sectionCountArr.length; i++) {
                            // Se valida si la sección debe expandirse (tiene más de 10 elementos o no existe el elemento <code> con el request a 'profileView').
                            let shouldExpand = (+sectionCountArr[i].innerText.trim()) > 10 || !profileViewCodeExists;
                            if (shouldExpand) {
                                let expandButton = _this.getElementsByXPath(_this.getXpathByKey("USPEExpandAccomplishmentSection", xpath), document)[i];
                                if (expandButton) {
                                    // Se expande la sección de logros.
                                    expandButton.click();
                                    await _this.Sleep(_this.GetRandom(1000, 3000));
                                    // Mientras exista un botón "Mostrar más", se expande la sección de logros.
                                    while (_this.clickInputElementByXpathKey(xpath, document, "USPEShowMoreAccomplishmentSection")) {
                                        await _this.Sleep(_this.GetRandom(1000, 3000));
                                        _this.checkExtractionStopped(sendResponse, scrollInterval);
                                    }
                                }
                            }
                            // Se obtiene el HTML de la sección de logros y se guarda en el array.
                            accomplishmentSectionHtmlArr.push(_this.getElementsByXPath(_this.getXpathByKey("USPEAccomplishmentSection", xpath), document)[i].outerHTML);
                        }
                        // Se reemplaza el HTML de las secciones por su versión expandida.
                        let accomplishmentSection = _this.getElementsByXPath(_this.getXpathByKey("USPEAccomplishmentSectionList", xpath), document);
                        if (accomplishmentSection.length > 0 && accomplishmentSectionHtmlArr.length > 0) {
                            let accomplishmentsHTML = "";
                            accomplishmentSectionHtmlArr.forEach(as => accomplishmentsHTML += as);
                            accomplishmentSection[0].innerHTML = accomplishmentsHTML;
                        }
                        // Open the see TopSkills panel
                        _this.clickInputElementByXpathKey(xpath, document, "PEButtonExpandTopSkills");
                        _this.checkExtractionStopped(sendResponse, scrollInterval);
                        await _this.Sleep(_this.GetRandom(3000, 5000));
                        // Array para guardar el HTML completo de los modals de endorsements.
                        let skillEndorsementModalHtmlArr = [];
                        // Se obtienen los botones para mostrar el modal con la lista completa de endorsement de cada skill.
                        let showEndorsementButtonArr = _this.getElementsByXPath(_this.getXpathByKey("USPEShowSkillsEndorsementFullModal", xpath), document);
                        let skillEndorsementsToExtract = extractFullProfile ? showEndorsementButtonArr.length : (showEndorsementButtonArr.length > 3 ? 3 : showEndorsementButtonArr.length);
                        for (let i = 0; i < skillEndorsementsToExtract; i++) {
                            // Se abre el modal.
                            showEndorsementButtonArr[i].click();
                            await _this.Sleep(_this.GetRandom(2000, 3000));
                            // Se obtiene el elemento con el contenido del modal.
                            let modalContentElement = _this.getElementByXPathKey(xpath, document, "USPEEndorsersModalContent");
                            if (modalContentElement) {
                                // Nos aseguramos de hacer scroll del contenido del modal por el lazy load de los endorsers.
                                var prevScrollHeight
                                var scrolledTimes = 0;
                                do {
                                    prevScrollHeight = modalContentElement.scrollHeight;
                                    modalContentElement.scrollBy(0, modalContentElement.scrollHeight);
                                    scrolledTimes++;
                                    if (scrolledTimes > 0) {
                                        await _this.Sleep(_this.GetRandom(1000, 2000));
                                    }
                                } while (prevScrollHeight < modalContentElement.scrollHeight && scrolledTimes < 10)
                            }
                            // Se obtiene el HTML del modal y se agrega al array.
                            skillEndorsementModalHtmlArr.push(_this.getElementsByXPath(_this.getXpathByKey("USPESkillsEndorsementFullContent", xpath), document)[0].outerHTML);
                            // Se cierra el modal
                            _this.clickInputElementByXpathKey(xpath, document, "USPESkillsEndorsementFullDismissButton")
                            await _this.Sleep(_this.GetRandom(1000, 3000));
                        }
                        // Se agrega un elemento custom al final del perfil de LinkedIn con la información obtenida.
                        if (skillEndorsementModalHtmlArr.length > 0) {
                            let skillEndorsementsHTML = "";
                            skillEndorsementModalHtmlArr.forEach(se => skillEndorsementsHTML += se);
                            let elementToAppendCustomSection = _this.getElementByXPathKey(xpath, document, "USPEElementAppendCustomSection");
                            if (elementToAppendCustomSection) {
                                _this.appendCustomSection(elementToAppendCustomSection, "USSkillsAndEndorsements", skillEndorsementsHTML);
                            }
                        }
                        await _this.Sleep(_this.GetRandom(3000, 5000));
                        // open the see Experiences panel
                        _this.clickInputElementByXpathKey(xpath, document, "PEButtonExpandExperiences");
                        _this.checkExtractionStopped(sendResponse, scrollInterval);
                        await _this.Sleep(_this.GetRandom(3000, 5000));
                        // Mientras exista un botón "Mostrar más", se expande el tab de experiencias de voluntariado.
                        while (_this.clickInputElementByXpathKey(xpath, document, "USButtonExpandVolunteerExperiences")) {
                            await _this.Sleep(_this.GetRandom(1000, 3000));
                            _this.checkExtractionStopped(sendResponse, scrollInterval);
                        }
                        await _this.Sleep(_this.GetRandom(3000, 5000));
                        // Se obtiene el botón para mostrar el modal con las listas completas de intereses.
                        let showInterestsButton = _this.getElementByXPathKey(xpath, document, "USPEShowInterestsModal");
                        if (showInterestsButton) {
                            showInterestsButton.click();
                            await _this.Sleep(_this.GetRandom(1000, 3000));
                            // Array para guardar el HTML completo de cada elemento de interés.
                            let interestItemHtmlArr = [];
                            let interestTabs = _this.getElementsByXPath(_this.getXpathByKey("USPEInterestTabs", xpath), document);
                            for (let i = 0; i < interestTabs.length; i++) {
                                // Se abre cada pestaña.
                                interestTabs[i].click();
                                await _this.Sleep(_this.GetRandom(1000, 3000));
                                // Se obtiene el elemento con el contenido del modal y la lista completa de intereses para el tab.
                                let tabContentElement = _this.getElementByXPathKey(xpath, document, "USPEInterestTabContent");
                                if (tabContentElement) {
                                    // Nos aseguramos de hacer scroll del contenido del tab por el lazy load de los elementos de interés.
                                    var prevScrollHeight;
                                    var scrolledTimes = 0;
                                    do {
                                        prevScrollHeight = tabContentElement.scrollHeight;
                                        tabContentElement.scrollBy(0, tabContentElement.offsetHeight);
                                        await _this.Sleep(_this.GetRandom(1000, 2000));
                                        scrolledTimes++;
                                    } while (prevScrollHeight < tabContentElement.scrollHeight && scrolledTimes < 10)
                                    let interestItems = _this.getElementsByXPath(_this.getXpathByKey("USPEInterestItem", xpath), document);
                                    if (interestItems) {
                                        interestItems.forEach(ii => interestItemHtmlArr.push(ii.outerHTML));
                                    }
                                }
                            }
                            // Se cierra el modal (el xpath es el mismo que para SkillSEndorsements).
                            _this.clickInputElementByXpathKey(xpath, document, "USPESkillsEndorsementFullDismissButton")
                            await _this.Sleep(_this.GetRandom(1000, 3000));
                            // Se agrega un elemento custom al final del perfil de LinkedIn con la información obtenida.
                            if (interestItemHtmlArr.length > 0) {
                                let interestItemsHTML = "<ul>";
                                interestItemHtmlArr.forEach(ii => interestItemsHTML += ii);
                                interestItemsHTML += "</ul>";
                                let elementToAppendCustomSection = _this.getElementByXPathKey(xpath, document, "USPEElementAppendCustomSection");
                                if (elementToAppendCustomSection) {
                                    _this.appendCustomSection(elementToAppendCustomSection, "USInterests", interestItemsHTML);
                                }
                            }
                        }
                        // open the see contact info panel                            
                        _this.clickInputElementByXpathKey(xpath, document, "PESeeMoreContactInfo");
                        _this.checkExtractionStopped(sendResponse, scrollInterval);
                        // Waits 2.5 seconds to send the html to let the request to be loaded.
                        await _this.Sleep(2500);
                        // Si no se pudo obtener desde los code, se intenta obtener el id de LinkedIn "in" con xpath.
                        let profileIdentifierElement = _this.getElementByXPathKey(xpath, document, "PEProfileIdentifier");
                        if (profileIdentifierElement) {
                            let profileIdentifierText = profileIdentifierElement.innerHTML.trim();
                            if (profileIdentifierText && profileIdentifierText.indexOf("/in/") > -1) {
                                inLinkedInId = profileIdentifierText.substring(profileIdentifierText.indexOf("/in/"));
                            }
                        }
                        _this.checkExtractionStopped(sendResponse, scrollInterval);
                        // Se agrega la clase "visually-hidden" para esconder los elementos de LinkedIn que no deben ser visibles.
                        var css = document.createElement("style");
                        css.type = "text/css";
                        css.appendChild(document.createTextNode(".visually-hidden { display: none }"));
                        document.head.appendChild(css);
                        sendResponse({
                            html: document.documentElement.outerHTML,
                            inLinkedInId: inLinkedInId,
                            encLinkedInId: encLinkedInId,
                            distance: distance
                        });
                    }
                }, 700);
            }
        } finally {}
    }

    extractCompanyFromPage(xpath, extractFullCompany, sendResponse) {
        let _this = this;
        try {
            _this.xpathExtractionStopped = _this.getXpathByKey("USElementsToCheckStop", xpath);
            if (_this.xpathExtractionStopped) {
                localStorage.setItem("xpathExtractionStopped", _this.xpathExtractionStopped);
            }
            (async function() {
                await _this.Sleep(3000);
                // Se revisa si la compañía cargo bien.
                let companyUnavailableElement = _this.getElementByXPathKey(xpath, document, "USCEUnavailableCompanyElement");
                let companyPageNotFoundElement = _this.getElementByXPathKey(xpath, document, "USCEPageNotFoundCompanyElement");
                if (companyUnavailableElement || companyPageNotFoundElement) {
                    sendResponse({ error: "Does not exist or is unavailable" });
                } else {

                    _this.checkExtractionStopped(sendResponse);
                    await _this.Sleep(_this.GetRandom(3000, 5000));

                    // Se abre la pestaña 'About'.
                    _this.clickInputElementByXpathKey(xpath, document, "USCEAboutButton");
                    _this.checkExtractionStopped(sendResponse);
                    await _this.Sleep(_this.GetRandom(3000, 5000));

                    // Se obtiene el HTML del elemento Overview de la pestaña 'About'.
                    let overviewHTML = '';
                    let overviewContentElement = _this.getElementByXPathKey(xpath, document, "USCEAboutOverviewContent");
                    if (overviewContentElement) {
                        overviewHTML = overviewContentElement.outerHTML;
                    }

                    // Se obtiene le HTML de Locations de la pestaña 'About'
                    let locationsHTML = '';
                    let locationsContentElement = _this.getElementByXPathKey(xpath, document, "USCEAboutLocationsContent");
                    if (locationsContentElement) {
                        locationsHTML = locationsContentElement.outerHTML;
                    }

                    // Se obtiene el HTML del modal de páginas afiliadas.
                    let affiliatedPagesModalHTML = '';
                    let seeAllAffiliatedPagesButton = _this.getElementByXPathKey(xpath, document, "USCESeeAllAffiliatedPagesButton");
                    if (seeAllAffiliatedPagesButton) {
                        seeAllAffiliatedPagesButton.click();
                        await _this.Sleep(_this.GetRandom(2000, 3000));
                        // Se obtiene el elemento con el contenido del modal.
                        let modalContentElement = _this.getElementByXPathKey(xpath, document, "USCEAffiliatedPagesModalContent");
                        if (modalContentElement) {
                            // Nos aseguramos de hacer scroll del contenido del modal por el lazy load.
                            var prevScrollHeight
                            var scrolledTimes = 0;
                            do {
                                prevScrollHeight = modalContentElement.scrollHeight;
                                modalContentElement.scrollBy(0, modalContentElement.scrollHeight);
                                scrolledTimes++;
                                if (scrolledTimes > 0) {
                                    await _this.Sleep(_this.GetRandom(2000, 3000));
                                }
                            } while (prevScrollHeight < modalContentElement.scrollHeight && scrolledTimes < 10)

                            affiliatedPagesModalHTML = _this.getElementByXPathKey(xpath, document, "USCEAffiliatedPagesFullContent").outerHTML;
                            // Se cierra el modal
                            _this.clickInputElementByXpathKey(xpath, document, "USCEAffiliatedPagesModalDismissButton")
                            await _this.Sleep(_this.GetRandom(1000, 3000));
                        }
                    }

                    // Se abre la pestaña 'People'.
                    _this.clickInputElementByXpathKey(xpath, document, "USCEPeopleButton");
                    _this.checkExtractionStopped(sendResponse);
                    await _this.Sleep(_this.GetRandom(3000, 5000));

                    let elementToAppendCustomSection = _this.getElementByXPathKey(xpath, document, "USCEElementAppendCustomSection");

                    // Se agrega el HTMl de la sección Overview de la pestaña About a un elemento custom.
                    if (elementToAppendCustomSection && overviewHTML) {
                        _this.appendCustomSection(elementToAppendCustomSection, "USCompanyAboutOverview", overviewHTML);
                    }

                    // Se agrega el HTML de la sección Locations de la pestaña About a un elemento custom.
                    if (elementToAppendCustomSection && locationsHTML) {
                        _this.appendCustomSection(elementToAppendCustomSection, "USCompanyAboutLocations", locationsHTML);
                    }

                    // Se agrega el HTMl del modal de páginas afiliadas a un elemento custom.
                    if (elementToAppendCustomSection && overviewHTML) {
                        _this.appendCustomSection(elementToAppendCustomSection, "USCompanyAffiliatedPages", affiliatedPagesModalHTML);
                    }

                    // Se agrega el DataUrl del logo de la compañía a un elemento custom.
                    let logoImg = _this.getElementByXPathKey(xpath, document, "USCELogo");
                    if (elementToAppendCustomSection && logoImg && logoImg.src) {
                        let dataUrl = await _this.GetImageDataUri(logoImg.src);
                        _this.appendCustomSection(elementToAppendCustomSection, "USCompanyLogoDataURI", dataUrl);
                    }

                    _this.checkExtractionStopped(sendResponse);
                    // Se agrega la clase "visually-hidden" para esconder los elementos de LinkedIn que no deben ser visibles.
                    var css = document.createElement("style");
                    css.type = "text/css";
                    css.appendChild(document.createTextNode(".visually-hidden { display: none }"));
                    document.head.appendChild(css);
                    sendResponse({ html: document.documentElement.outerHTML });
                }
            })();
        } finally {}
    }

    async GetImageDataUri(url) {
        return new Promise(resolve => {
            var image = new Image();
            image.crossOrigin = 'Anonymous';
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;
                canvas.getContext('2d').drawImage(this, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            image.src = url;
        });
    }

    /**
     * Promesa que espera hasta que pase la cantidad de milisegundos dados.
     * @param {number} ms - Milisegundos que espera la función.
     * @returns Promise<any>
     */
    async Sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtiene un número aleatorio, para un rango determinado
     * @param min Mínimo del intervalo
     * @param max Máximo del intervalo
     */
    GetRandom(min, max) {
        return min + (Math.random() * (max - min));
    }

    /**
     * Function to get the xpath by key inside the xpathKeyValues array
     * @param {string} key - The key to look for.
     * @param {any} xpathKeyValues - The array in where to look the xpath.
     */
    getXpathByKey(key, xpathKeyValues) {
        // creates a new array of 1 element by using the filter function
        let xpathKeyValueelement = xpathKeyValues.filter(element => { return element.key === key; });
        if (xpathKeyValueelement.length > 0) {
            return xpathKeyValueelement[0].value;
        } else {
            return null;
        }
    }
    getElementsByXPath(xpath, doc) {
        let results = [];
        let query = document.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0, length = query.snapshotLength; i < length; i++) {
            results.push(query.snapshotItem(i));
        }
        return results;
    }
    getElementByXPathKey(xpath, doc, xpathKey) {
        var _this = this;
        // gets the Seemore xpath
        let xpathToGet = _this.getXpathByKey(xpathKey, xpath);
        // Gets the input element to be clicked button by xpath
        return doc.evaluate(xpathToGet, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    clickInputElementByXpathKey(xpath, doc, xpathKey) {
        var _this = this;
        // gets the Seemore xpath
        let xpathElementToClick = _this.getXpathByKey(xpathKey, xpath);
        // Gets the input element to be clicked button by xpath
        let inputElementToClick = doc.evaluate(xpathElementToClick, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (inputElementToClick) {
            // click on the element
            inputElementToClick.click();
            return true;
        }
        return false;
    }

    /**
     * Agrega una sección custom de UltraScrapper con el id dado y el innerHTML dado al final del elemento dado.
     * @param {string} elementToAppendCustomSection Elemento al que se agregará la sección custom.
     * @param {string} customSectionId Id de la sección custom.
     * @param {string} customSectionHTML HTML de la sección custom.
     */
    appendCustomSection(elementToAppendCustomSection, customSectionId, customSectionHTML) {
        var newCustomSection = document.createElement("div");
        newCustomSection.id = customSectionId;
        newCustomSection.classList.add("pv-deferred-area");
        newCustomSection.classList.add("artdeco-container-card");
        newCustomSection.innerHTML = customSectionHTML;
        elementToAppendCustomSection.appendChild(newCustomSection);
    }

    clearUSDivs() {
        let existingUsMessageDiv = document.getElementById("usMessageDiv");
        if (existingUsMessageDiv) {
            existingUsMessageDiv.remove();
        }
        let existingUsCountDownDiv = document.getElementById("usCountDownDiv");
        if (existingUsCountDownDiv) {
            existingUsCountDownDiv.remove();
        }
    }
}

(function() {
    sidePanelActions = new SidePanelActions();
})();