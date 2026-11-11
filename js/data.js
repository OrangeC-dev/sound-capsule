// This controls the different map levels
// Each view has pins. Clicking a pin moves to the next view. 
const CARTO_BASEMAP_KEY = "cb1_2izv_1_a25afdd318a119b391971bf2";

function getCartoBasemapUrl(styleName) {
  const params = new URLSearchParams();
  params.set("v", "2");

  if (CARTO_BASEMAP_KEY) {
    params.set("key", CARTO_BASEMAP_KEY);
  }

  return `https://{s}.basemaps.cartocdn.com/${styleName}/{z}/{x}/{y}{r}.png?${params.toString()}`;
}

const mapViews = {
  world: {
    title: "World View",
    description: "Choose a country to begin.",
    pins: [
      {
        title: "Ireland",
        type: "country",
        nextView: "ireland",
        mapPosition: { x: "50%", y: "42%" }
      }
    ]
  },

  ireland: {
    title: "Ireland",
    description: "Choose a city to explore its collections.",
    pins: [
      {
        title: "Dublin",
        type: "city",
        nextView: "dublin", 
        mapPosition: { x: "58%", y: "62%" }
      }
    ]
  },

  dublin: {
    title: "Dublin",
    description: "Choose a sound collection.", 
    pins: [
      {
        title: "Dublin Coastal",
        type: "collection",
        collectionId: "irelandCoastal",
        mapPosition: { x: "72%", y: "35%" }
      },
      {
        title: "Dublin Streets", 
        type: "collection",
        collectionId: "irelandStreets",
        mapPosition: { x: "48%", y: "58%" }
      },
      {
        title: "Dublin Parks", 
        type: "collection",
        collectionId: "irelandParks",
        mapPosition: { x: "38%", y: "48%" }
      },
      {
        title: "Dublin Transport",
        type: "collection",
        collectionId: "irelandTransport",
        mapPosition: { x: "56%", y: "72%" }
      },
      {
        title: "Dublin Weather", 
        type: "collection",
        collectionId: "irelandWeather",
        mapPosition: { x: "64%", y: "24%"}
      },
      {
        title: "Dublin Voices & Spaces",
        type: "collection",
        collectionId: "irelandVoices",
        mapPosition: { x: "32%", y: "66%" }
      }
    ]
  }
};

const exploreCollections = [
  {
    id: "irelandParks",
    name: "Parks & Gardens",
    theme: "parks",
    image: "assets/images/collections/ireland/ireland_parks.jpg",
    keywords: ["parks", "gardens", "birds", "nature", "calm"]
  },
  {
    id: "irelandStreets",
    name: "Streets",
    theme: "streets",
    image: "assets/images/collections/ireland/ireland_streets.jpg",
    keywords: ["streets", "city", "crowd", "voices", "pedestrians"]
  },
  {
    id: "irelandTransport",
    name: "Transport",
    theme: "transport",
    image: "assets/images/collections/ireland/ireland_transport.jpg",
    keywords: ["transport", "luas", "train", "tram", "station"]
  },
  {
    id: "irelandCoastal",
    name: "Coastal & Water",
    theme: "coastal",
    image: "assets/images/collections/ireland/ireland_coastal.jpg",
    keywords: ["coastal", "water", "wind", "sea"]
  },
  {
    id: "irelandWeather",
    name: "Weather",
    theme: "weather",
    image: "assets/images/collections/ireland/ireland_weather.jpg",
    keywords: ["weather", "rain", "wind", "atmosphere"]
  },
  {
    id: "irelandVoices",
    name: "Voices & Spaces",
    theme: "voices",
    image: "assets/images/collections/ireland/ireland_voices.jpg",
    keywords: ["voices", "spaces", "conversation", "memory"]
  },
  {
    id: "netherlandsParks",
    name: "Parks & Gardens",
    theme: "parks",
    image: "assets/images/collections/netherlands/netherlands_parks.jpg",
    keywords: ["parks", "gardens", "nature", "trees", "calm", "netherlands", "north holland"]
  },
  {
    id: "netherlandsStreets",
    name: "Streets",
    theme: "streets",
    image: "assets/images/collections/netherlands/netherlands_streets.jpg",
    keywords: ["streets", "city", "town", "pedestrians", "netherlands", "north holland"]
  },
  {
    id: "netherlandsTransport",
    name: "Transport",
    theme: "transport",
    image: "assets/images/collections/netherlands/netherlands_transport.jpg",
    keywords: ["transport", "train", "tram", "station", "cycling", "netherlands", "north holland"]
  },
  {
    id: "netherlandsWeather",
    name: "Weather",
    theme: "weather",
    image: "assets/images/collections/netherlands/netherlands_weather.jpg",
    keywords: ["weather", "rain", "wind", "atmosphere", "netherlands", "north holland"]
  },
  {
    id: "netherlandsVoices",
    name: "Voices & Spaces",
    theme: "voices",
    image: "assets/images/collections/netherlands/netherlands_voices.jpg",
    keywords: ["voices", "spaces", "conversation", "public space", "netherlands", "north holland"]
  }
];

const exploreArchive = {
  countries: [
    {
      id: "ireland",
      name: "Ireland",
      type: "country",
      theme: "parks",
      image: "assets/images/countries/ireland_thumbnail.png",
      summary: "Field recordings from parks, streets, transport, weather and everyday public spaces across Ireland.",
      collectionIds: [
        "irelandParks",
        "irelandStreets",
        "irelandTransport",
        "irelandCoastal",
        "irelandWeather",
        "irelandVoices"
      ]
    },
    {
      id: "netherlands",
      name: "Netherlands",
      type: "country",
      theme: "coastal",
      image: "assets/images/countries/netherlands_thumbnail.png",
      summary: "Recordings from parks, streets, waterways and everyday spaces across the Netherlands.",
      collectionIds: [
        "netherlandsParks",
        "netherlandsStreets",
        "netherlandsTransport",
        "netherlandsWeather",
        "netherlandsVoices"
      ]
    }
  ]
};

const globalCollections = [
  {
    id: "globalParks",
    name: "Parks & Gardens",
    theme: "parks",
    type: "global"
  },
  {
    id: "globalStreets",
    name: "Streets",
    theme: "streets",
    type: "global"
  },
  {
    id: "globalTransport",
    name: "Transport",
    theme: "transport",
    type: "global"
  },
  {
    id: "globalCoastal",
    name: "Coastal & Water",
    theme: "coastal",
    type: "global"
  },
  {
    id: "globalWeather",
    name: "Weather",
    theme: "weather",
    type: "global"
  },
  {
    id: "globalVoices",
    name: "Voices & Spaces",
    theme: "voices",
    type: "global"
  }
];

const editorialCollections = [];