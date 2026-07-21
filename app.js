    // Initialize variables, pull the tarot card json object from tarot-images.js
    var deck = JSON.parse(tarotImages);
    const deckSize = 78;
    var numCards = deckSize;
    var zIndex = deckSize;
    var index = 0;
    var isDragging = false;
    var startTime = Date.now();

    // Grab HTML elements
    var header = document.getElementById("header");
    var briefing = document.getElementById("briefing");
    var icon = document.getElementById("icon");
    var reversed = document.getElementById("reversed");
    var reversedCheckBox = document.getElementById("reversedCheckBox");
    var reversedLabel = document.getElementById("reversedLabel");
    var pulled = document.getElementById("pulled");
    var shuffled = document.getElementById("shuffled");
    var overlay = document.getElementById("overlay");
    var container = document.getElementById("container");
    var picked = document.getElementById("picked");
    var card_name = document.getElementById("card_name");
    var card_name_text = document.getElementById("card_name_text");
    var close_button_row = document.getElementById("close_button_row");
    var close_button_container = document.getElementById("close_button_container");
    var close_button_text = document.getElementById("close_button_text");
    var close_button = document.getElementById("close_button");
    var card_link = document.getElementById("card_link");
    var card_link_text = document.getElementById("card_link_text");
    card_link_text.textContent = "Find more info on Google";

    function cardUp(e) {
        e.target.style.transform = "translateY(-20px)";
    }

    function cardDown(e) {
        e.target.style.transform = "translateY(0px)";
    }

    // Use the mouse/finger coordinates and the time to create an authentically random card selection
    function pickCard(x, y) {

        // Crude formula, but it works
        var endTime = Date.now();
        var timeDiff = endTime - startTime;
        var rand = x + y + timeDiff + 1;
        var cardIndex = Math.floor(rand % numCards);
        var cardUpright = Boolean(Math.floor(timeDiff % 2));

        // Grab the card information from the JSON object
        var cardName = deck.cards[cardIndex].name;
        var cardImage = deck.cards[cardIndex].img;

        // Create the card object as a div element
        var card = document.createElement("div");
        card.setAttribute("class", "card");
        card.setAttribute("id", index); // card position in shuffle
        card.setAttribute("data-index", cardIndex); // card position in an unshuffled deck
        card.setAttribute("data-name", cardName);
        card.setAttribute("image-path", cardImage);
        card.setAttribute("data-upright", cardUpright);

        // Add events to show the card when clicked
        card.addEventListener("click", (e) => reveal(e));

        // Move card from deck to shuffled pile
        card.style.setProperty("z-index", zIndex);
        zIndex--;
        shuffled.appendChild(card);
        deck.cards.splice(cardIndex, 1);

        // Update counters
        numCards--;
        index++;

        card.addEventListener("mouseover", cardUp);
        card.addEventListener("mouseout", cardDown);
    }

    // Unhide divs for shuffled and pulled cards (after shuffle is complete)
    function showCards() {
        briefing.style.setProperty("display", "none");
        shuffled.style.setProperty("display", "flex");
        icon.style.setProperty("display", "none");
        reversed.style.setProperty("display", "block");
        pulled.style.setProperty("display", "flex");
        header.textContent = "Select a card";
        document.body.style.setProperty("overscroll-behavior-y", "auto");
        document.documentElement.style.setProperty("overscroll-behavior-y", "auto");
        document.body.style.setProperty("user-select", "auto");

        // Hide cards when clicking anywhere on screen
        close_button_container.addEventListener("click", (e) => unpick(e));
    };

    // Show a shuffled card (move from shuffled div to pulled div)
    function reveal(e) {

        // Copy the card
        var card = e.target;

        // Remove the translation events
        card.removeEventListener("mouseover", cardUp);
        card.removeEventListener("mouseout", cardDown);

        var clone = card.cloneNode(true);
        clone.style.setProperty("visibility", "hidden");

        // Remove the pull visualization of the card
        clone.style.transform = "translateY(0px)";

        // Pull the card and flip it (show face of card, etc)
        clone.title = card.getAttribute("data-name");
        var imagePath = card.getAttribute("image-path");
        clone.style.setProperty("background-image", `url(\"cards/small/${imagePath}\")`);
        clone.style.setProperty("margin", "5px 5px 5px 5px");

        // Rotate the card if it is reversed and the checkbox is checked
        if (clone.getAttribute("data-upright") == "false" && reversedCheckBox.checked)
            clone.style.transform = "rotate(180deg)";

        // Add events to show the card when clicked
        clone.addEventListener("click", () => pick(imagePath, clone.title, card.getAttribute("data-upright")));

        // Add the flipped card to the pulled area, remove from shuffled area
        pulled.appendChild(clone);

        // Get current viewport bounding rectangles
        var cardRect = card.getBoundingClientRect();
        var cloneRect = clone.getBoundingClientRect();

        // Get the active CSS matrix for the card's transform property
        var style = window.getComputedStyle(card);
        var matrix = new DOMMatrix(style.transform);

        // Extract the current Y translation value (in pixels)
        var yTranslation = matrix.m42; // or matrix.f

        // Calculate the pixel difference between target and source
        var xDiff = cloneRect.left - cardRect.left;
        var yDiff = cloneRect.top - cardRect.top + yTranslation;

        // When the transition is complete, hide the original card and show the clone
        card.addEventListener("transitionend", () => {
            clone.style.setProperty("visibility", "visible");
            card.style.setProperty("visibility", "hidden");
        }, { once: true });

        // Apply the translation transformation
        card.style.transform = `translate(${xDiff}px, ${yDiff}px)`;
        card.style.transform = `margin: 5px 5px 5px 5px`;
    }

    // Show zoomed-in version of card
    function pick(imagePath, cardTitle, orientation) {
        overlay.style.setProperty("display", "flex");
        picked.src = "cards/large/" + imagePath;
        picked.style.transform = "none";
        picked.style.setProperty("z-index", "1000");
        if ((orientation == "false") && reversedCheckBox.checked)
            picked.style.transform = "rotate(180deg)";
        var orientationText = "";
        if ((orientation == "false") && reversedCheckBox.checked)
            orientationText = " (reversed)";
        card_name_text.textContent = cardTitle + orientationText;
        var googleUrl = new URL('https://www.google.com/search');
        var rawQuery = cardTitle + ' tarot card';
        googleUrl.searchParams.set('q', rawQuery);
        card_link_text.innerHTML = '<a href="' + googleUrl.toString() + '" target="_blank">' + card_link_text.textContent + '</a>';
        disableScroll();
    }

    // Hide zoomed-in version of card (by tapping/clicking it it)
    function unpick(e) {
        overlay.style.setProperty("display", "none");
        enableScroll();
    }

    // Lock scrolling WITHOUT changing the layout (no overflow/scrollbar toggle,
    // so the body width stays constant and the centered #header never shifts).
    // Scrollbars remain visible but inert by intercepting scroll input.
    function disableScroll () {
        var scrollY = window.scrollY;
        var scrollX = window.scrollX;
        document.body.dataset.scrollY = scrollY;
        document.body.dataset.scrollX = scrollX;

        document.body.style.touchAction = 'none';
        window.addEventListener('wheel', preventDefault, { passive: false });
        window.addEventListener('touchmove', preventDefault, { passive: false });
        window.addEventListener('keydown', preventScrollKeys, { passive: false });
    };

    function enableScroll () {
        var scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
        var scrollX = parseInt(document.body.dataset.scrollX || '0', 10);

        document.body.style.touchAction = '';
        window.removeEventListener('wheel', preventDefault);
        window.removeEventListener('touchmove', preventDefault);
        window.removeEventListener('keydown', preventScrollKeys);

        window.scrollTo(scrollX, scrollY);
    };

    // Helper function to block native device movement
    function preventDefault (e) {
        e.preventDefault();
    };

    // Block keyboard scrolling (arrows, space, page up/down, home, end)
    function preventScrollKeys (e) {
        var scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
        if (scrollKeys.indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    };

    // Pick a "random" card until there are no more
    function shuffle(x, y) {
        if (numCards > 0) {
            pickCard(x, y);
            var percentDone = Math.floor((100 - (numCards / deckSize * 100)));
            header.textContent = percentDone + "% done";
        }
        else {
            showCards();
            document.removeEventListener("mousedown", handleMouseStart);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseEnd);
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        }
    }

    // Event handlers. Grab coordinates and call the above functions

    // If the reversed checkbox button is checked or unchecked, make sure that the pulled cards are oriented properly
    function orientPulledCards(e) {
        var showReversed = reversedCheckBox.checked;

        var child = pulled.firstElementChild;

        while (child) {
            child.style.transform = "none";
            var childUpright = child.getAttribute("data-upright") == "true";
            if (!childUpright && showReversed)
                child.style.transform = "rotate(180deg)";
            child = child.nextElementSibling;
        }
    }

    var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    var isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    var isTablet = isTouchDevice && window.innerWidth >= 768;
    var minDrawInterval = isTablet ? 50 : (isTouchDevice ? 45 : 70);
    var minDrawDistance = isTablet ? 35 : (isTouchDevice ? 28 : 10);
    var lastDrawTime = 0;
    var lastDrawX = 0;
    var lastDrawY = 0;
    var isDragging = false;

    function getXYmouse(e) {
        var x = e.clientX;
        var y = e.clientY;
        shuffle(x, y);
    }

    function getXYtouch(e) {
        var touch = e.touches[0];
        var x = touch.clientX;
        var y = touch.clientY;
        shuffle(x, y);
    }

    function handleMouseStart(e) {
        isDragging = true;
        getXYmouse(e);
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        var now = Date.now();
        var dx = e.clientX - lastDrawX;
        var dy = e.clientY - lastDrawY;
        if (now - lastDrawTime < minDrawInterval) return;
        if (Math.sqrt(dx*dx + dy*dy) < minDrawDistance) return;
        lastDrawTime = now;
        lastDrawX = e.clientX;
        lastDrawY = e.clientY;
        getXYmouse(e);
    }

    function handleMouseEnd() {
        isDragging = false;
    }

    function handleTouchStart(e) {
        isDragging = true;
        getXYtouch(e);
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        var now = Date.now();
        var touch = e.touches[0];
        var dx = touch.clientX - lastDrawX;
        var dy = touch.clientY - lastDrawY;
        if (now - lastDrawTime < minDrawInterval) return;
        if (Math.sqrt(dx*dx + dy*dy) < minDrawDistance) return;
        lastDrawTime = now;
        lastDrawX = touch.clientX;
        lastDrawY = touch.clientY;
        getXYtouch(e);
    }

    function handleTouchEnd() {
        isDragging = false;
    }

    // Set up event listeners

    // Reverse card checkbox listeners
    reversedCheckBox.addEventListener("change", orientPulledCards);

    // Desktop events
    document.addEventListener("mousedown", handleMouseStart);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseEnd);

    // Mobile events
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);