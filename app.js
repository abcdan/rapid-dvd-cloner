const drivelist = require("drivelist");
const usbDetect = require("usb-detection");
const fs = require("fs");
const readline = require("readline");
const glob = require("glob");
const { exit } = require("process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let fileCount = 0;

async function incrementFileCount() {
  ++fileCount;
}

async function decrementFileCount() {
  --fileCount;
}

async function createDirectories(dvdName) {
  const baseDir = `./output/${dvdName}`;
  const videoTsDir = `${baseDir}/VIDEO_TS`;
  const videoRmDir = `${baseDir}/VIDEO_RM`;

  await fs.promises.mkdir(baseDir, { recursive: true });
  await fs.promises.mkdir(videoTsDir);
  await fs.promises.mkdir(videoRmDir);
}

async function copyFiles(files, dvdName, basePath) {
  for (const file of files) {
    incrementFileCount();
    const fileName = file.replace(basePath, "");
    const destination = `./output/${dvdName}/${fileName}`;

    fs.copyFile(file, destination, (err) => {
      if (err) console.log(err);
      decrementFileCount();
      console.log(`${fileName} done, ${fileCount} to go.`);

      if (fileCount === 0) {
        exit(0);
      }
    });
  }
}

async function processDrive(drive) {
  const basePath = drive.mountpoints[0].path;
  fs.readdir(basePath, (err, files) => {
    if (err) {
      console.log(err);
      return;
    }

    glob(`${basePath}/**`, async (err, files) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(files);
      const dvdName = await new Promise((resolve) =>
        rl.question("What's the name of the dvd? ", resolve)
      );

      await createDirectories(dvdName);
      copyFiles(files, dvdName, basePath);
    });
  });
}

async function main() {
  const drives = await drivelist.list();
  const filteredDrives = drives.filter((drive) => drive.size < 4654219776);

  for (const drive of filteredDrives) {
    console.log(drive.mountpoints[0].path);
    processDrive(drive);
  }
}

main();
