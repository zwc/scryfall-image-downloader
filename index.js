const querystring = require("querystring");

const H = require("highland");
const axios = require("axios");
const axiosSaveFile = require("axios-savefile");

const BASE_URL = "https://api.scryfall.com";
const IMAGE_DIR = "images";

// TODO: Modify list of cards here
const cards = [
  "City of Brass",
  "Mirror Universe",
  "Underground Sea",
  "Tropical Island"
];

const saveImage = info => {
  const url = info.image;
  const savePath = `${__dirname}/${IMAGE_DIR}/${info.card}.png`;
  return H(axiosSaveFile(url, savePath));
};

const search = name => {
  const options = {
    format: "json",
    include_extras: false,
    include_multilingual: false,
    order: "cmc",
    page: 1,
    unique: "cards",
    q: `name:${name}`
  };
  const qs = querystring.stringify(options);
  return `${BASE_URL}/cards/search?${qs}`;
};

const getCardInfo = name => {
  const url = search(name);
  return H(axios(url)).map(response => response.data);
};

const getImage = size => response => {
  return {
    card: response.data[0].name,
    image: response.data[0].image_uris[size]
  };
};

H(cards)
  .ratelimit(1, 100)
  .flatMap(getCardInfo)
  .map(getImage("normal")) // [small,normal,large,png,art_crop,border_crop]
  .flatMap(saveImage)
  .errors(console.log)
  .done(() => {});
