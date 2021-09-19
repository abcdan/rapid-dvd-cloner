/**
 * NOTE: I'm fully aware that this is the worst way to do this.
 * 
 * The code needs to be refactored to be more readable since it's a mess.
 * 
 * I just wanted to get this done.
 * 
 * Thanks for reading! I hope it works for you.
 */

// TODO: Remove the hardcoded /Volumes/SONY from the codebase
// TODO: Allow larger drives to be used
// TODO: Refactor the codebase to be more readable


const drivelist = require("drivelist");
var usbDetect = require("usb-detection");
const fs = require("fs");
const fse = require("fs-extra");
const readline = require("readline");
var copydir = require("copy-dir");
var diskdrive = require('diskdrive');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
var glob = require("glob");
const { exit } = require("process");

// usbDetect.startMonitoring();
// usbDetect.on('add', function(device) { console.log('add', device); });

let fileCount = 0;

async function incrementFileCount() {
    ++fileCount;
}

async function decrementFileCount() {
    --fileCount;
}
async function main() {
  const drives = await drivelist.list();

  for (let drive of drives) {
    if (drive.size < 4654219776 ) {
      console.log(drive.mountpoints[0].path);
      fs.readdir(drive.mountpoints[0].path, (err, files) => {
        if (err) {
          console.log(err);
        } else {
          glob(drive.mountpoints[0].path + "/**", function (err, files) {
            if (err) {
              console.log(err);
            } else {
              console.log(files);
              if(!files[0].startsWith('/Volumes/SONY')) return
              rl.question("What's the name of the dvd? ", function (dvdName) {
                fs.mkdir("./output/" + dvdName, function (err) {
                    if (err) console.log(err);

                  fs.mkdir("./output/" + dvdName + "/VIDEO_TS", function (err) {
                    if (err) console.log(err);
                    fs.mkdir(
                      "./output/" + dvdName + "/VIDEO_RM",
                      function (err) {
                        if (err) console.log(err);

                        for (let file of files) {
                        incrementFileCount()
                          console.log(file);
                          const fileName = file.replace(
                            drive.mountpoints[0].path,
                            ""
                          );
                          fs.copyFile(
                            file,
                            "./output/" + dvdName + "/" + fileName,
                            function (err) {
                                if (err) console.log(err);
                                decrementFileCount()
                              console.log(
                                fileName + " done, " + fileCount + " to go."
                              );

                              if(fileCount=== 0) {
                                diskdrive.eject();
                                exit(0)
                              }
                            }
                          );
                        }
                      }
                    );
                  });
                });
              });
            }
          });
        }

        // copydir(drive.mountpoints[0].path, './output/2002', function(err) {
        //     if(err) throw err
        //     console.log('done')
        // })
      });
    }
  }
}
//           rl.question("What's the name of the dvd? ", function (dvdName) {
//             // Make directory in output with dvdName
//             // fs.mkdir("./output/" + dvdName, (err) => {
//             //   console.log(err);
//             // //   fse.copySync(drive.mountpoints[0].path, './output/'+dvdName, function (err) {
//             // //     if (err) {
//             // //       console.error(err);
//             // //     } else {
//             // //       console.log("success!");
//             // //     }
//             // //   });
//             // });

//           });
//         }
//       });
//     }
//   }
// }

main();
