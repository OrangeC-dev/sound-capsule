// This controls the different map levels
// Each view has pins. Clicking a pin moves to the next view. 
const CARTO_BASEMAP_KEY = "cb1_2izv_1_a25afdd318a119b391971bf2";

function getCartoBasemapUrl(styleName) {
  const keyParam = CARTO_BASEMAP_KEY
    ? `?key=${encodeURIComponent(CARTO_BASEMAP_KEY)}`
    : "";

  return `https://{s}.basemaps.cartocdn.com/${styleName}/{z}/{x}/{y}{r}.png${keyParam}`;
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
        collectionId: "dublinCoastal",
        mapPosition: { x: "72%", y: "35%" }
      },
      {
        title: "Dublin Streets", 
        type: "collection",
        collectionId: "dublinStreets",
        mapPosition: { x: "48%", y: "58%" }
      },
      {
        title: "Dublin Parks", 
        type: "collection",
        collectionId: "dublinParks", 
        mapPosition: { x: "38%", y: "48%" }
      },
      {
        title: "Dublin Transport",
        type: "collection",
        collectionId: "dublinTransport",
        mapPosition: { x: "56%", y: "72%" }
      },
      {
        title: "Dublin Weather", 
        type: "collection",
        collectionId: "dublinWeather",
        mapPosition: { x: "64%", y: "24%"}
      },
      {
        title: "Dublin Voices & Spaces",
        type: "collection",
        collectionId: "dublinVoices",
        mapPosition: { x: "32%", y: "66%" }
      }
    ]
  }
};

const exploreCollections = [
  {
    id: "dublinParks",
    name: "Parks & Gardens",
    theme: "parks",
    image: "assets/images/collections/dublin-parks.jpg",
    keywords: ["parks", "gardens", "birds", "nature", "calm"]
  },
  {
    id: "dublinStreets",
    name: "Streets",
    theme: "streets",
    image: "assets/images/collections/dublin-streets.jpg",
    keywords: ["streets", "city", "crowd", "voices", "pedestrians"]
  },
  {
    id: "dublinTransport",
    name: "Transport",
    theme: "transport",
    image: "assets/images/collections/dublin-transport.jpg",
    keywords: ["transport", "luas", "train", "tram", "station"]
  },
  {
    id: "dublinCoastal",
    name: "Coastal & Water",
    theme: "coastal",
    image: "assets/images/collections/dublin-coastal.jpg",
    keywords: ["coastal", "water", "wind", "sea"]
  },
  {
    id: "dublinWeather",
    name: "Weather",
    theme: "weather",
    image: "assets/images/collections/dublin-weather.jpg",
    keywords: ["weather", "rain", "wind", "atmosphere"]
  },
  {
    id: "dublinVoices",
    name: "Voices & Spaces",
    theme: "voices",
    keywords: ["voices", "spaces", "conversation", "memory"]
  },
  {
    id: "netherlandsParks",
    name: "Parks & Gardens",
    theme: "parks",
    keywords: ["parks", "gardens", "nature", "trees", "calm", "netherlands", "north holland"]
  },
  {
    id: "netherlandsStreets",
    name: "Streets",
    theme: "streets",
    keywords: ["streets", "city", "town", "pedestrians", "netherlands", "north holland"]
  },
  {
    id: "netherlandsTransport",
    name: "Transport",
    theme: "transport",
    keywords: ["transport", "train", "tram", "station", "cycling", "netherlands", "north holland"]
  },
  {
    id: "netherlandsWeather",
    name: "Weather",
    theme: "weather",
    keywords: ["weather", "rain", "wind", "atmosphere", "netherlands", "north holland"]
  },
  {
    id: "netherlandsVoices",
    name: "Voices & Spaces",
    theme: "voices",
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
        "dublinParks",
        "dublinStreets",
        "dublinTransport",
        "dublinCoastal",
        "dublinWeather",
        "dublinVoices"
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

// These are the memory/audio cards for each Dublin collection.
const collectionMemories = {
  dublinCoastal: [
    {
      title: "Howth Wind",
      location: "Howth Cliffs, Dublin",
      cityCountry: "Dublin, Ireland",
      lat: 53.3886,
      lng: -6.0667,
      mapZoom: 16,
      description: "A coastal memory shaped by wind, sea movement, and open space.",
      image: "",
      audio: "audio/howth.mp3",
      duration: "Coming soon",
      recordedDate: "MAY 2026",
      publicTags: ["wind", "sea movement", "open coastal air"],
      hiddenSoundTags: ["coastal", "wind", "sea"],
      hiddenMoodTags: ["open", "windswept", "expansive", "reflective"]
    }
  ],

  dublinStreets: [
    {
      title: "Afternoon Rush",
      location: "Capel Street",
      cityCountry: "Dublin, Ireland",
      lat: 53.347929,
      lng: -6.268582,
      mapZoom: 17,
      description: "One of Dublin’s most vibrant pedestrian streets captured on a busy afternoon. Conversations spill across the pavement as cyclists pass by and seagulls circle overhead. A bustling portrait of everyday life in the city centre.",
      image: "",
      audio: "audio/capel_street.mp3",
      duration: "9:54",
      recordedDate: "JUN 2026",
      publicTags: ["conversations", "cyclists", "footsteps", "seagulls", "busy"],
      hiddenSoundTags: ["conversations", "voices", "bicycles", "footsteps", "seagulls", "pedestrians"],
      hiddenMoodTags: ["busy", "lively", "social", "energetic", "urban"]
    },
    {
      title: "Morning Sounds",
      location: "Harcourt Street",
      cityCountry: "Dublin, Ireland",
      lat: 53.336613,
      lng: -6.263156,
      mapZoom: 17,
      description: "A Dublin morning soundscape filled with movement. Seagulls and birds mix with passing bicycles, Luas trams, traffic signals, and the steady flow of pedestrians. A lively street awakening to the day ahead.",
      image: "",
      audio: "audio/harcourt_street.mp3",
      duration: "10:14",
      recordedDate: "JUN 2026",
      publicTags: ["seagulls", "birds", "bicycles", "traffic signals", "pedestrians"],
      hiddenSoundTags: ["streets", "morning", "bicycles", "pedestrians", "luas"],
      hiddenMoodTags: ["morning", "lively", "atmospheric", "nostalgic"]
    },
    {
      title: "Summer Evening",
      location: "Drury Street",
      cityCountry: "Dublin, Ireland",
      lat: 53.341957,
      lng: -6.263574,
      mapZoom: 17,
      description: "A warm summer evening on one of Dublin’s liveliest streets. Conversations drift through the air as friends gather outdoors and pedestrians move between busy cafés and restaurants. A snapshot of Dublin’s social life at its most vibrant.",
      quote: "Where conversations, laughter and city life spill onto the streets.",
      image: "",
      audio: "audio/drury_street_summer_evening.mp3",
      duration: "2:27",
      recordedDate: "MAY 2026",
      signatureSound: {
        label: "Crowd Chatter",
        icon: "crowd",
        story: "The defining sound of this capsule is the movement of people through Drury Street: overlapping conversations, laughter, footsteps, and the warm social rhythm of a summer evening in the city."
      },
      publicTags: ["chattering", "laughter", "pedestrians", "summer ambience"],
      hiddenSoundTags: ["streets", "urban", "summer", "social"],
      hiddenMoodTags: ["busy", "lively", "social", "energetic"]
    }
  ],

  dublinParks: [
    {
      title: "Quiet Corner Behind Trinity",
      location: "Trinity College",
      cityCountry: "Dublin, Ireland",
      lat: 53.343391,
      lng: -6.252372,
      mapZoom: 15,
      description: "Tucked away behind Trinity College, this recording captures a quieter side of the city. Birds dominate the soundscape while distant traffic, passing pedestrians, and occasional emergency sirens drift in from beyond the park. A gentle blend of nature and urban life at the heart of Dublin.",
      image: "",
      audio: "audio/trinity_college_park_back.mp3",
      duration: "11:13",
      recordedDate: "MAY 2026",
      publicTags: ["birds", "distant traffic", "wind"],
      hiddenSoundTags: ["parks", "birds", "urban-nature", "wind"],
      hiddenMoodTags: ["calm", "peaceful", "reflective"]
    },
    {
      title: "Summer Afternoon",
      location: "St Patrick's Park",
      cityCountry: "Dublin, Ireland",
      lat: 53.339848,
      lng: -6.270939,
      mapZoom: 17,
      description: "A peaceful afternoon in one of Dublin's most historic city parks, with birdsong, passing footsteps, and distant conversations creating a relaxing urban atmosphere.",
      image: "",
      audio: "audio/st_patricks_park.mp3",
      duration: "5:39",
      recordedDate: "JUN 2026",
      publicTags: ["birds", "footsteps", "distant conversations", "city-park"],
      hiddenSoundTags: ["parks", "birds", "chattering", "footsteps", "city-park"],
      hiddenMoodTags: ["calm", "peaceful", "warm"]
    },
    {
      title: "Waterfall in the Distance",
      location: "Iveagh Gardens",
      cityCountry: "Dublin, Ireland",
      lat: 53.335009,
      lng: -6.260510,
      mapZoom: 17,
      description: "Recorded among the trees of Iveagh Gardens, this soundscape layers birdsong, rustling leaves, and a distant waterfall beneath the city’s constant presence. Wind moves through the garden while urban sounds linger softly in the background, creating a peaceful balance between nature and city life.",
      image: "assets/images/iveagh-gardens-waterfall.jpg",
      audio: "audio/iveagh_gardens_park_waterfall.mp3",
      duration: "9:01",
      recordedDate: "JUN 2026",
      publicTags: ["birds", "rustling leaves", "waterfall", "wind", "calm"],
      hiddenSoundTags: ["waterfall", "birds", "wind", "urban-nature"],
      hiddenMoodTags: ["calm", "peaceful", "warm", "reflective"]
    },
    {
      title: "Sunday Bells",
      location: "St Patrick's Park",
      cityCountry: "Dublin, Ireland",
      lat: 53.340129,
      lng: -6.271481,
      mapZoom: 17,
      description: "A peaceful Sunday morning in St Patrick’s Park. Birdsong, distant conversations, and gentle city sounds surround the gardens as the bells of St Patrick’s Cathedral ring across the park, creating one of Dublin’s most distinctive weekly soundscapes.",
      image: "",
      audio: "audio/st_patricks_park_sunday_bells.mp3",
      duration: "12:36",
      recordedDate: "JUL 2026",
      signatureSound: {
        label: "Cathedral Bells",
        icon: "bells",
        story: "Every Sunday morning, the bells of St Patrick's Cathedral ring out across the park and surroounding streets. Their changing rhythms and melodies become one of the defining sounds of this part of Dublin. The park beneath them carries another layer of history. Once part of Dublin's most densely populated areas, the land was transformed into the public garden tat surrounds the cathedral today. The bells now travek across a very different ladscape - mixing with birdsong, footsteps and conversations throughout the park."
      },
      publicTags: ["parks", "church bells", "birds", "reflective"],
      hiddenSoundTags: ["birdsong", "church bells", "distant conversations", "urban park"],
      hiddenMoodTags: ["peaceful", "calm", "reflective", "historic", "relaxing", "mindful"]
    },
  ],

  dublinTransport: [
    {
      title: "Red Line Luas Stop",
      location: "Smithfield",
      cityCountry: "Dublin, Ireland",
      lat: 53.347144,
      lng: -6.277479,
      mapZoom: 17,
      description: "A typical moment at one of Dublin’s busiest tram stops. Seagulls call overhead as passengers chat, tickets are tapped, and Luas trams arrive and depart throughout the recording. An everyday snapshot of the city’s rhythm in motion.",
      image: "",
      audio: "audio/luas_redline_smithfield_stop.mp3",
      duration: "9:59",
      recordedDate: "JUN 2026",
      signatureSound: {
        label: "Tram",
        icon: "transport",
        story: "The signature sound here is the Luas moving through Smithfield: arrivals, departures, doors, signals, and the small mechanical rhythms that shape everyday travel in Dublin."
      },
      publicTags: ["transport", "passengers", "ticket taps", "seagulls"],
      hiddenSoundTags: ["transport", "luas", "tram", "urban-life"],
      hiddenMoodTags: ["busy", "atmospheric"]
    },
    {
      title: "Pearse Station Arrival",
      location: "Pearse Station",
      cityCountry: "Dublin, Ireland",
      lat: 53.343399,
      lng: -6.248798,
      mapZoom: 17,
      description: "The sounds of daily travel unfold inside one of Dublin’s busiest rail stations. Ticket gates beep, footsteps echo through the concourse, and trains arrive and depart as commuters move through the space.",
      image: "",
      audio: "audio/pearse_station.mp3",
      duration: "3:15",
      recordedDate: "JUN 2026",
      publicTags: ["ticket gates", "footsteps", "train", "commuters"],
      hiddenSoundTags: ["transport", "train", "railway", "station", "ticket gates", "footsteps", "commuters"],
      hiddenMoodTags: ["busy", "atmospheric", "lively", "commuting"]
    }
  ],

  dublinWeather: [
    {
      title: "Rain On Pavement",
      location: "Dublin Weather",
      cityCountry: "Dublin, Ireland",
      lat: 53.3498,
      lng: -6.2603,
      mapZoom: 14,
      description: "Rain, wind, wet streets, and the atmosphere of changing weather.",
      image: "",
      audio: "",
      duration: "Coming soon",
      recordedDate: "JUN 2026",
      publicTags: ["rain", "wind", "wet pavement", "city atmosphere"],
      hiddenSoundTags: ["rain", "weather", "atmosphere"],
      hiddenMoodTags: []
    },
    {
      title: "Garden Rain",
      location: "Usher's Quay",
      cityCountry: "Dublin, Ireland",
      lat: 53.345816,
      lng: -6.280380,
      mapZoom: 17,
      description: "A steady Dublin rain falling through a quiet city garden, gradually softening into lighter showers accompanied by birdsong and distant urban ambience.",
      image: "",
      audio: "audio/garden_rain_ushers_quay.mp3",
      duration: "7:23",
      recordedDate: "MAY 2026",
      signatureSound: {
        label: "Rain",
        icon: "rain",
        story: "Rain gives this capsule its character, softening the garden atmosphere and blending with birdsong, leaves, and distant city ambience."
      },
      publicTags: ["rain", "birds", "distant city ambience"],
      hiddenSoundTags: ["weather", "rain", "garden", "birds"],
      hiddenMoodTags: ["calm", "peaceful", "reflective"]
    }
  ],

  dublinVoices: [
    {
      title: "Voices In Space",
      location: "Dublin Voices & Spaces",
      cityCountry: "Dublin, Ireland",
      lat: 53.3498,
      lng: -6.2603,
      mapZoom: 14,
      description: "Fragments of conversation, room tone, public space, and memory.",
      image: "",
      audio: "",
      duration: "Coming soon",
      recordedDate: "JUN 2026",
      publicTags: ["conversation", "room tone", "public space", "memory fragments"],
      hiddenSoundTags: ["voices", "spaces", "memory"],
      hiddenMoodTags: []
    }
  ],

  netherlandsParks: [
    {
      title: "Sunday Afternoon in Vondelpark",
      location: "Vondelpark",
      country: "Netherlands",
      region: "North Holland",
      city: "Amsterdam",
      cityCountry: "Amsterdam, Netherlands",
      lat: 52.360126,
      lng: 4.873646,
      mapZoom: 17,
      description: "A Sunday afternoon in Vondelpark, Amsterdam's historic green retreat since 1865. Layers of birdsong fill the air as ducks splash in the water and distant conversations drift through the park. A gentle portrait of nature and everyday life in the heart of the city.",
      image: "",
      audio: "audio/Netherlands/Parks & Gardens/vondelpark.mp3",
      duration: "08:08",
      recordedDate: "OCT 2026",
      signatureSound: {
        label: "Birdsong",
        icon: "birds",
        story: "Birdsong gives this capsule its character, blending with ducks, water movement and distant conversations to create a lively but peaceful park atmosphere."
      },
      publicTags: ["parks", "birdsong", "ducks"],
      hiddenSoundTags: ["birdsong", "water splashing", "ducks", "distant conversations", "urban park", "waterfowl"],
      hiddenMoodTags: ["peaceful", "lively", "relaxing", "natural", "serene"]
    },
    {
      title: "The Sounds of Noordsterpark",
      location: "Noordsterpark",
      country: "Netherlands",
      region: "North Holland",
      city: "Wormerveer",
      cityCountry: "Wormerveer, Netherlands",
      lat: 52.500884,
      lng: 4.781957,
      mapZoom: 17,
      description: "Tucked into the residential neighbourhood of Wormerveer Noord, Noordsterpark offers a quiet green escape from everyday life. Birdsong and wind moving through the trees blend with the occasional sounds of people passing by, capturing the gentle rhythm of a small Dutch neighbourhood park.",
      image: "",
      audio: "audio/Netherlands/Parks & Gardens/the_sounds_of_noordsterpark.mp3",
      duration: "08:50",
      recordedDate: "OCT 2026",
      publicTags: ["parks", "birds", "wind", "Wormerveer"],
      hiddenSoundTags: ["birdsong", "wind", "rustling leaves", "distant footsteps", "passing pedestrians", "urban park", "ambience"],
      hiddenMoodTags: ["peaceful", "calm", "relaxing", "tranquil", "everyday life"]
    }
  ],

  netherlandsStreets: [
    {
      title: "Along the Zaan River",
      location: "Zaan River, Westzijde",
      country: "Netherlands",
      region: "North Holland",
      city: "Zaandam",
      cityCountry: "Zaandam, Netherlands",
      lat: 52.441376,
      lng: 4.823486,
      mapZoom: 17,
      description: "A quiet weekend along the Zaan River in Zaandam. Birdsong and rustling leaves blend with distant traffic and occasional passing voices. A curious fly briefly buzzes close to the microphone, adding a small, unexpected detail to this peaceful riverside soundscape.",
      image: "",
      audio: "audio/Netherlands/Streets/along_the_zaan_river.mp3",
      duration: "06:04",
      recordedDate: "OCT 2026",
      signatureSound: {
        label: "Birdsong",
        icon: "birds",
        story: "Birdsong is the clearest presence in this riverside capsule, weaving through leaves, distant traffic and quiet weekend voices along the Zaan."
      },
      publicTags: ["riverside", "birds", "wind", "Zaandam"],
      hiddenSoundTags: ["birdsong", "rustling leaves", "wind", "insect buzzing", "distant traffic", "distant conversations", "riverside ambience"],
      hiddenMoodTags: ["peaceful", "calm", "tranquil", "reflective"]
    },
    {
      title: "Along the Waterway to Jisp",
      location: "Weiver",
      country: "Netherlands",
      region: "North Holland",
      city: "Wormer",
      cityCountry: "Wormer, Netherlands",
      lat: 52.502198,
      lng: 4.847229,
      mapZoom: 17,
      description: "Between the villages of Wormer and Jisp, quiet roads follow the waterways that have shaped North Holland's landscape for centuries. Wind moves through the wild riverside vegetation, blending with gentle water sounds and the occasional passing car. A peaceful glimpse of everyday life in the Dutch countryside.",
      image: "",
      audio: "audio/Netherlands/Streets/along_the_waterway_to_jisp.mp3",
      duration: "04:38",
      recordedDate: "OCT 2026",
      signatureSound: {
        label: "Wind",
        icon: "wind",
        story: "Wind shapes the recording, moving through riverside vegetation and blending with water movement and the occasional passing car."
      },
      publicTags: ["waterway", "wind", "countryside", "Wormer"],
      hiddenSoundTags: ["wind", "rustling vegetation", "water movement", "distant traffic", "passing cars", "riverside", "ambience"],
      hiddenMoodTags: ["peaceful", "calm", "tranquil", "rural", "reflective"]
    },
    {
      title: "A Quiet Corner of Jisp",
      location: "Molenpad",
      country: "Netherlands",
      region: "North Holland",
      city: "Jisp",
      cityCountry: "Jisp, Netherlands",
      lat: 52.508042,
      lng: 4.847384,
      mapZoom: 17,
      description: "In the storybook village of Jisp, narrow waterways and little bridges lead to charming houses, creating a landscape seemingly untouched by time. Along a quiet corner of Molenpad, wind rustles through the riverside vegetation as occasional birdsong and distant traffic gently interrupt the stillness.",
      image: "",
      audio: "audio/Netherlands/Streets/a_quiet_corner_of_jisp.mp3",
      duration: "03:00",
      recordedDate: "OCT 2026",
      publicTags: ["village", "wind", "waterways", "Jisp"],
      hiddenSoundTags: ["wind", "rustling vegetation", "distant traffic", "passing cars", "bird calls", "riverside", "ambience"],
      hiddenMoodTags: ["peaceful", "serene", "quiet", "tranquil", "rural"]
    }
  ],

  netherlandsTransport: [],

  netherlandsWeather: [
    {
      title: "Wind Through the Reeds",
      location: "Speelplaats Talingstraat - Sternstraat",
      country: "Netherlands",
      region: "North Holland",
      city: "Wormer",
      cityCountry: "Wormer, Netherlands",
      lat: 52.501495,
      lng: 4.811370,
      mapZoom: 17,
      description: "In the small town of Wormer, where waterways and green landscapes have long shaped everyday life, a quiet riverside offers a moment of stillness. Wind rustles through the wild vegetation as distant crows occasionally break the silence, capturing the peaceful rhythm of North Holland's countryside.",
      image: "",
      audio: "audio/Netherlands/Weather/wind_through_the_reeds.mp3",
      duration: "07:22",
      recordedDate: "OCT 2026",
      signatureSound: {
        label: "Wind",
        icon: "wind",
        story: "Wind is the main movement in this capsule, rustling through wild riverside vegetation and carrying the quiet atmosphere of the North Holland countryside."
      },
      publicTags: ["riverside", "wind", "vegetation", "Wormer"],
      hiddenSoundTags: ["wind", "rustling vegetation", "distant crows", "bird calls", "riverside ambience"],
      hiddenMoodTags: ["peaceful", "quiet", "tranquil", "serene", "isolated"]
    }
  ],

  netherlandsVoices: []
};