const path = require("path");
const fs = require("fs");

const imgFoldername = path.join(__dirname, "../img");
const outputFoldername = path.join(__dirname, "../scss/themes");


const svgFiles = fs.readdirSync(imgFoldername).filter(el => path.extname(el) === ".svg");

let cssTextBase64 = [];
let cssTextSVG = [];

try {

  svgFiles.forEach(svgFile => {
    console.log("\x1b[36m%s\x1b[0m", `Convert ${svgFile}`);

    const fileContent = fs.readFileSync(path.join(imgFoldername, svgFile));
    const svgData = fileContent.toString('utf-8')
      .replaceAll('"', "'")
      .replaceAll("\n", " ")
      .replaceAll("  ", "")
      .replaceAll("> <", "><")
      // .replaceAll("<", "%3C")
      // .replaceAll(">", "%3E")
      ;

    const iconName = path.basename(svgFile, path.extname(svgFile));

    cssTextSVG.push(`$icon-${iconName}: url("data:image/svg+xml;charset=UTF-8,${svgData}");`);
  });

  fs.writeFileSync(
    path.join(outputFoldername, "_icons.scss"),
    `// This file is auto-generated; use "npm run convert-icons" to update this file from the SVG icons in img/\n@use "../settings" as *;\n${cssTextSVG.join("\n")}`
  );

} catch(error) {
  console.error("\x1b[31m%s\x1b[0m", error.message);
}
