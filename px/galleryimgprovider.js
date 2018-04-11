/// <reference path="../../node_modules/dropbox/node_modules/es6-promise/dist/es6-promise.min.js" />
/// <reference path="~/Scripts/jquery-1.9.1.intellisense.js" />
function GalleryImage(author, path, name) {
    this.author = author;
    this.path = path;
    this.name = name;
    this.blobUrl = "";
}

function GalleryImgProvider() {
    this.ACCESS_TOKEN = "";
    this.BASE_FOLDER = "";
    this.galleryImages = new Array();
    this.galleryImagesCount = 0;

    this.currentImage = null;
    this.nextImageIndex = -1;
    this.nextImage = null;

    this.GetNextImage = function () {
        return new Promise((resolve, reject) => {

            if (this.nextImageIndex < this.galleryImagesCount - 1) {
                this.nextImageIndex += 1;
            } else {
                this.nextImageIndex = 0;
            }
            this.nextImage = this.galleryImages[this.nextImageIndex];

            if (localStorage[this.nextImage.name] === undefined) {
                this.downloadImage(this.nextImage.path).then(
                    (imgSrc) => {
                        localStorage[this.nextImage.name] = imgSrc;
                        this.nextImage.blobUrl = imgSrc;
                        resolve(this.nextImage);
                        //return;
                    }
                );
            }
            else {
                resolve(this.nextImage);
            }
        });

    };

    this.listFoldersContinue = function (cursor) {
        return new Promise((resolve, reject) => {
            var dbx = new Dropbox({
                accessToken: this.ACCESS_TOKEN
            });
            dbx.filesListFolderContinue({
                cursor: cursor
            })
                .then(function (response) {
                    //displayFiles(response.entries);
                    //console.log(response);
                    resolve(response.entries);

                })
                .catch(function (error) {
                    console.error(error);
                    reject(error);
                });
        });
    };

    this.getAllImages = function (files) {
        var p1 = new Promise((resolve, reject) => {
            this.galleryImages.length = 0;
            this.galleryImagesCount = 0;
            for (var i = 0; i < files.length; i++) {
                //Ignoring entries for folders
                if (files[i][".tag"] === "folder")
                    continue;

                //Assumes that author is in the folder name
                //Because of p1.bind, "this" will be scoped to the instance os GalleryImgProvider
                var author = files[i].path_display.replaceAll(this.BASE_FOLDER, "");
                author = author.replaceAll("/" + files[i].name, "");
                var galleryImg = new GalleryImage(author, files[i].id, files[i].name);
                this.galleryImages.push(galleryImg);
                this.galleryImagesCount += 1;
            }
            this.galleryImages = shuffle(this.galleryImages);
            resolve();
        });
        //p1.bind(this);
        return p1;
    }


    this.listFolders = function (path) {
        return new Promise((resolve, reject) => {
            if (path === undefined) {
                path = this.BASE_FOLDER;
            }
            var dbx = new Dropbox({
                accessToken: this.ACCESS_TOKEN
            });

            dbx.filesListFolder({
                path: path,
                recursive: true
            }
                )
                .then(function (filesListFolderResponse) {
                    //console.log(filesListFolderResponse);
                    resolve(filesListFolderResponse.cursor);
                })
                .catch(function (error) {
                    console.error(error);
                    reject(error);
                });
        });
    };



    this.downloadImage = function (path) {
        return new Promise((resolve, reject) => {
            var dbx = new Dropbox({
                accessToken: this.ACCESS_TOKEN
            });
            //More info: http://dropbox.github.io/dropbox-sdk-js/global.html#FilesDownloadArg
            dbx.filesDownload({
                path: path
            }).then(function (data) {
                var imgSrc = window.URL.createObjectURL(data.fileBlob);
                var img = $("#dummyImgElement");
                img.attr("src", imgSrc);
                img.hide();
                resolve(imgSrc);
            }).catch(function (error) {
                //window.URL.revokeObjectURL(this.src);
                console.error(error);
            });
            return false;
        });
    }
}

String.prototype.replaceAll = function (strReplace, strWith) {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return this.replace(reg, strWith);
};

//Source:http://stackoverflow.com/a/2450976
function shuffle(array) {

    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}