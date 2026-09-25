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
  }
];

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
  ]
};