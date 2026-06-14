# Tarot

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

A tarot card drawing program that features an "authentic" shuffle. No random number generation is used. It is all based on the user input of a mouse/finger dragging across the screen. The position of each point in the drag and is combined with the time in a not-so-sophisticated formula to produce "random" card picks. The cards are then all laid out in that random order (face down) for the user to pick. [A JSON file and scanned card images](https://www.kaggle.com/datasets/lsind18/tarot-json) were obtained under the [MIT License](https://opensource.org/license/MIT). No server-side scripting is used, only HTML, CSS, and Javascript.

Go to [https://touchytarot.vercel.app/](https://touchytarot.vercel.app/) for a working demo!

## Background

I personally do Tarot, and I went through a phase where I was seeking out various Tarot sites and I simply didn't trust whatever AI or random number generator was being used, so I created my own. I was intrigued by the idea of using 100% human input in the card shuffle, so the user could feel like they were actually shuffling the deck themselves. After playing around some, I came up with the idea of using click/tap and drag motions, combined with the time stamp for each point in the drag to create a random card selection. Only the time stamp determines whether the card is reversed or not.

## Install

Simply [download the the repository](https://github.com/rbrutherford3/Tarot/archive/refs/heads/main.zip), unzip the contents, and open index.html. It includes all the cited tarot data necessary to run the site. You may also clone the repository:
```
git clone https://github.com/rbrutherford3/Tarot.git
```

## Usage

The site opens with a prompt to tap and drag (or click and drag if using a mouse) randomly until the cards are shuffled. After that is done, the cards are laid out face down in the hidden order that the shuffle occured. The user need only pick cards (as many as are pertinent for their reading) and they will be revealed at the top. The user may also choose to reveal the orientation of the cards if desired.

## Contributing

Please contact rbrutherford3 on GitHub if interested in contributing.

## License

[MIT © Robert Rutherford](https://github.com/rbrutherford3/Tarot/blob/main/LICENSE)
