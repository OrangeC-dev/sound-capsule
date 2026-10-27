const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(projectRoot, "js", "audio-dates.js");
const firstRun = !fs.existsSync(outputPath);
const previousDates = firstRun
  ? {}
  : vm.runInNewContext(fs.readFileSync(outputPath, "utf8") + "\naudioAddedAt;");
const audioDates = {};
const indexedAt = new Date().toISOString();
const extensions = new Set([".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".webm"]);

function scanAudio(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true })
    .sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });

  entries.forEach(function(entry) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      scanAudio(filePath);
      return;
    }

    if (!entry.isFile() || !extensions.has(path.extname(entry.name).toLowerCase())) {
      return;
    }

    const audioPath = path.relative(projectRoot, filePath).split(path.sep).join("/");
    const stats = fs.statSync(filePath);
    const initialDate = stats.birthtimeMs > 0 ? stats.birthtime : stats.mtime;

    audioDates[audioPath] = previousDates[audioPath] ||
      (firstRun ? initialDate.toISOString() : indexedAt);
  });
}

scanAudio(path.join(projectRoot, "audio"));
fs.writeFileSync(outputPath, `const audioAddedAt = ${JSON.stringify(audioDates, null, 2)};\n`);
console.log(`Indexed ${Object.keys(audioDates).length} audio files.`);