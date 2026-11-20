const signatureSoundAssetRoot = new URL("../assets/", document.currentScript.src);

const signatureSoundCategories = [
  { id: "bells", label: "Bells", icon: "bells", illustration: "bells" },
  { id: "birds", label: "Birds", icon: "birds", illustration: "birds" },
  { id: "chimes", label: "Chimes", icon: "chimes", illustration: "chimes" },
  { id: "crowd", label: "Crowd", icon: "crowd", illustration: "crowd" },
  { id: "music", label: "Music", icon: "music", illustration: "music" },
  { id: "nature", label: "Nature", icon: "nature", illustration: "nature" },
  { id: "rain", label: "Rain", icon: "rain", illustration: "rain" },
  { id: "seagulls", label: "Seagulls", icon: "seagulls", illustration: "seagulls" },
  { id: "traffic", label: "Traffic", icon: "traffic", illustration: "traffic" },
  { id: "transport", label: "Transport", icon: "transport", illustration: "transport" },
  { id: "waterfall", label: "Waterfall", icon: "waterfall", illustration: "waterfall" },
  { id: "wildlife", label: "Wildlife", icon: "wildlife", illustration: "wildlife" },
  { id: "wind", label: "Wind", icon: "wind", illustration: "wind" }
];

const signatureSoundImageChecks = new Map();

function normalizeSignatureSoundId(value) {
  if (typeof value !== "string") {
    return "";
  }

  const id = value.trim().toLowerCase().replace(/\s+/g, "-");
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ? id : "";
}

function getSignatureSoundDefinition(signatureSound) {
  if (!signatureSound) {
    return null;
  }

  const values = typeof signatureSound === "string"
    ? { category: signatureSound }
    : signatureSound;
  const categoryId = normalizeSignatureSoundId(
    values.category || values.icon || values.label
  );
  const category = signatureSoundCategories.find(function(item) {
    return item.id === categoryId;
  });
  const iconName = normalizeSignatureSoundId(values.icon) ||
    normalizeSignatureSoundId(category?.icon);
  const illustrationUrls = category?.illustration
    ? ["webp", "png"].map(function(extension) {
        return new URL(
          `illustrations/signature-sounds/${category.illustration}.${extension}`,
          signatureSoundAssetRoot
        ).href;
      })
    : [];

  return {
    categoryId,
    label: String(values.label || category?.label || values.category || "Signature Sound"),
    description: category?.description || "",
    illustrationUrls,
    iconUrl: iconName
      ? new URL(`icons/signature/${iconName}.svg`, signatureSoundAssetRoot).href
      : null
  };
}

function canLoadSignatureSoundImage(src) {
  if (!signatureSoundImageChecks.has(src)) {
    const check = new Promise(function(resolve) {
      const image = new Image();

      image.onload = function() {
        resolve(true);
      };

      image.onerror = function() {
        resolve(false);
      };

      image.src = src;
    });

    signatureSoundImageChecks.set(src, check);
  }

  return signatureSoundImageChecks.get(src);
}

async function resolveSignatureSoundVisual(signatureSound) {
  const definition = getSignatureSoundDefinition(signatureSound);

  if (!definition) {
    return null;
  }

  const candidates = definition.illustrationUrls.map(function(src) {
    return { type: "illustration", src };
  });

  if (definition.iconUrl) {
    candidates.push({ type: "icon", src: definition.iconUrl });
  }

  for (const candidate of candidates) {
    if (await canLoadSignatureSoundImage(candidate.src)) {
      return { ...definition, ...candidate };
    }
  }

  return { ...definition, type: "fallback", src: null };
}